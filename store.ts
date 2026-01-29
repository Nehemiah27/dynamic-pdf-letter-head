import {
  AppState,
  Branding,
  WorkflowType,
  Quotation,
  Section,
  DbConfig,
  Client,
  Project,
  User,
  Invoice,
  InvoiceItem,
} from "./types";

const AUTH_TOKEN_KEY = "revira_auth_token";
const MOCK_STORAGE_KEY = "revira_mongo_simulation";

const INITIAL_BRANDING: Branding = {
  logo: "https://reviranexgen.com/assets/logo-with-name.png",
  logoBackgroundColor: "#ffffff",
  headerImage: "https://reviranexgen.com/assets/header.jpg",
  footerImage: "https://reviranexgen.com/assets/footer.jpg",
  headerText: "Blueprint of Commitment - Client Delight.",
  footerText: "This is a computer generated document.",
  stampSignature: "https://reviranexgen.com/assets/stamp.png",
  brandColor: "#2E3191",
  registry: {
    name: "Revira NexGen Structure Pvt. Ltd.",
    cin: "U16222DL2025PTC459465",
    email: "info@reviranexgen.com",
    website: "www.reviranexgen.com",
    regionalAddress: "Plot No. 302, 3rd Floor Rajat Residency, Nagpur",
    headOfficeAddress: "28, E2 Block, Shivram Park Nangloi Delhi - 110041",
    nagpurOffice:
      "Flat No. 302, 3rd Floor Rajat Residency, Subharambha Society Near Toll Naka, Dabha, Nagpur 440023",
    delhiOffice: "28, E2 Block, Shivram Park Nangloi Delhi - 110041",
    phone1: "+91 839 049 1843",
    phone2: "+91 99684 22442",
    gstin: "22AOBPA5409G1ZO",
  },
};

const DEFAULT_CLIENT: Client = {
  id: "default-client-001",
  name: "REVIRANEXGEN STRUCTURES PVT. LTD",
  address: "Delhi",
  gstin: "09ABCDS1234A1Z5",
  contactPerson: "Hareram Sharma",
  email: "hareram.sharma@reviranexgen.com",
  phone: "9968422442",
  createdAt: new Date().toISOString(),
};

const INITIAL_DB_CONFIG: DbConfig = {
  uri: "mongodb://revira_admin:2b0YlZxL79D@66.116.205.151:39004",
  dbName: "revira_local_compass",
  apiEndpoint: "/revira/api",
  status: "Disconnected",
  lastSync: new Date().toISOString(),
};

// --- Helpers ---
export const getCurrentDateStr = () => {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  return `${d}-${m}-${y}`;
};

export const getMonthYearStr = () => {
  const now = new Date();
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  return `${months[now.getMonth()]}-${now.getFullYear()}`;
};

const formatVersion = (v: number) => String(v).padStart(3, "0");

// --- Simulated MongoDB Persistence (Fallback) ---
const getMockState = (): Partial<AppState> => {
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  if (!stored) {
    const initialState: Partial<AppState> = {
      clients: [DEFAULT_CLIENT],
      projects: [],
      quotations: [],
      invoices: [],
      users: [
        {
          id: "master-admin",
          name: "Hareram Sharma",
          email: "admin@reviranexgen.com",
          role: "Administrator",
          password: "admin123",
          assignedClientIds: [],
        },
      ],
    };
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }
  return JSON.parse(stored);
};

const updateMockState = (updates: Partial<AppState>) => {
  const current = getMockState();
  localStorage.setItem(
    MOCK_STORAGE_KEY,
    JSON.stringify({ ...current, ...updates }),
  );
};

// --- API Service Implementation ---
const getHeaders = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const NestApiService = {
  setToken: (token: string | null) => {
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
    else localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  request: async (path: string, method: string = "GET", body?: any) => {
    try {
      const res = await fetch(`${INITIAL_DB_CONFIG.apiEndpoint}${path}`, {
        method,
        headers: getHeaders(),
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (!res.ok) throw new Error(`Server Response: ${res.status}`);
      return await res.json();
    } catch (e: any) {
      if (e.message === "Failed to fetch" || e.name === "TypeError") {
        const mockData = getMockState();
        const collection = path.split("/")[1] as keyof AppState;

        if (method === "GET") {
          if (path === "/branding")
            return mockData.branding || INITIAL_BRANDING;
          const list = (mockData[collection] as any[]) || [];
          if (collection === "clients" && list.length === 0)
            return [DEFAULT_CLIENT];
          return list;
        }

        if (method === "POST") {
          const newItem = {
            ...body,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
          };
          const list = (mockData[collection] as any[]) || [];
          updateMockState({ [collection]: [...list, newItem] });
          return newItem;
        }

        if (method === "PATCH" || method === "PUT") {
          const id = path.split("/").pop();
          const list = (mockData[collection] as any[]) || [];
          const updatedList = list.map((item: any) =>
            item.id === id ? { ...item, ...body } : item,
          );
          updateMockState({ [collection]: updatedList });
          const updatedItem = updatedList.find((i: any) => i.id === id);
          return updatedItem || { ...body, id };
        }

        if (method === "DELETE") {
          const id = path.split("/").pop();
          const list = (mockData[collection] as any[]) || [];
          updateMockState({
            [collection]: list.filter((item: any) => item.id !== id),
          });
          return { success: true };
        }
      }
      throw e;
    }
  },

  login: async (email: string, password: string) => {
    try {
      const res = await fetch(`${INITIAL_DB_CONFIG.apiEndpoint}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Unauthorized Access");
      return res.json();
    } catch (e: any) {
      if (e.message === "Failed to fetch" || e.name === "TypeError") {
        const mockData = getMockState();
        const user = mockData.users?.find(
          (u) => u.email === email && u.password === password,
        );
        if (user) {
          return {
            user: { ...user },
            token: `simulated-jwt-${user.id}`,
          };
        }
        if (email === "admin@reviranexgen.com" && password === "admin123") {
          return {
            user: {
              id: "master-admin",
              name: "Hareram Sharma",
              email: "admin@reviranexgen.com",
              role: "Administrator",
              assignedClientIds: [],
            },
            token: "simulated-jwt-master",
          };
        }
        throw new Error("Invalid Credentials (Simulation Mode)");
      }
      throw e;
    }
  },

  getUsers: () => NestApiService.request("/users"),
  saveUser: (user: User) => NestApiService.request("/users", "POST", user),
  updateUser: (id: string, updates: Partial<User>) =>
    NestApiService.request(`/users/${id}`, "PATCH", updates),
  deleteUser: (id: string) => NestApiService.request(`/users/${id}`, "DELETE"),

  getClients: () => NestApiService.request("/clients"),
  saveClient: (client: Client) =>
    NestApiService.request("/clients", "POST", client),
  updateClient: (id: string, updates: Partial<Client>) =>
    NestApiService.request(`/clients/${id}`, "PATCH", updates),
  deleteClient: (id: string) =>
    NestApiService.request(`/clients/${id}`, "DELETE"),

  getProjects: () => NestApiService.request("/projects"),
  saveProject: (project: Project) =>
    NestApiService.request("/projects", "POST", project),
  updateProject: (id: string, updates: Partial<Project>) =>
    NestApiService.request(`/projects/${id}`, "PATCH", updates),
  deleteProject: (id: string) =>
    NestApiService.request(`/projects/${id}`, "DELETE"),

  getQuotations: () => NestApiService.request("/quotations"),
  saveQuotation: (quote: Quotation) =>
    NestApiService.request("/quotations", "POST", quote),
  updateQuotation: (id: string, updates: Partial<Quotation>) =>
    NestApiService.request(`/quotations/${id}`, "PATCH", updates),
  deleteQuotation: (id: string) =>
    NestApiService.request(`/quotations/${id}`, "DELETE"),

  getInvoices: () => NestApiService.request("/invoices"),
  saveInvoice: (inv: Invoice) =>
    NestApiService.request("/invoices", "POST", inv),
  updateInvoice: (id: string, updates: Partial<Invoice>) =>
    NestApiService.request(`/invoices/${id}`, "PATCH", updates),
  deleteInvoice: (id: string) =>
    NestApiService.request(`/invoices/${id}`, "DELETE"),

  getBranding: () => NestApiService.request("/branding"),
  updateBranding: (branding: Branding) =>
    NestApiService.request("/branding", "PATCH", branding),
};

export const loadState = async (): Promise<AppState> => {
  let isServerUp = false;
  try {
    const res = await fetch("/health");
    isServerUp = res.ok;
  } catch (e) {}

  const [users, clients, projects, quotations, invoices, branding] =
    await Promise.all([
      NestApiService.getUsers().catch(() => []),
      NestApiService.getClients().catch(() => [DEFAULT_CLIENT]),
      NestApiService.getProjects().catch(() => []),
      NestApiService.getQuotations().catch(() => []),
      NestApiService.getInvoices().catch(() => []),
      NestApiService.getBranding().catch(() => INITIAL_BRANDING),
    ]);

  return {
    currentUser: null,
    token: localStorage.getItem(AUTH_TOKEN_KEY),
    users,
    clients,
    projects,
    quotations,
    invoices,
    branding,
    dbConfig: {
      ...INITIAL_DB_CONFIG,
      status: isServerUp ? "Connected" : "Disconnected",
    },
  };
};

const STANDARD_CLOSING = `We hope you’ll find our offer in line with your requirement & place your valued PO on us giving us an opportunity to serve you.\n\nHowever, please feel free to contact us for any sort of additional information that you may feel is required pertaining to this offer. We assure you our best support at all times.`;

// --- PDF-Specific Specialized Quotation Templates ---

export const createSupplyAndFabricationTemplate = (
  projectId: string,
  version: number,
  clientName: string,
  location: string,
): Quotation => {
  const verStr = formatVersion(version);
  return {
    id: "",
    projectId,
    version,
    status: "Draft",
    workflow: WorkflowType.SUPPLY_AND_FABRICATION,
    refNo: `RNS/${getMonthYearStr()}/${clientName}/RNS-${verStr}`,
    date: getCurrentDateStr(),
    enquiryNo: `RNS-PEB - RNS-001`,
    location: location || "Project Location",
    subject: "Supply & erection of Steel Structures for PEB Shed",
    salutation: "Dear Sir,",
    introText: "Techno-Commercial Offer",
    introBody:
      "We are pleased to submit our proposal for the supply & erection of steel Structure against your subject enquiry.\n\nOur area of expertise is in complete design, manufacture, installation & commissioning of Heavy Structural Fabrication & Pre-Engineered Building.\n\nThis proposal is detailed for your ready reference and includes scope of supply, building description, design loads/criteria, material specifications, time delivery, etc complete.",
    closingBody: STANDARD_CLOSING,
    recipientName: `${clientName}`,
    recipientAddress: "",
    recipientContactPerson: "",
    recipientPhone: "",
    recipientEmail: "",
    priceNotes:
      "• Above mentioned rates are quoted on the basis of inputs received and designed accordingly.\n• The above quoted rates are including transportation and excluding GST @ 18%.\n• Weight may vary ±5%",
    bankDetails:
      "Account holder: REVIRA NEXGEN STRUCTURES PRIVATE LIMITED | Bank Name: YES Bank | A/C No.: 073361900002657 | IFSC Code: YESB0000733",
    sections: [
      {
        id: "s1",
        title: "1.0 - SCOPE OF SUPPLY - Brief Details",
        type: "table",
        headers: ["Sr. No.", "Description", "Details"],
        columnWidths: [21, null, null],
        rows: [
          ["1", "Building Nos.", "01"],
          ["2", "Building Description", "PEB Shed"],
          ["3", "Building built-up Area", "15494 SQF"],
        ],
        items: [],
        content: "",
      },
      {
        id: "s1_basic",
        title: "1.0 - Basic Building Description",
        type: "table",
        headers: ["Sr. No.", "Description", "Details"],
        columnWidths: [21, null, null],
        rows: [
          ["1", "Frame Type", "RF/MF"],
          ["2", "Length (M)", "36"],
          ["3", "Width (M) or Span", "21"],
          ["4", "Clear Height (M)", "9.0"],
          ["5", "Brick Wall Height (M)", "3.0"],
          ["6", "Side wall Column Spacing (M)", "As Per Drawing"],
          ["7", "Roof Slope", "1:10"],
          ["8", "End Wall Column Spacing (M)", "As Per GA"],
          ["9", "Bay Spacing (M)", "As Per GA"],
          ["10", "Type of end frames", "Non-Expandable Frames"],
          ["11", "Wind bracing", "As per GA drawing"],
          ["12", "Roof cladding", "As per GA drawing"],
          ["13", "Wall cladding", "As per GA drawing"],
          ["14", "Openings at North wall", "As per GA drawing"],
          ["15", "Openings at South wall", "As per GA drawing"],
          ["16", "Openings at East wall", "As per GA drawing"],
          ["17", "Openings at West wall", "As per GA drawing"],
          ["18", "Curved Eaves", "As per GA"],
          ["19", "Gutters", "As per approved drawing"],
          ["20", "Eave Trim", "As per approved drawing"],
          ["21", "Downspouts", "As per approved drawing"],
          ["22", "Canopy", "As per approved drawing"],
          ["23", "Partition wall", "As per approved drawing"],
          ["24", "Polycarbonate skylights", "As per GA Drawing/Specifications"],
          ["25", "Turbo Ventilators", "As per GA Drawing/Specifications"],
        ],
        items: [],
        content: "",
      },
      {
        id: "s_additions",
        title:
          "Standard Building Additions (Canopy / Fascia / Liner / Partitions)",
        type: "table",
        headers: ["Sr. No.", "Description", "PEB SHED"],
        columnWidths: [21, null, null],
        rows: [
          ["1", "Canopy - Location/", "As per approved drawing"],
          ["2", "Framed openings", "As per approved drawing"],
        ],
        items: [],
        content: "",
      },
      {
        id: "s2",
        title: "2.0 - STEEL WORK FINISH",
        type: "table",
        headers: ["Sr. No.", "Description", "Details"],
        columnWidths: [21, null, null],
        rows: [
          [
            "1",
            "Welding",
            "Continuous FCAW welding along with Intermediate, AWS D1.1",
          ],
          [
            "2",
            "Frames, Built-up / HR sections/Bracings",
            "Mechanical Cleaning with swipe blast on heavy mill scale and one coat of primer and one coat of Finish Enamel paint",
          ],
          ["3", "Purlins / Girts", "ASTM A653"],
          [
            "4",
            "Profile sheets",
            "Bare-0.47 mm thk and colour -0.5 mm thk blue RAL5012",
          ],
        ],
        items: [],
        content: "",
      },
      {
        id: "s3",
        title: "3.0 - DESIGN LOADS",
        type: "table",
        headers: ["Sr. No.", "Description", "PEB SHED"],
        columnWidths: [21, null, null],
        rows: [
          ["1", "Dead load", "0.15 KN/M2"],
          ["2", "Live load", "0.57 KN/M2"],
          ["3", "Crane Capacity", "-"],
          ["4", "Wind load (Kmph or m/sec)", "44 M/sec"],
          ["5", "Mezzanine Load -Kg/SQM", "-"],
          ["6", "Slab Thickness ( MM )", "-"],
          ["7", "Seismic load (Zone no.)", "III"],
        ],
        items: [],
        content: "",
      },
      {
        id: "s4",
        title: "4.0 - APPLICABLE CODES",
        type: "list",
        headers: [],
        rows: [],
        items: [
          "Frame members are designed in accordance with AISC-LRFD (American Institute of Steel Construction).",
          "Cold Formed members are designed in accordance with the AISC For Use of Cold-Formed Light Gauge Steel Structural Member’s In General Building Construction.",
          "Deflection as per IS 800-2007.",
          "All welding is done in accordance with the 2000 Edition of the American Welding Society (AWS D1.1).",
          "Structural Welding Code-Steel. All Welders are qualified for the type of welds performed.",
          'Manufacturing dimensional tolerances are in accordance with the requirements of the 1996 Edition of the Metal Building Manufacturer Association (MBMA)of the USA.; "Low rise building systems Manual"',
        ],
        content: "",
      },
      {
        id: "s5",
        title: "5.0 - MATERIAL SPECIFICATIONS",
        type: "table",
        headers: ["Sr. No.", "Structural Components", "Details", "Codes"],
        columnWidths: [21, null, null, null],
        rows: [
          [
            "1",
            "Primary Members Built up sections (Make – SAIL/JINDAL/TATA)",
            "Plates",
            "Min. Y.S. 350 MPA",
          ],
          [
            "2",
            "Hot Rolled Sections (Make – TAT/Apollo/ SAIL)",
            "Channel s",
            "IS: 2062 / a 572, Grade 36, Min. Y.S. 250 MPA",
          ],
          ["", "", "Angles", "IS: 2062 / a 572, Grade 36, Min. Y.S. 250 MPA"],
          [
            "",
            "",
            "Pipes",
            "IS: 1161, IS: 1239 / A 572, Grade 36, Min. Y.S. 250 MPA",
          ],
          [
            "3",
            "Purlins/Girts (Make – JSW/TATA)",
            "Hollow section",
            "ASTM A653",
          ],
          ["4", "Anchor bolts", "IS 2062 E250A", "IS 2062 E250A"],
          [
            "5",
            "Primary Connection bolts Electroplated/ Pre galvanised",
            "High Strength Bolts, IS: 1367 / 8.8 Grade",
            "High Strength Bolts, IS: 1367 / 8.8 Grade",
          ],
          [
            "6",
            "Secondary connection bolts Pre galvanised",
            "",
            "Bolt as per ASTM A 325, Grade 4.6",
          ],
        ],
        items: [],
        content: "",
      },
      {
        id: "s6",
        title: "6.0 - DRAWINGS & DELIVERY",
        type: "list",
        headers: [],
        rows: [],
        items: [
          "DNSPL will issue shop Approval Drawings within 1 week from date of signing contract/issue of Purchase Order and receipt of advance payment.",
          "BUYER must return the accepted approval drawings preferably within 1 week thereafter; otherwise, may result in revision to delivery commitment.",
          "Anchor bolts & Layout drawings for fixing anchor bolts will be provided within 10 days from the date of receipt of Advance payment.",
          "Dispatch of materials will start as per agreed time frame from the date of receipt of signed Approval drawings with receipt of payment as per agreed terms.",
        ],
        content: "",
      },
      {
        id: "s7_client",
        title: "7.0 - ERECTION SCOPES - Scope of Client",
        type: "list",
        headers: [],
        rows: [],
        items: [
          "After completion of Anchor bolt fixing, back filling of the murum up to the FFL level & rolling is under the scope of the client. Anchor bolt shall be provided to site and fixing in present our engineer at site only.",
          "Minimum 15 days curing time is to be given after Anchor Bolt Casting is done.",
          "Free Power and water to be provided close to site.",
          "If power not available, DG has to be provided.",
          "We assumed that, crane can move inside the proposed building while erecting the main frames.",
          "Security of the material is under the scope of the client.",
          "Shelter/accommodation to be provided to the workers till completion of the work.",
        ],
        content: "",
      },
      {
        id: "s7_company",
        title: "7.0 - ERECTION SCOPES - Scope of Company",
        type: "list",
        headers: [],
        rows: [],
        items: [
          "Unloading and stacking of the material at site, Erection of material as per DNSPL specifications.",
          "Anchor Bolt Supply & Periodic Supervision is in our Scope.",
          "Alignment of columns and rafters.",
          "Plumb and checking water level of columns & Portal frame.",
          "Cleaning and touch up paint work for the structure on damaged surfaces during transportation and site movement.",
          "Alignment of Purlins and Girts.",
          "Fixing of roof sheeting, wall sheeting and accessories",
        ],
        content: "",
      },
      {
        id: "s8",
        title: "8.0 - COMMERCIAL PRICE",
        type: "table",
        headers: [
          "Sr. No.",
          "Description",
          "UOM",
          "QTY",
          "Rate",
          "Basic Amount Rs",
          "Remarks",
        ],
        columnWidths: [21, 60, 20, 20, 25, 30, 30],
        rows: [
          [
            "1",
            "Design, Supply, Fabrication, Painting, Profile sheets and Erection including Transportation.",
            "MT",
            "34.75",
            "125000/-",
            "4343750/-",
            "AISC Standard",
          ],
          [
            "2.",
            "Turbo ventilator with Base",
            "Each",
            "1",
            "6500/-",
            "Optional",
            "2.",
          ],
          [
            "3.",
            "Polycarbonate 2 mm thk (3.2 mtr)",
            "Each",
            "1",
            "6000/-",
            "Optional",
            "3.",
          ],
        ],
        items: [],
        content: "",
      },
      {
        id: "s8_notes",
        title: "Notes",
        type: "list",
        headers: [],
        rows: [],
        items: [
          "Above mentioned rates are quoted on the basis of inputs received and designed accordingly.",
          "The above quoted rates are including transportation and excluding GST @ 18%.",
          "Weight may vary ±5%",
        ],
        content: "",
      },
      {
        id: "s8_bank",
        title: "BANK DETAILS",
        type: "table",
        headers: ["Particulars", "Value"],
        columnWidths: [40, null],
        rows: [
          ["Account holder:", "REVIRA NEXGEN STRUCTURES PRIVATE LIMITED"],
          ["Bank Name:", "YES Bank"],
          ["A/C No.:", "073361900002657"],
          ["IFSC Code:", "YESB0000733"],
        ],
        items: [],
        content: "",
      },
      {
        id: "s9",
        title: "9.0 - COMMERCIAL TERMS & CONDITIONS",
        type: "table",
        headers: ["Sr. No.", "Description", "Conditions"],
        columnWidths: [21, 40, null],
        rows: [
          [
            "1",
            "Payment Terms including taxes",
            "Supply and Erection amount:\n1. 20% advance on confirmation of order/PO/Signed contract.\n2. 40% after finalisation & submission of detailed GA drawing\n3. 30% before dispatch of material on Proforma Invoice.\n4. 5% after Structure Erection\n5. 5 % after Building Handing over",
          ],
          [
            "2",
            "Delivery period",
            "Delivery as per mutually agreed from the date of receipt of signed approved drawings and receipt of payment as per agreed terms.",
          ],
          [
            "3",
            "Erection period",
            "Erection Period as per mutually agreed after delivery of complete material.",
          ],
          ["4", "GST", "Extra @ 18% for supply and Erection both."],
          [
            "5",
            "Scope of contract",
            "This Contract is the only Agreement between the DNG (hereinafter referred to as SELLER) & BUYER (who has signed his acceptance on this contract) and the terms which have been Expressly stated in this Agreement will be binding including any amendments mutually agreed upon in writing.",
          ],
          [
            "6",
            "Proposal validity",
            "This proposal is valid for (5) days from the date of this proposal. Any extension of validity must be received in writing from the SELLER.",
          ],
          [
            "7",
            "Erection drawing",
            "“DNSPL” the DNSP will furnish the BUYER with all standard erection drawings required for the erection of the buildings.",
          ],
          [
            "8",
            "Specification changes",
            "SELLER reserve the right to modify the design of his standard buildings and to substitute material equal to or superior to that originally specified (in order to permit incorporation of changes and improvements, in the continued development of the SELLER's product).",
          ],
          [
            "9",
            "Change in scope",
            "Any change and/or revision to the above stated scope of supply may lead to a variation in the price and the delivery period.",
          ],
          [
            "10",
            "Our liability",
            "DNSPL’s liability is restricted to the scope of this contract only and it will not be responsible for acts of third parties. Consequential losses and third-party damages, if any, arising out of the delays or claims by the BUYER will not be SELLER’S responsibility",
          ],
          [
            "11",
            "Ownership Of Un Approved Material at Site",
            "All material supplied to site by DNSPL, which are unapproved and in excess of building requirements shall be the property of DNSPL and DNSPL reserves the right to ship the same back to its place.",
          ],
          [
            "12",
            "Warranty",
            "Products supplied by DNSPL are warranted against any failure due to defective material & workmanship for a period of One year.",
          ],
          [
            "13",
            "Permits",
            "The SELLER shall not be responsible or liable for the obtaining of permits to erect or install any product at BUYER’S site.",
          ],
          [
            "14",
            "Force Majeure",
            "The SELLER shall not be liable for any loss or damage to the BUYER for the delay in delivery or cancellation of any Purchaser's Orders by The SELLER due to circumstances beyond The SELLER’S control, such as but not limited to, war, riots, civil commotion, pandemic restriction by local and central government authorities, government regulations, orders, or acts of any government authority directly or indirectly interfering with or rendering more burdensome the production, transportation, delivery and erection of the products, floods, fires, delays due to transporter's strike and any other circumstance or event beyond SELLER’S control.",
          ],
          [
            "15",
            "Weighment",
            "The weight (in Kg/Tonnage) of the material shipped and mentioned in the SELLER’S “Bill of Supply” will be final and binding for all billing and payment purposes. Any variation in Kg/Tonnage at the Buyer’s end on receipt of material, will be to the Transporter’s account.",
          ],
          [
            "16",
            "Safety, Security and proper space at site for shipped material",
            "The BUYER shall provide the SELLER a secured area for unloading and storing all material of the order. In situations where the site is in a remote location, then the BUYER shall provide the necessary Security and accommodate a secure lockable room to store small items of the order at the site.",
          ],
          [
            "17",
            "Exclusions",
            "Anything and apart from above not mentioned in the offer.",
          ],
        ],
        items: [],
        content: "",
      },
    ],
    regardsName: "Hareram R Sharma",
    regardsPhone: "8390491843",
    regardsEmail: "Hareram.sharma@divinenexgen.com",
    createdAt: new Date().toISOString(),
  };
};

export const createStructuralFabricationTemplate = (
  projectId: string,
  version: number,
  clientName: string,
  location: string,
): Quotation => {
  const verStr = formatVersion(version);
  return {
    id: "",
    projectId,
    version,
    status: "Draft",
    workflow: WorkflowType.STRUCTURAL_FABRICATION,
    refNo: `RNS/${getMonthYearStr()}/${clientName}/RNS-SF-${verStr}`,
    date: getCurrentDateStr(),
    enquiryNo: `RNS-SF- RNS-001`,
    location: location || "Project Site",
    subject: "Structural fabrication of Steel Structures",
    salutation: "Dear Sir,",
    introText: "Techno-Commercial Offer",
    introBody:
      "We are pleased to submit our proposal for the supply & erection of steel Structure against your subject enquiry.\n\nOur area of expertise is in complete design, manufacture, installation & commissioning of Heavy Structural Fabrication & Pre-Engineered Building.",
    closingBody: STANDARD_CLOSING,
    recipientName: `${clientName}`,
    recipientAddress: "",
    recipientContactPerson: "",
    recipientPhone: "",
    recipientEmail: "",
    priceNotes: "• GST @ 18% Extra.\n• Billing as per BOQ.",
    bankDetails: "YES BANK | A/C: 073361900002657 | IFSC: YESB0000733",
    sections: [
      {
        id: "s1",
        title: "COMMERCIAL PRICE & PAYMENT TERMS",
        type: "table",
        headers: [
          "Sr. No.",
          "Description",
          "Unit",
          "Quantity.",
          "Rate",
          "Amount",
          "Remarks",
        ],
        columnWidths: [21, 60, 20, 20, 25, 30, 30],
        rows: [
          [
            "1",
            "Fabrication of Structural steel hot rolled section",
            "Rs/MT",
            "600",
            "7440/-",
            "4464000/-",
            "N.",
          ],
        ],
        items: [],
        content: "",
      },
      {
        id: "s2",
        title: "Payment Terms",
        type: "list",
        headers: [],
        rows: [],
        items: [
          "15% advance on confirmation of Worder before Labour mobilization.",
          "85% after fabrication Completion",
        ],
        content: "",
      },
      {
        id: "s3",
        title: "Notes",
        type: "list",
        headers: [],
        rows: [],
        items: [
          "Above mentioned rates are quoted on the basis of inputs received and discussion.",
          "GST @ 18% Extra.",
          "Billing as per BOQ.",
          "No third-party inspection or any inspection charges bear by the Revira Nexgen.",
          "NDT test will be performed at shop only and excluding all machines, testing and consumables",
          "Closed workshop area to be provided for work by M/s Apex with fully equipped light and ventilations.",
          "All Machines, Hydra, EOT cranes, raw materials, consumables, bed material. Skids for fabrication.",
          "Detailing to be provided by M/s Apex.",
          "All shop drawing, BOQ, LOT SUMMARY to be provided by M/s Apex.",
        ],
        content: "",
      },
      {
        id: "s4_bank",
        title: "BANK DETAILS",
        type: "table",
        headers: ["Particulars", "Value"],
        columnWidths: [40, null],
        rows: [
          ["Account holder:", "REVIRA NEXGEN STRUCTURES PRIVATE LIMITED"],
          ["Bank Name:", "YES Bank"],
          ["A/C No.:", "073361900002657"],
          ["IFSC Code:", "YESB0000733"],
        ],
        items: [],
        content: "",
      },
    ],
    regardsName: "Hareram R Sharma",
    regardsPhone: "8390491843",
    regardsEmail: "Hareram.sharma@divinenexgen.com",
    createdAt: new Date().toISOString(),
  };
};

export const createJobWorkTemplate = (
  projectId: string,
  version: number,
  clientName: string,
  location: string,
): Quotation => {
  const verStr = formatVersion(version);
  return {
    id: "",
    projectId,
    version,
    status: "Draft",
    workflow: WorkflowType.JOB_WORK,
    refNo: `RNS/${getMonthYearStr()}/${clientName}/RNS-JW-${verStr}`,
    date: getCurrentDateStr(),
    enquiryNo: `RNS-JW- RNS-001`,
    location: location || "Workshop Location",
    subject: "Job Work of Steel Structures",
    salutation: "Dear Sir,",
    introText: "Techno-Commercial Offer",
    introBody:
      "We are pleased to submit our proposal for the supply & erection of steel Structure against your subject enquiry on job work basis.",
    closingBody: STANDARD_CLOSING,
    recipientName: `${clientName}`,
    recipientAddress: "",
    recipientContactPerson: "",
    recipientPhone: "",
    recipientEmail: "",
    priceNotes: "• GST @ 18% Extra.\n• Material wastage ±2%.",
    bankDetails: "YES BANK | A/C: 073361900002657 | IFSC: YESB0000733",
    sections: [
      {
        id: "s1",
        title: "COMMERCIAL PRICE & PAYMENT TERMS",
        type: "table",
        headers: [
          "Sr. No.",
          "Description",
          "Unit",
          "Quantity.",
          "Rate",
          "Amount",
          "Remarks",
        ],
        columnWidths: [21, 60, 20, 20, 25, 30, 30],
        rows: [
          [
            "1",
            "Fabrication of Structural steel (Job Work)",
            "Rs/MT",
            "600",
            "7440/-",
            "4464000/-",
            "N.",
          ],
        ],
        items: [],
        content: "",
      },
      {
        id: "s2_bank",
        title: "BANK DETAILS",
        type: "table",
        headers: ["Particulars", "Value"],
        columnWidths: [40, null],
        rows: [
          ["Account holder:", "REVIRA NEXGEN STRUCTURES PRIVATE LIMITED"],
          ["Bank Name:", "YES Bank"],
          ["A/C No.:", "073361900002657"],
          ["IFSC Code:", "YESB0000733"],
        ],
        items: [],
        content: "",
      },
    ],
    regardsName: "Hareram R Sharma",
    regardsPhone: "8390491843",
    regardsEmail: "Hareram.sharma@divinenexgen.com",
    createdAt: new Date().toISOString(),
  };
};

export const createInvoiceTemplate = (
  projectId: string,
  version: number,
  client: Client,
  piNo: string,
): Invoice => {
  return {
    id: "",
    projectId,
    version,
    status: "Draft",
    piNo,
    date: getCurrentDateStr(),
    clientName: client.name,
    registeredAddress: client.address,
    consigneeAddress: client.address,
    gstin: client.gstin,
    woNo: "TBD",
    dispatchDetails: "BY ROAD",
    items: [
      {
        id: "initial-item-" + Math.random().toString(36).substr(2, 9),
        description: "PEB",
        hsnCode: "-",
        qty: 1,
        uom: "LS",
        ratePerKg: "60000",
        percentage: "100",
        rate: 60000,
        amount: 60000,
      },
    ],
    taxType: "Intra-State",
    bankDetails: {
      accountName: "Revira NexGen Structure Pvt. Ltd.",
      address: "28 E2 Block, Shivram Park, Nangloi Delhi 110041",
      accountNumber: "073361900002657",
      ifscCode: "YESB0000733",
    },
    regardsName: "Hareram Sharma",
    amountInWords: "",
    createdAt: new Date().toISOString(),
  };
};
