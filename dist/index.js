// index.tsx
import React13 from "react";
import ReactDOM from "react-dom/client";

// store.ts
var AUTH_TOKEN_KEY = "revira_auth_token";
var MOCK_STORAGE_KEY = "revira_mongo_simulation";
var INITIAL_BRANDING = {
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
    nagpurOffice: "Flat No. 302, 3rd Floor Rajat Residency, Subharambha Society Near Toll Naka, Dabha, Nagpur 440023",
    delhiOffice: "28, E2 Block, Shivram Park Nangloi Delhi - 110041",
    phone1: "+91 839 049 1843",
    phone2: "+91 99684 22442",
    gstin: "22AOBPA5409G1ZO"
  }
};
var DEFAULT_CLIENT = {
  id: "default-client-001",
  name: "REVIRANEXGEN STRUCTURES PVT. LTD",
  address: "Delhi",
  gstin: "09ABCDS1234A1Z5",
  contactPerson: "Hareram Sharma",
  email: "hareram.sharma@reviranexgen.com",
  phone: "9968422442",
  createdAt: (/* @__PURE__ */ new Date()).toISOString()
};
var INITIAL_DB_CONFIG = {
  uri: "mongodb://revira_admin:2b0YlZxL79D@66.116.205.151:39004",
  dbName: "revira_local_compass",
  apiEndpoint: "/revira/api",
  status: "Disconnected",
  lastSync: (/* @__PURE__ */ new Date()).toISOString()
};
var getCurrentDateStr = () => {
  const now = /* @__PURE__ */ new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  return `${d}-${m}-${y}`;
};
var getMonthYearStr = () => {
  const now = /* @__PURE__ */ new Date();
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
    "DEC"
  ];
  return `${months[now.getMonth()]}-${now.getFullYear()}`;
};
var formatVersion = (v) => String(v).padStart(3, "0");
var getMockState = () => {
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  if (!stored) {
    const initialState = {
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
          assignedClientIds: []
        }
      ]
    };
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }
  return JSON.parse(stored);
};
var updateMockState = (updates) => {
  const current = getMockState();
  localStorage.setItem(
    MOCK_STORAGE_KEY,
    JSON.stringify({ ...current, ...updates })
  );
};
var getHeaders = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...token ? { Authorization: `Bearer ${token}` } : {}
  };
};
var NestApiService = {
  setToken: (token) => {
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
    else localStorage.removeItem(AUTH_TOKEN_KEY);
  },
  request: async (path, method = "GET", body) => {
    try {
      const res = await fetch(`${INITIAL_DB_CONFIG.apiEndpoint}${path}`, {
        method,
        headers: getHeaders(),
        ...body ? { body: JSON.stringify(body) } : {}
      });
      if (!res.ok) throw new Error(`Server Response: ${res.status}`);
      return await res.json();
    } catch (e) {
      if (e.message === "Failed to fetch" || e.name === "TypeError") {
        const mockData = getMockState();
        const collection = path.split("/")[1];
        if (method === "GET") {
          if (path === "/branding")
            return mockData.branding || INITIAL_BRANDING;
          const list = mockData[collection] || [];
          if (collection === "clients" && list.length === 0)
            return [DEFAULT_CLIENT];
          return list;
        }
        if (method === "POST") {
          const newItem = {
            ...body,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          const list = mockData[collection] || [];
          updateMockState({ [collection]: [...list, newItem] });
          return newItem;
        }
        if (method === "PATCH" || method === "PUT") {
          const id = path.split("/").pop();
          const list = mockData[collection] || [];
          const updatedList = list.map(
            (item) => item.id === id ? { ...item, ...body } : item
          );
          updateMockState({ [collection]: updatedList });
          const updatedItem = updatedList.find((i) => i.id === id);
          return updatedItem || { ...body, id };
        }
        if (method === "DELETE") {
          const id = path.split("/").pop();
          const list = mockData[collection] || [];
          updateMockState({
            [collection]: list.filter((item) => item.id !== id)
          });
          return { success: true };
        }
      }
      throw e;
    }
  },
  login: async (email, password) => {
    try {
      const res = await fetch(`${INITIAL_DB_CONFIG.apiEndpoint}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error("Unauthorized Access");
      return res.json();
    } catch (e) {
      if (e.message === "Failed to fetch" || e.name === "TypeError") {
        const mockData = getMockState();
        const user = mockData.users?.find(
          (u) => u.email === email && u.password === password
        );
        if (user) {
          return {
            user: { ...user },
            token: `simulated-jwt-${user.id}`
          };
        }
        if (email === "admin@reviranexgen.com" && password === "admin123") {
          return {
            user: {
              id: "master-admin",
              name: "Hareram Sharma",
              email: "admin@reviranexgen.com",
              role: "Administrator",
              assignedClientIds: []
            },
            token: "simulated-jwt-master"
          };
        }
        throw new Error("Invalid Credentials (Simulation Mode)");
      }
      throw e;
    }
  },
  getUsers: () => NestApiService.request("/users"),
  saveUser: (user) => NestApiService.request("/users", "POST", user),
  updateUser: (id, updates) => NestApiService.request(`/users/${id}`, "PATCH", updates),
  deleteUser: (id) => NestApiService.request(`/users/${id}`, "DELETE"),
  getClients: () => NestApiService.request("/clients"),
  saveClient: (client) => NestApiService.request("/clients", "POST", client),
  updateClient: (id, updates) => NestApiService.request(`/clients/${id}`, "PATCH", updates),
  deleteClient: (id) => NestApiService.request(`/clients/${id}`, "DELETE"),
  getProjects: () => NestApiService.request("/projects"),
  saveProject: (project) => NestApiService.request("/projects", "POST", project),
  updateProject: (id, updates) => NestApiService.request(`/projects/${id}`, "PATCH", updates),
  deleteProject: (id) => NestApiService.request(`/projects/${id}`, "DELETE"),
  getQuotations: () => NestApiService.request("/quotations"),
  saveQuotation: (quote) => NestApiService.request("/quotations", "POST", quote),
  updateQuotation: (id, updates) => NestApiService.request(`/quotations/${id}`, "PATCH", updates),
  deleteQuotation: (id) => NestApiService.request(`/quotations/${id}`, "DELETE"),
  getInvoices: () => NestApiService.request("/invoices"),
  saveInvoice: (inv) => NestApiService.request("/invoices", "POST", inv),
  updateInvoice: (id, updates) => NestApiService.request(`/invoices/${id}`, "PATCH", updates),
  deleteInvoice: (id) => NestApiService.request(`/invoices/${id}`, "DELETE"),
  getBranding: () => NestApiService.request("/branding"),
  updateBranding: (branding) => NestApiService.request("/branding", "PATCH", branding)
};
var loadState = async () => {
  let isServerUp = true;
  const [users, clients, projects, quotations, invoices, branding] = await Promise.all([
    NestApiService.getUsers().catch(() => []),
    NestApiService.getClients().catch(() => [DEFAULT_CLIENT]),
    NestApiService.getProjects().catch(() => []),
    NestApiService.getQuotations().catch(() => []),
    NestApiService.getInvoices().catch(() => []),
    NestApiService.getBranding().catch(() => INITIAL_BRANDING)
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
      status: isServerUp ? "Connected" : "Disconnected"
    }
  };
};
var STANDARD_CLOSING = `We hope you\u2019ll find our offer in line with your requirement & place your valued PO on us giving us an opportunity to serve you.

However, please feel free to contact us for any sort of additional information that you may feel is required pertaining to this offer. We assure you our best support at all times.`;
var createSupplyAndFabricationTemplate = (projectId, version, clientName, location) => {
  const verStr = formatVersion(version);
  return {
    id: "",
    projectId,
    version,
    status: "Draft",
    workflow: "Supply and Fabrication" /* SUPPLY_AND_FABRICATION */,
    refNo: `RNS/${getMonthYearStr()}/${clientName}/RNS-${verStr}`,
    date: getCurrentDateStr(),
    enquiryNo: `RNS-PEB - RNS-001`,
    location: location || "Project Location",
    subject: "Supply & erection of Steel Structures for PEB Shed",
    salutation: "Dear Sir,",
    introText: "Techno-Commercial Offer",
    introBody: "We are pleased to submit our proposal for the supply & erection of steel Structure against your subject enquiry.\n\nOur area of expertise is in complete design, manufacture, installation & commissioning of Heavy Structural Fabrication & Pre-Engineered Building.\n\nThis proposal is detailed for your ready reference and includes scope of supply, building description, design loads/criteria, material specifications, time delivery, etc complete.",
    closingBody: STANDARD_CLOSING,
    recipientName: `${clientName}`,
    recipientAddress: "",
    recipientContactPerson: "",
    recipientPhone: "",
    recipientEmail: "",
    priceNotes: "\u2022 Above mentioned rates are quoted on the basis of inputs received and designed accordingly.\n\u2022 The above quoted rates are including transportation and excluding GST @ 18%.\n\u2022 Weight may vary \xB15%",
    bankDetails: "Account holder: REVIRA NEXGEN STRUCTURES PRIVATE LIMITED | Bank Name: YES Bank | A/C No.: 073361900002657 | IFSC Code: YESB0000733",
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
          ["3", "Building built-up Area", "15494 SQF"]
        ],
        items: [],
        content: ""
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
          ["25", "Turbo Ventilators", "As per GA Drawing/Specifications"]
        ],
        items: [],
        content: ""
      },
      {
        id: "s_additions",
        title: "Standard Building Additions (Canopy / Fascia / Liner / Partitions)",
        type: "table",
        headers: ["Sr. No.", "Description", "PEB SHED"],
        columnWidths: [21, null, null],
        rows: [
          ["1", "Canopy - Location/", "As per approved drawing"],
          ["2", "Framed openings", "As per approved drawing"]
        ],
        items: [],
        content: ""
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
            "Continuous FCAW welding along with Intermediate, AWS D1.1"
          ],
          [
            "2",
            "Frames, Built-up / HR sections/Bracings",
            "Mechanical Cleaning with swipe blast on heavy mill scale and one coat of primer and one coat of Finish Enamel paint"
          ],
          ["3", "Purlins / Girts", "ASTM A653"],
          [
            "4",
            "Profile sheets",
            "Bare-0.47 mm thk and colour -0.5 mm thk blue RAL5012"
          ]
        ],
        items: [],
        content: ""
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
          ["7", "Seismic load (Zone no.)", "III"]
        ],
        items: [],
        content: ""
      },
      {
        id: "s4",
        title: "4.0 - APPLICABLE CODES",
        type: "list",
        headers: [],
        rows: [],
        items: [
          "Frame members are designed in accordance with AISC-LRFD (American Institute of Steel Construction).",
          "Cold Formed members are designed in accordance with the AISC For Use of Cold-Formed Light Gauge Steel Structural Member\u2019s In General Building Construction.",
          "Deflection as per IS 800-2007.",
          "All welding is done in accordance with the 2000 Edition of the American Welding Society (AWS D1.1).",
          "Structural Welding Code-Steel. All Welders are qualified for the type of welds performed.",
          'Manufacturing dimensional tolerances are in accordance with the requirements of the 1996 Edition of the Metal Building Manufacturer Association (MBMA)of the USA.; "Low rise building systems Manual"'
        ],
        content: ""
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
            "Primary Members Built up sections (Make \u2013 SAIL/JINDAL/TATA)",
            "Plates",
            "Min. Y.S. 350 MPA"
          ],
          [
            "2",
            "Hot Rolled Sections (Make \u2013 TAT/Apollo/ SAIL)",
            "Channel s",
            "IS: 2062 / a 572, Grade 36, Min. Y.S. 250 MPA"
          ],
          ["", "", "Angles", "IS: 2062 / a 572, Grade 36, Min. Y.S. 250 MPA"],
          [
            "",
            "",
            "Pipes",
            "IS: 1161, IS: 1239 / A 572, Grade 36, Min. Y.S. 250 MPA"
          ],
          [
            "3",
            "Purlins/Girts (Make \u2013 JSW/TATA)",
            "Hollow section",
            "ASTM A653"
          ],
          ["4", "Anchor bolts", "IS 2062 E250A", "IS 2062 E250A"],
          [
            "5",
            "Primary Connection bolts Electroplated/ Pre galvanised",
            "High Strength Bolts, IS: 1367 / 8.8 Grade",
            "High Strength Bolts, IS: 1367 / 8.8 Grade"
          ],
          [
            "6",
            "Secondary connection bolts Pre galvanised",
            "",
            "Bolt as per ASTM A 325, Grade 4.6"
          ]
        ],
        items: [],
        content: ""
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
          "Dispatch of materials will start as per agreed time frame from the date of receipt of signed Approval drawings with receipt of payment as per agreed terms."
        ],
        content: ""
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
          "Shelter/accommodation to be provided to the workers till completion of the work."
        ],
        content: ""
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
          "Fixing of roof sheeting, wall sheeting and accessories"
        ],
        content: ""
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
          "Remarks"
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
            "AISC Standard"
          ],
          [
            "2.",
            "Turbo ventilator with Base",
            "Each",
            "1",
            "6500/-",
            "Optional",
            "2."
          ],
          [
            "3.",
            "Polycarbonate 2 mm thk (3.2 mtr)",
            "Each",
            "1",
            "6000/-",
            "Optional",
            "3."
          ]
        ],
        items: [],
        content: ""
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
          "Weight may vary \xB15%"
        ],
        content: ""
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
          ["IFSC Code:", "YESB0000733"]
        ],
        items: [],
        content: ""
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
            "Supply and Erection amount:\n1. 20% advance on confirmation of order/PO/Signed contract.\n2. 40% after finalisation & submission of detailed GA drawing\n3. 30% before dispatch of material on Proforma Invoice.\n4. 5% after Structure Erection\n5. 5 % after Building Handing over"
          ],
          [
            "2",
            "Delivery period",
            "Delivery as per mutually agreed from the date of receipt of signed approved drawings and receipt of payment as per agreed terms."
          ],
          [
            "3",
            "Erection period",
            "Erection Period as per mutually agreed after delivery of complete material."
          ],
          ["4", "GST", "Extra @ 18% for supply and Erection both."],
          [
            "5",
            "Scope of contract",
            "This Contract is the only Agreement between the DNG (hereinafter referred to as SELLER) & BUYER (who has signed his acceptance on this contract) and the terms which have been Expressly stated in this Agreement will be binding including any amendments mutually agreed upon in writing."
          ],
          [
            "6",
            "Proposal validity",
            "This proposal is valid for (5) days from the date of this proposal. Any extension of validity must be received in writing from the SELLER."
          ],
          [
            "7",
            "Erection drawing",
            "\u201CDNSPL\u201D the DNSP will furnish the BUYER with all standard erection drawings required for the erection of the buildings."
          ],
          [
            "8",
            "Specification changes",
            "SELLER reserve the right to modify the design of his standard buildings and to substitute material equal to or superior to that originally specified (in order to permit incorporation of changes and improvements, in the continued development of the SELLER's product)."
          ],
          [
            "9",
            "Change in scope",
            "Any change and/or revision to the above stated scope of supply may lead to a variation in the price and the delivery period."
          ],
          [
            "10",
            "Our liability",
            "DNSPL\u2019s liability is restricted to the scope of this contract only and it will not be responsible for acts of third parties. Consequential losses and third-party damages, if any, arising out of the delays or claims by the BUYER will not be SELLER\u2019S responsibility"
          ],
          [
            "11",
            "Ownership Of Un Approved Material at Site",
            "All material supplied to site by DNSPL, which are unapproved and in excess of building requirements shall be the property of DNSPL and DNSPL reserves the right to ship the same back to its place."
          ],
          [
            "12",
            "Warranty",
            "Products supplied by DNSPL are warranted against any failure due to defective material & workmanship for a period of One year."
          ],
          [
            "13",
            "Permits",
            "The SELLER shall not be responsible or liable for the obtaining of permits to erect or install any product at BUYER\u2019S site."
          ],
          [
            "14",
            "Force Majeure",
            "The SELLER shall not be liable for any loss or damage to the BUYER for the delay in delivery or cancellation of any Purchaser's Orders by The SELLER due to circumstances beyond The SELLER\u2019S control, such as but not limited to, war, riots, civil commotion, pandemic restriction by local and central government authorities, government regulations, orders, or acts of any government authority directly or indirectly interfering with or rendering more burdensome the production, transportation, delivery and erection of the products, floods, fires, delays due to transporter's strike and any other circumstance or event beyond SELLER\u2019S control."
          ],
          [
            "15",
            "Weighment",
            "The weight (in Kg/Tonnage) of the material shipped and mentioned in the SELLER\u2019S \u201CBill of Supply\u201D will be final and binding for all billing and payment purposes. Any variation in Kg/Tonnage at the Buyer\u2019s end on receipt of material, will be to the Transporter\u2019s account."
          ],
          [
            "16",
            "Safety, Security and proper space at site for shipped material",
            "The BUYER shall provide the SELLER a secured area for unloading and storing all material of the order. In situations where the site is in a remote location, then the BUYER shall provide the necessary Security and accommodate a secure lockable room to store small items of the order at the site."
          ],
          [
            "17",
            "Exclusions",
            "Anything and apart from above not mentioned in the offer."
          ]
        ],
        items: [],
        content: ""
      }
    ],
    regardsName: "Hareram R Sharma",
    regardsPhone: "8390491843",
    regardsEmail: "Hareram.sharma@divinenexgen.com",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
};
var createStructuralFabricationTemplate = (projectId, version, clientName, location) => {
  const verStr = formatVersion(version);
  return {
    id: "",
    projectId,
    version,
    status: "Draft",
    workflow: "Structural Fabrication" /* STRUCTURAL_FABRICATION */,
    refNo: `RNS/${getMonthYearStr()}/${clientName}/RNS-SF-${verStr}`,
    date: getCurrentDateStr(),
    enquiryNo: `RNS-SF- RNS-001`,
    location: location || "Project Site",
    subject: "Structural fabrication of Steel Structures",
    salutation: "Dear Sir,",
    introText: "Techno-Commercial Offer",
    introBody: "We are pleased to submit our proposal for the supply & erection of steel Structure against your subject enquiry.\n\nOur area of expertise is in complete design, manufacture, installation & commissioning of Heavy Structural Fabrication & Pre-Engineered Building.",
    closingBody: STANDARD_CLOSING,
    recipientName: `${clientName}`,
    recipientAddress: "",
    recipientContactPerson: "",
    recipientPhone: "",
    recipientEmail: "",
    priceNotes: "\u2022 GST @ 18% Extra.\n\u2022 Billing as per BOQ.",
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
          "Remarks"
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
            "N."
          ]
        ],
        items: [],
        content: ""
      },
      {
        id: "s2",
        title: "Payment Terms",
        type: "list",
        headers: [],
        rows: [],
        items: [
          "15% advance on confirmation of Worder before Labour mobilization.",
          "85% after fabrication Completion"
        ],
        content: ""
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
          "All shop drawing, BOQ, LOT SUMMARY to be provided by M/s Apex."
        ],
        content: ""
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
          ["IFSC Code:", "YESB0000733"]
        ],
        items: [],
        content: ""
      }
    ],
    regardsName: "Hareram R Sharma",
    regardsPhone: "8390491843",
    regardsEmail: "Hareram.sharma@divinenexgen.com",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
};
var createJobWorkTemplate = (projectId, version, clientName, location) => {
  const verStr = formatVersion(version);
  return {
    id: "",
    projectId,
    version,
    status: "Draft",
    workflow: "Job Work" /* JOB_WORK */,
    refNo: `RNS/${getMonthYearStr()}/${clientName}/RNS-JW-${verStr}`,
    date: getCurrentDateStr(),
    enquiryNo: `RNS-JW- RNS-001`,
    location: location || "Workshop Location",
    subject: "Job Work of Steel Structures",
    salutation: "Dear Sir,",
    introText: "Techno-Commercial Offer",
    introBody: "We are pleased to submit our proposal for the supply & erection of steel Structure against your subject enquiry on job work basis.",
    closingBody: STANDARD_CLOSING,
    recipientName: `${clientName}`,
    recipientAddress: "",
    recipientContactPerson: "",
    recipientPhone: "",
    recipientEmail: "",
    priceNotes: "\u2022 GST @ 18% Extra.\n\u2022 Material wastage \xB12%.",
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
          "Remarks"
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
            "N."
          ]
        ],
        items: [],
        content: ""
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
          ["IFSC Code:", "YESB0000733"]
        ],
        items: [],
        content: ""
      }
    ],
    regardsName: "Hareram R Sharma",
    regardsPhone: "8390491843",
    regardsEmail: "Hareram.sharma@divinenexgen.com",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
};
var createInvoiceTemplate = (projectId, version, client, piNo) => {
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
        rate: 6e4,
        amount: 6e4
      }
    ],
    taxType: "Intra-State",
    bankDetails: {
      accountName: "Revira NexGen Structure Pvt. Ltd.",
      address: "28 E2 Block, Shivram Park, Nangloi Delhi 110041",
      accountNumber: "073361900002657",
      ifscCode: "YESB0000733"
    },
    regardsName: "Hareram Sharma",
    amountInWords: "",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
};

// App.tsx
import { useState as useState10, useEffect as useEffect5 } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { X as X7 } from "lucide-react";

// components/Layout.tsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  Bell,
  UserCog,
  CloudLightning,
  RefreshCw
} from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
var Layout = ({
  children,
  user,
  onLogout,
  brandColor,
  logo,
  logoBackgroundColor,
  isSyncing,
  dbStatus
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };
  const navItems = [
    { icon: /* @__PURE__ */ jsx(LayoutDashboard, { size: 20 }), label: "Dashboard", path: "/" },
    { icon: /* @__PURE__ */ jsx(Users, { size: 20 }), label: "Clients", path: "/clients" },
    { icon: /* @__PURE__ */ jsx(Briefcase, { size: 20 }), label: "Projects", path: "/projects" }
  ];
  if (user?.role === "Administrator") {
    navItems.push({
      icon: /* @__PURE__ */ jsx(UserCog, { size: 20 }),
      label: "Users",
      path: "/users"
    });
  }
  navItems.push({
    icon: /* @__PURE__ */ jsx(Settings, { size: 20 }),
    label: "Branding",
    path: "/branding"
  });
  const brandRed = "#EC1C24";
  return /* @__PURE__ */ jsxs("div", { className: "h-screen flex bg-white overflow-hidden font-['Inter']", children: [
    isSyncing && /* @__PURE__ */ jsx("div", { className: "fixed top-0 left-0 right-0 h-1 z-[100] bg-white overflow-hidden", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "h-full bg-[#EC1C24] animate-progress-indefinite",
        style: { width: "40%" }
      }
    ) }),
    sidebarOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity",
        onClick: () => setSidebarOpen(false)
      }
    ),
    /* @__PURE__ */ jsx(
      "aside",
      {
        className: `fixed inset-y-0 left-0 w-72 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 shadow-2xl ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`,
        style: { backgroundColor: brandColor },
        children: /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col relative overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl pointer-events-none" }),
          /* @__PURE__ */ jsxs("div", { className: "p-8 pb-4 relative z-10 flex flex-col items-center", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "p-4 rounded-2xl shadow-lg mb-2 flex items-center justify-center min-h-[80px] w-full",
                style: { backgroundColor: logoBackgroundColor || "#ffffff" },
                children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: logo,
                    alt: "Revira Nexgen",
                    className: "h-10 w-auto object-contain mx-auto"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mt-4 px-2 w-full", children: [
              /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-white/20" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-white/50 uppercase tracking-[0.3em] whitespace-nowrap", children: "ERP Ecosystem" }),
              /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-white/20" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("nav", { className: "flex-1 px-6 py-4 space-y-1 relative z-10 overflow-y-auto", children: navItems.map((item) => /* @__PURE__ */ jsxs(
            NavLink,
            {
              to: item.path,
              className: ({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 group ${isActive ? "text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/10"}`,
              style: ({ isActive }) => isActive ? {
                backgroundColor: brandRed,
                boxShadow: `0 10px 15px -3px ${brandRed}44`
              } : {},
              onClick: () => setSidebarOpen(false),
              children: [
                /* @__PURE__ */ jsx("div", { className: "transition-transform group-hover:scale-110 duration-200", children: item.icon }),
                /* @__PURE__ */ jsx("span", { className: "font-bold text-sm uppercase tracking-wider", children: item.label })
              ]
            },
            item.path
          )) }),
          /* @__PURE__ */ jsxs("div", { className: "p-6 border-t border-white/10 bg-black/10 relative z-10", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleLogout,
                className: "flex items-center gap-4 w-full px-5 py-4 text-white/60 hover:text-white hover:bg-red-50/20 rounded-xl transition-all duration-200 group",
                children: [
                  /* @__PURE__ */ jsx(
                    LogOut,
                    {
                      size: 20,
                      className: "group-hover:-translate-x-1 transition-transform"
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "font-bold text-sm uppercase tracking-wider", children: "Sign Out" })
                ]
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-[9px] text-white/30 text-center mt-6 font-medium uppercase tracking-widest", children: "v2.6.0 \u2022 Mobile Ready" })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0 h-screen overflow-hidden", children: [
      /* @__PURE__ */ jsxs("header", { className: "h-16 lg:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-10 z-30 shrink-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors",
              onClick: () => setSidebarOpen(true),
              children: /* @__PURE__ */ jsx(Menu, { size: 24 })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse hidden xs:block" }),
            /* @__PURE__ */ jsx("h1", { className: "text-[10px] lg:text-xs font-black text-[#2E3191] uppercase tracking-[0.1em] lg:tracking-[0.2em]", children: "Command Center" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 lg:gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 group cursor-default", children: [
            isSyncing ? /* @__PURE__ */ jsx(RefreshCw, { size: 12, className: "text-[#2E3191] animate-spin" }) : /* @__PURE__ */ jsx(
              CloudLightning,
              {
                size: 12,
                className: dbStatus === "Connected" ? "text-emerald-500" : "text-amber-500"
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-black uppercase text-slate-400 tracking-widest", children: [
              "DB:",
              " ",
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: dbStatus === "Connected" ? "text-emerald-600" : "text-amber-600",
                  children: dbStatus
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
            /* @__PURE__ */ jsx("button", { className: "p-2 lg:p-3 text-slate-400 hover:text-[#2E3191] hover:bg-slate-50 rounded-xl transition-all", children: /* @__PURE__ */ jsx(Bell, { size: 20 }) }),
            /* @__PURE__ */ jsx("span", { className: "absolute top-1.5 right-1.5 w-2 h-2 bg-[#EC1C24] border-2 border-white rounded-full group-hover:scale-125 transition-transform" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-8 w-px bg-slate-100 hidden sm:block" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-right hidden lg:block", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-black text-[#2E3191] leading-tight uppercase tracking-tight", children: user?.name }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 font-bold uppercase tracking-widest", children: user?.role })
            ] }),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-9 h-9 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center text-white font-black border-2 lg:border-4 border-slate-50 shadow-md transition-transform hover:scale-105 cursor-pointer text-xs lg:text-base",
                style: { backgroundColor: brandColor },
                children: user?.name.charAt(0)
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 overflow-y-auto p-4 lg:p-10 no-print bg-slate-50/30 h-[80vh] min-h-0", children })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes progress-indefinite {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-indefinite {
          animation: progress-indefinite 2s infinite linear;
        }
        @media (max-width: 400px) {
          .xs:hidden { display: none; }
          .xs:block { display: block; }
        }
      ` })
  ] });
};
var Layout_default = Layout;

// pages/Login.tsx
import { useState as useState2 } from "react";
import { useNavigate as useNavigate2 } from "react-router-dom";
import {
  Lock,
  Mail,
  Loader2,
  Info,
  Sparkles,
  ShieldCheck,
  Fingerprint
} from "lucide-react";
import { Fragment, jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var Login = ({ onLogin }) => {
  const [email, setEmail] = useState2("");
  const [password, setPassword] = useState2("");
  const [error, setError] = useState2("");
  const [isLoading, setIsLoading] = useState2(false);
  const navigate = useNavigate2();
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const success = await onLogin(email, password);
      if (success) {
        navigate("/");
      } else {
        setError("Invalid server-side credentials or cluster timeout");
      }
    } catch (e2) {
      setError("Communication failure with runtime");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsx2("div", { className: "min-h-screen flex items-center justify-center relative p-4 font-['Inter'] bg-white", children: /* @__PURE__ */ jsxs2("div", { className: "w-full max-w-md relative z-10 animate-fade-in", children: [
    /* @__PURE__ */ jsx2("div", { className: "text-center mb-6", children: /* @__PURE__ */ jsx2("div", { className: "inline-block p-4 bg-white rounded-3xl shadow-sm border border-slate-100 mb-4 transition-transform hover:scale-105 duration-500", children: /* @__PURE__ */ jsx2(
      "img",
      {
        src: "https://reviranexgen.com/assets/logo-with-name.png",
        alt: "Revira Nexgen",
        className: "h-14 mx-auto"
      }
    ) }) }),
    /* @__PURE__ */ jsxs2("div", { className: "bg-white p-8 sm:p-10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(46,49,145,0.08)] space-y-6 border border-slate-100 relative overflow-hidden group", children: [
      /* @__PURE__ */ jsx2("div", { className: "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2E3191]/10 to-transparent" }),
      /* @__PURE__ */ jsxs2("div", { className: "flex justify-between items-start mb-2", children: [
        /* @__PURE__ */ jsxs2("div", { className: "relative", children: [
          /* @__PURE__ */ jsx2("h2", { className: "text-2xl font-black text-[#2E3191] uppercase tracking-tighter leading-none", children: "Access Control" }),
          /* @__PURE__ */ jsxs2("p", { className: "text-slate-400 text-[9px] mt-1 font-black uppercase tracking-widest flex items-center gap-2", children: [
            /* @__PURE__ */ jsx2(ShieldCheck, { size: 11, className: "text-[#EC1C24]" }),
            " Secure Ecosystem Access"
          ] })
        ] }),
        /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100", children: [
          /* @__PURE__ */ jsx2("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" }),
          /* @__PURE__ */ jsx2("span", { className: "text-[8px] font-black text-emerald-600 uppercase tracking-widest", children: "Uplink Active" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs2("form", { onSubmit: handleLogin, className: "space-y-5 relative", children: [
        error && /* @__PURE__ */ jsxs2("div", { className: "p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black flex items-center gap-3 animate-shake uppercase tracking-tight", children: [
          /* @__PURE__ */ jsx2("div", { className: "w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx2(Info, { size: 16 }) }),
          error
        ] }),
        /* @__PURE__ */ jsxs2("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx2("label", { className: "block text-[9px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "Identity (Email)" }),
          /* @__PURE__ */ jsxs2("div", { className: "relative group", children: [
            /* @__PURE__ */ jsx2("div", { className: "absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx2(
              Mail,
              {
                className: "text-slate-300 transition-colors group-focus-within:text-[#2E3191]",
                size: 18
              }
            ) }),
            /* @__PURE__ */ jsx2(
              "input",
              {
                required: true,
                type: "email",
                className: "w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-700 text-sm transition-all",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                placeholder: "admin@reviranexgen.com"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs2("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx2("label", { className: "block text-[9px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "Secure Token (Pass)" }),
          /* @__PURE__ */ jsxs2("div", { className: "relative group", children: [
            /* @__PURE__ */ jsx2("div", { className: "absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx2(
              Lock,
              {
                className: "text-slate-300 transition-colors group-focus-within:text-[#2E3191]",
                size: 18
              }
            ) }),
            /* @__PURE__ */ jsx2(
              "input",
              {
                required: true,
                type: "password",
                className: "w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-700 text-sm transition-all",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx2(
          "button",
          {
            type: "submit",
            disabled: isLoading,
            className: "w-full bg-[#2E3191] text-white font-black py-5 rounded-2xl hover:bg-[#1e206b] transition-all flex items-center justify-center gap-3 disabled:opacity-70 group relative overflow-hidden shadow-xl",
            children: isLoading ? /* @__PURE__ */ jsx2(Loader2, { className: "animate-spin", size: 20 }) : /* @__PURE__ */ jsxs2(Fragment, { children: [
              /* @__PURE__ */ jsx2("span", { className: "relative z-10 text-[11px] uppercase tracking-[0.2em]", children: "Verify Identity" }),
              /* @__PURE__ */ jsx2("div", { className: "absolute right-0 top-0 h-full w-14 bg-[#EC1C24] flex items-center justify-center translate-x-4 group-hover:translate-x-0 transition-transform skew-x-[-15deg]", children: /* @__PURE__ */ jsx2(Sparkles, { size: 16, className: "text-white skew-x-[15deg]" }) })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "bg-[#2E3191]/5 border border-[#2E3191]/10 rounded-2xl p-4 space-y-2 mt-4", children: [
        /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2 mb-1", children: [
          /* @__PURE__ */ jsx2(Fingerprint, { size: 14, className: "text-[#2E3191]" }),
          /* @__PURE__ */ jsx2("span", { className: "text-[9px] font-black text-[#2E3191] uppercase tracking-widest", children: "Master Credentials" })
        ] }),
        /* @__PURE__ */ jsxs2("div", { className: "flex justify-between items-center text-[10px]", children: [
          /* @__PURE__ */ jsx2("span", { className: "text-slate-400 font-bold uppercase", children: "Login ID:" }),
          /* @__PURE__ */ jsx2("span", { className: "font-mono font-bold text-[#2E3191] bg-white px-2 py-0.5 rounded border border-[#2E3191]/5 select-all", children: "admin@reviranexgen.com" })
        ] }),
        /* @__PURE__ */ jsxs2("div", { className: "flex justify-between items-center text-[10px]", children: [
          /* @__PURE__ */ jsx2("span", { className: "text-slate-400 font-bold uppercase", children: "Token (Pass):" }),
          /* @__PURE__ */ jsx2("span", { className: "font-mono font-bold text-[#EC1C24] bg-white px-2 py-0.5 rounded border border-[#EC1C24]/5 select-all", children: "admin123" })
        ] })
      ] }),
      /* @__PURE__ */ jsx2("div", { className: "pt-2 border-t border-slate-50", children: /* @__PURE__ */ jsxs2("div", { className: "p-1", children: [
        /* @__PURE__ */ jsx2("h4", { className: "text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2", children: "Local System Access Only" }),
        /* @__PURE__ */ jsx2("p", { className: "text-[9px] text-slate-300 leading-relaxed italic", children: "Unauthorized access attempts are logged to the audit trail." })
      ] }) })
    ] })
  ] }) });
};
var Login_default = Login;

// pages/Dashboard.tsx
import React3 from "react";
import { Link } from "react-router-dom";
import {
  Users as Users2,
  Briefcase as Briefcase2,
  FileText,
  ChevronRight,
  Clock,
  ArrowUpRight,
  Plus
} from "lucide-react";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var Dashboard = ({ clients, projects, users }) => {
  const stats = [
    {
      label: "Clients",
      value: clients.length,
      icon: /* @__PURE__ */ jsx3(Users2, { className: "text-[#2E3191]" }),
      color: "bg-blue-50/50"
    },
    {
      label: "Projects",
      value: projects.length,
      icon: /* @__PURE__ */ jsx3(Briefcase2, { className: "text-[#EC1C24]" }),
      color: "bg-red-50/50"
    },
    {
      label: "Staff",
      value: users.length,
      icon: /* @__PURE__ */ jsx3(FileText, { className: "text-[#2E3191]" }),
      color: "bg-slate-50"
    }
  ];
  return /* @__PURE__ */ jsxs3("div", { className: "space-y-6 lg:space-y-8 animate-fade-in", children: [
    /* @__PURE__ */ jsxs3("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs3("div", { children: [
        /* @__PURE__ */ jsx3("h1", { className: "text-2xl lg:text-3xl font-black text-[#2E3191] tracking-tight uppercase", children: "Executive Dashboard" }),
        /* @__PURE__ */ jsx3("p", { className: "text-slate-400 font-bold text-[10px] lg:text-xs uppercase tracking-widest", children: "Precision engineering oversight." })
      ] }),
      /* @__PURE__ */ jsxs3("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx3(
          Link,
          {
            to: "/clients",
            className: "flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border-2 border-slate-100 px-4 py-3 lg:py-2.5 rounded-xl text-[10px] font-black text-[#2E3191] hover:border-[#2E3191] transition-all shadow-sm uppercase tracking-widest",
            children: "Directory"
          }
        ),
        /* @__PURE__ */ jsxs3(
          Link,
          {
            to: "/projects",
            className: "flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#EC1C24] px-4 py-3 lg:py-2.5 rounded-xl text-[10px] font-black text-white hover:bg-[#d11920] transition-all shadow-xl shadow-[#EC1C24]/20 active:scale-95 uppercase tracking-widest",
            children: [
              /* @__PURE__ */ jsx3(Plus, { size: 16 }),
              "New Project"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx3("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6", children: stats.map((stat, i) => /* @__PURE__ */ jsxs3(
      "div",
      {
        className: "bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 lg:gap-6 hover:shadow-2xl transition-all group",
        children: [
          /* @__PURE__ */ jsx3(
            "div",
            {
              className: `w-12 h-12 lg:w-14 lg:h-14 rounded-2xl ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300 border border-white shrink-0`,
              children: React3.cloneElement(stat.icon, {
                size: 20
              })
            }
          ),
          /* @__PURE__ */ jsxs3("div", { children: [
            /* @__PURE__ */ jsx3("p", { className: "text-[9px] lg:text-xs font-black text-slate-400 uppercase tracking-widest", children: stat.label }),
            /* @__PURE__ */ jsx3("p", { className: "text-2xl lg:text-3xl font-black text-[#2E3191]", children: stat.value })
          ] })
        ]
      },
      i
    )) }),
    /* @__PURE__ */ jsxs3("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8", children: [
      /* @__PURE__ */ jsxs3("div", { className: "bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden", children: [
        /* @__PURE__ */ jsxs3("div", { className: "p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20", children: [
          /* @__PURE__ */ jsxs3("h3", { className: "font-black text-[#2E3191] flex items-center gap-2 uppercase tracking-tight text-xs lg:text-sm", children: [
            /* @__PURE__ */ jsx3(Clock, { size: 18, className: "text-[#2E3191]" }),
            "Project Pipeline"
          ] }),
          /* @__PURE__ */ jsxs3(
            Link,
            {
              to: "/projects",
              className: "text-[9px] lg:text-[10px] font-black text-[#EC1C24] hover:text-[#d11920] flex items-center gap-1 uppercase tracking-widest",
              children: [
                "View All ",
                /* @__PURE__ */ jsx3(ChevronRight, { size: 14 })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx3("div", { className: "divide-y divide-slate-50", children: projects.length > 0 ? projects.slice(0, 5).map((project) => /* @__PURE__ */ jsxs3(
          Link,
          {
            to: `/projects/${project.id}`,
            className: "flex items-center justify-between p-5 lg:p-6 hover:bg-[#2E3191]/5 transition-colors group",
            children: [
              /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3 lg:gap-4 overflow-hidden", children: [
                /* @__PURE__ */ jsx3("div", { className: "w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#2E3191] font-black text-lg group-hover:bg-[#2E3191] group-hover:text-white transition-all shrink-0", children: project.name.charAt(0) }),
                /* @__PURE__ */ jsxs3("div", { className: "overflow-hidden", children: [
                  /* @__PURE__ */ jsx3("p", { className: "font-black text-[#2E3191] group-hover:text-[#EC1C24] transition-colors uppercase tracking-tight text-[11px] lg:text-sm truncate", children: project.name }),
                  /* @__PURE__ */ jsx3("p", { className: "text-[8px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate", children: project.location })
                ] })
              ] }),
              /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2 lg:gap-3 shrink-0", children: [
                /* @__PURE__ */ jsx3("span", { className: "hidden xs:inline-block px-2 py-0.5 rounded-lg text-[8px] lg:text-[10px] font-black uppercase tracking-widest border bg-blue-50 text-[#2E3191] border-blue-100", children: project.status }),
                /* @__PURE__ */ jsx3(
                  ArrowUpRight,
                  {
                    size: 16,
                    className: "text-slate-200 group-hover:text-[#EC1C24] transition-all"
                  }
                )
              ] })
            ]
          },
          project.id
        )) : /* @__PURE__ */ jsxs3("div", { className: "p-12 lg:p-20 text-center text-slate-300", children: [
          /* @__PURE__ */ jsx3(Briefcase2, { size: 40, className: "mx-auto mb-4 opacity-10" }),
          /* @__PURE__ */ jsx3("p", { className: "font-black uppercase text-[10px] tracking-widest", children: "No active projects" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs3("div", { className: "bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden", children: [
        /* @__PURE__ */ jsxs3("div", { className: "p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20", children: [
          /* @__PURE__ */ jsxs3("h3", { className: "font-black text-[#2E3191] flex items-center gap-2 uppercase tracking-tight text-xs lg:text-sm", children: [
            /* @__PURE__ */ jsx3(Users2, { size: 18, className: "text-[#EC1C24]" }),
            "Partners"
          ] }),
          /* @__PURE__ */ jsxs3(
            Link,
            {
              to: "/clients",
              className: "text-[9px] lg:text-[10px] font-black text-[#EC1C24] hover:text-[#d11920] flex items-center gap-1 uppercase tracking-widest",
              children: [
                "Manager ",
                /* @__PURE__ */ jsx3(ChevronRight, { size: 14 })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx3("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs3("table", { className: "w-full text-left", children: [
          /* @__PURE__ */ jsx3("thead", { children: /* @__PURE__ */ jsxs3("tr", { className: "bg-slate-50/50 text-slate-400 text-[9px] lg:text-[10px] font-black uppercase tracking-widest", children: [
            /* @__PURE__ */ jsx3("th", { className: "px-6 lg:px-8 py-4", children: "Organisation" }),
            /* @__PURE__ */ jsx3("th", { className: "px-6 lg:px-8 py-4 hidden sm:table-cell", children: "Liaison" }),
            /* @__PURE__ */ jsx3("th", { className: "px-6 lg:px-8 py-4 text-right", children: "Link" })
          ] }) }),
          /* @__PURE__ */ jsx3("tbody", { className: "divide-y divide-slate-50", children: clients.length > 0 ? clients.slice(0, 5).map((client) => /* @__PURE__ */ jsxs3(
            "tr",
            {
              className: "text-sm hover:bg-[#2E3191]/5 transition-colors group",
              children: [
                /* @__PURE__ */ jsxs3("td", { className: "px-6 lg:px-8 py-5", children: [
                  /* @__PURE__ */ jsx3("p", { className: "font-black text-[#2E3191] group-hover:text-[#EC1C24] uppercase tracking-tight text-[11px] lg:text-sm", children: client.name }),
                  /* @__PURE__ */ jsx3("p", { className: "text-[8px] lg:text-[10px] text-slate-400 font-bold uppercase truncate max-w-[120px]", children: client.email })
                ] }),
                /* @__PURE__ */ jsx3("td", { className: "px-6 lg:px-8 py-5 text-slate-600 font-bold text-[10px] lg:text-xs uppercase tracking-wide hidden sm:table-cell", children: client.contactPerson }),
                /* @__PURE__ */ jsx3("td", { className: "px-6 lg:px-8 py-5 text-right", children: /* @__PURE__ */ jsx3(
                  Link,
                  {
                    to: `/clients?id=${client.id}`,
                    className: "text-[9px] lg:text-[10px] font-black text-[#2E3191] hover:text-[#EC1C24] transition-colors uppercase tracking-widest",
                    children: "Engage"
                  }
                ) })
              ]
            },
            client.id
          )) : /* @__PURE__ */ jsx3("tr", { children: /* @__PURE__ */ jsxs3(
            "td",
            {
              colSpan: 3,
              className: "p-12 lg:p-20 text-center text-slate-300",
              children: [
                /* @__PURE__ */ jsx3(Users2, { size: 40, className: "mx-auto mb-4 opacity-10" }),
                /* @__PURE__ */ jsx3("p", { className: "font-black uppercase text-[10px] tracking-widest", children: "No clients registered" })
              ]
            }
          ) }) })
        ] }) })
      ] })
    ] })
  ] });
};
var Dashboard_default = Dashboard;

// pages/Clients.tsx
import { useState as useState3 } from "react";
import {
  Plus as Plus2,
  Search,
  Mail as Mail2,
  Phone,
  MapPin,
  Trash2,
  Edit,
  X as X2
} from "lucide-react";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var Clients = ({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient
}) => {
  const [showModal, setShowModal] = useState3(false);
  const [editingClient, setEditingClient] = useState3(null);
  const [search, setSearch] = useState3("");
  const [formData, setFormData] = useState3({
    name: "",
    address: "",
    gstin: "",
    contactPerson: "",
    email: "",
    phone: ""
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingClient) {
      onUpdateClient(editingClient.id, formData);
    } else {
      onAddClient(formData);
    }
    closeModal();
  };
  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({ ...client });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData({
      name: "",
      address: "",
      gstin: "",
      contactPerson: "",
      email: "",
      phone: ""
    });
  };
  const filteredClients = clients.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.contactPerson.toLowerCase().includes(search.toLowerCase())
  );
  return /* @__PURE__ */ jsxs4("div", { className: "space-y-6 animate-fade-in text-slate-800", children: [
    /* @__PURE__ */ jsxs4("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs4("div", { children: [
        /* @__PURE__ */ jsx4("h1", { className: "text-2xl lg:text-3xl font-black text-[#2E3191] uppercase tracking-tight", children: "Client Partners" }),
        /* @__PURE__ */ jsx4("p", { className: "text-slate-400 font-bold text-[10px] lg:text-xs uppercase tracking-widest", children: "Business contacts directory." })
      ] }),
      /* @__PURE__ */ jsxs4(
        "button",
        {
          onClick: () => setShowModal(true),
          className: "bg-[#2E3191] text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#1e206b] transition-all shadow-xl shadow-[#2E3191]/20 font-black text-[10px] uppercase tracking-widest active:scale-95",
          children: [
            /* @__PURE__ */ jsx4(Plus2, { size: 18 }),
            "Register Client"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx4("div", { className: "bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-sm", children: /* @__PURE__ */ jsxs4("div", { className: "relative", children: [
      /* @__PURE__ */ jsx4(
        Search,
        {
          className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-300",
          size: 18
        }
      ),
      /* @__PURE__ */ jsx4(
        "input",
        {
          type: "text",
          placeholder: "Search partners...",
          className: "w-full pl-12 pr-4 py-3 lg:py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2E3191] focus:bg-white font-bold text-sm transition-all",
          value: search,
          onChange: (e) => setSearch(e.target.value)
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx4("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8", children: filteredClients.map((client) => /* @__PURE__ */ jsxs4(
      "div",
      {
        className: "bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden",
        children: [
          /* @__PURE__ */ jsxs4("div", { className: "flex justify-between items-start mb-6 lg:mb-8 relative z-10", children: [
            /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-4 lg:gap-5 overflow-hidden", children: [
              /* @__PURE__ */ jsx4("div", { className: "w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-[#2E3191]/5 text-[#2E3191] flex items-center justify-center font-black text-xl lg:text-2xl shrink-0", children: client.name.charAt(0) }),
              /* @__PURE__ */ jsxs4("div", { className: "overflow-hidden", children: [
                /* @__PURE__ */ jsx4("h3", { className: "text-base lg:text-xl font-black text-[#2E3191] uppercase tracking-tight truncate", children: client.name }),
                /* @__PURE__ */ jsx4("p", { className: "text-[8px] lg:text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 truncate", children: client.gstin })
              ] })
            ] }),
            /* @__PURE__ */ jsxs4("div", { className: "flex gap-1 shrink-0", children: [
              /* @__PURE__ */ jsx4(
                "button",
                {
                  onClick: () => openEditModal(client),
                  className: "p-2 text-slate-300 hover:text-[#2E3191]",
                  children: /* @__PURE__ */ jsx4(Edit, { size: 18 })
                }
              ),
              /* @__PURE__ */ jsx4(
                "button",
                {
                  onClick: () => onDeleteClient(client.id),
                  className: "p-2 text-slate-300 hover:text-[#EC1C24]",
                  children: /* @__PURE__ */ jsx4(Trash2, { size: 18 })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs4("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 relative z-10", children: [
            /* @__PURE__ */ jsxs4("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx4(MapPin, { size: 16, className: "text-[#EC1C24] shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsx4("p", { className: "text-[10px] lg:text-[11px] text-slate-600 font-bold leading-relaxed uppercase tracking-wide truncate", children: client.address })
            ] }),
            /* @__PURE__ */ jsxs4("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx4(Mail2, { size: 16, className: "text-[#2E3191] shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsx4("p", { className: "text-[10px] lg:text-[11px] text-slate-600 font-bold uppercase truncate", children: client.email })
            ] }),
            /* @__PURE__ */ jsxs4("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx4(Phone, { size: 16, className: "text-[#2E3191] shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsx4("p", { className: "text-[10px] lg:text-[11px] text-slate-600 font-bold uppercase", children: client.phone })
            ] }),
            /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx4("div", { className: "p-1 bg-[#EC1C24]/10 rounded-lg", children: /* @__PURE__ */ jsx4(Plus2, { size: 12, className: "text-[#EC1C24]" }) }),
              /* @__PURE__ */ jsx4("p", { className: "text-[10px] lg:text-xs text-[#2E3191] font-black uppercase", children: client.contactPerson })
            ] })
          ] })
        ]
      },
      client.id
    )) }),
    showModal && /* @__PURE__ */ jsx4("div", { className: "fixed top-[100px] inset-x-0 h-[80vh] bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4", children: /* @__PURE__ */ jsxs4("div", { className: "bg-white rounded-t-[2rem] sm:rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-fade-in flex flex-col max-h-full", children: [
      /* @__PURE__ */ jsxs4("div", { className: "p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between shrink-0", children: [
        /* @__PURE__ */ jsx4("h2", { className: "text-lg lg:text-xl font-black text-[#2E3191] uppercase tracking-tight", children: editingClient ? "Modify Ledger" : "Register Client" }),
        /* @__PURE__ */ jsx4(
          "button",
          {
            onClick: closeModal,
            className: "p-2 text-slate-400 hover:text-[#EC1C24] transition-colors",
            children: /* @__PURE__ */ jsx4(X2, { size: 24 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs4(
        "form",
        {
          onSubmit: handleSubmit,
          className: "p-6 lg:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar",
          children: [
            /* @__PURE__ */ jsxs4("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs4("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx4("label", { className: "block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "Client Name" }),
                /* @__PURE__ */ jsx4(
                  "input",
                  {
                    required: true,
                    type: "text",
                    className: "w-full px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-800 text-sm",
                    value: formData.name,
                    onChange: (e) => setFormData({ ...formData, name: e.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs4("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx4("label", { className: "block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "GSTIN" }),
                /* @__PURE__ */ jsx4(
                  "input",
                  {
                    required: true,
                    type: "text",
                    className: "w-full px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-mono font-black text-[#EC1C24] text-sm",
                    value: formData.gstin,
                    onChange: (e) => setFormData({ ...formData, gstin: e.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs4("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx4("label", { className: "block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "Address" }),
                /* @__PURE__ */ jsx4(
                  "textarea",
                  {
                    required: true,
                    className: "w-full px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-800 h-20 resize-none text-sm",
                    value: formData.address,
                    onChange: (e) => setFormData({ ...formData, address: e.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs4("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs4("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx4("label", { className: "block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "Contact Person" }),
                  /* @__PURE__ */ jsx4(
                    "input",
                    {
                      required: true,
                      type: "text",
                      className: "w-full px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-sm",
                      value: formData.contactPerson,
                      onChange: (e) => setFormData({
                        ...formData,
                        contactPerson: e.target.value
                      })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs4("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx4("label", { className: "block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "Phone" }),
                  /* @__PURE__ */ jsx4(
                    "input",
                    {
                      required: true,
                      type: "tel",
                      className: "w-full px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-sm",
                      value: formData.phone,
                      onChange: (e) => setFormData({ ...formData, phone: e.target.value })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs4("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx4("label", { className: "block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "Email" }),
                /* @__PURE__ */ jsx4(
                  "input",
                  {
                    required: true,
                    type: "email",
                    className: "w-full px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-sm",
                    value: formData.email,
                    onChange: (e) => setFormData({ ...formData, email: e.target.value })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs4("div", { className: "flex gap-3 pt-4 sticky bottom-0 bg-white", children: [
              /* @__PURE__ */ jsx4(
                "button",
                {
                  type: "button",
                  onClick: closeModal,
                  className: "flex-1 px-4 py-4 border-2 border-slate-50 text-slate-400 font-black rounded-2xl uppercase text-[10px] tracking-widest",
                  children: "Abort"
                }
              ),
              /* @__PURE__ */ jsx4(
                "button",
                {
                  type: "submit",
                  className: "flex-1 px-4 py-4 bg-[#EC1C24] text-white font-black rounded-2xl shadow-xl uppercase text-[10px] tracking-widest active:scale-95",
                  children: "Verify & Save"
                }
              )
            ] })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx4("style", { children: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      ` })
  ] });
};
var Clients_default = Clients;

// pages/Projects.tsx
import { useState as useState4, useEffect } from "react";
import { Link as Link2 } from "react-router-dom";
import {
  Plus as Plus3,
  Search as Search2,
  ChevronDown,
  X as X3,
  Factory,
  Hammer,
  Truck,
  Trash2 as Trash22,
  Edit as Edit2,
  Briefcase as Briefcase4,
  Calendar,
  FileText as FileText2,
  FileCheck
} from "lucide-react";
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
var Projects = ({
  projects,
  clients,
  onAddProject,
  onUpdateProject,
  onDeleteProject
}) => {
  const [showModal, setShowModal] = useState4(false);
  const [editingProject, setEditingProject] = useState4(null);
  const [search, setSearch] = useState4("");
  const [formData, setFormData] = useState4({
    name: "",
    clientId: "",
    location: "",
    workflow: "Supply and Fabrication" /* SUPPLY_AND_FABRICATION */,
    status: "Planning"
  });
  useEffect(() => {
    if (clients.length > 0 && !formData.clientId && !editingProject) {
      setFormData((prev) => ({ ...prev, clientId: clients[0].id }));
    }
  }, [clients, formData.clientId, editingProject]);
  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormData({
      name: "",
      clientId: clients[0]?.id || "",
      location: "",
      workflow: "Supply and Fabrication" /* SUPPLY_AND_FABRICATION */,
      status: "Planning"
    });
    setShowModal(true);
  };
  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setFormData({ ...project });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientId) {
      alert("Please select a client partner.");
      return;
    }
    if (editingProject) {
      onUpdateProject(editingProject.id, formData);
    } else {
      onAddProject(formData);
    }
    closeModal();
  };
  const filteredProjects = projects.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase())
  );
  const getWorkflowDisplay = (type) => {
    switch (type) {
      case "Supply and Fabrication" /* SUPPLY_AND_FABRICATION */:
        return {
          label: "Supply & Fab",
          icon: /* @__PURE__ */ jsx5(Factory, { size: 14, className: "text-[#2E3191]" })
        };
      case "Structural Fabrication" /* STRUCTURAL_FABRICATION */:
        return {
          label: "Structural Fab",
          icon: /* @__PURE__ */ jsx5(Hammer, { size: 14, className: "text-[#2E3191]" })
        };
      case "Job Work" /* JOB_WORK */:
        return {
          label: "Job Work",
          icon: /* @__PURE__ */ jsx5(Truck, { size: 14, className: "text-[#2E3191]" })
        };
      default:
        return {
          label: "Standard",
          icon: /* @__PURE__ */ jsx5(Briefcase4, { size: 14, className: "text-[#2E3191]" })
        };
    }
  };
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).toUpperCase();
    } catch (e) {
      return "-";
    }
  };
  return /* @__PURE__ */ jsxs5("div", { className: "space-y-6 animate-fade-in h-full flex flex-col", children: [
    /* @__PURE__ */ jsxs5("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0", children: [
      /* @__PURE__ */ jsxs5("div", { children: [
        /* @__PURE__ */ jsx5("h1", { className: "text-2xl lg:text-3xl font-black text-[#2E3191] uppercase tracking-tight", children: "Project Ledger" }),
        /* @__PURE__ */ jsx5("p", { className: "text-slate-400 font-bold text-[10px] lg:text-xs uppercase tracking-widest", children: "Visibility of engineering deployment." })
      ] }),
      /* @__PURE__ */ jsxs5(
        "button",
        {
          onClick: handleOpenAddModal,
          className: "bg-[#2E3191] text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#1e206b] transition-all shadow-xl shadow-[#2E3191]/20 font-black text-[10px] uppercase tracking-widest active:scale-95",
          children: [
            /* @__PURE__ */ jsx5(Plus3, { size: 18 }),
            "New Quotation"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx5("div", { className: "bg-white p-4 lg:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center shrink-0", children: /* @__PURE__ */ jsxs5("div", { className: "relative flex-1 w-full", children: [
      /* @__PURE__ */ jsx5(
        Search2,
        {
          className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-300",
          size: 18
        }
      ),
      /* @__PURE__ */ jsx5(
        "input",
        {
          type: "text",
          placeholder: "Search projects...",
          className: "w-full pl-12 pr-4 py-3 lg:py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2E3191] focus:bg-white font-bold text-sm transition-all",
          value: search,
          onChange: (e) => setSearch(e.target.value)
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs5("div", { className: "flex-1 overflow-hidden flex flex-col", children: [
      /* @__PURE__ */ jsx5("div", { className: "lg:hidden space-y-4 overflow-y-auto pb-10", children: filteredProjects.map((project) => {
        const client = clients.find((c) => c.id === project.clientId);
        return /* @__PURE__ */ jsxs5(
          "div",
          {
            className: "bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4",
            children: [
              /* @__PURE__ */ jsxs5("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-3 overflow-hidden", children: [
                  /* @__PURE__ */ jsx5("div", { className: "w-10 h-10 rounded-xl bg-[#2E3191] text-white flex items-center justify-center font-black shrink-0", children: project.name.charAt(0) }),
                  /* @__PURE__ */ jsxs5("div", { className: "overflow-hidden", children: [
                    /* @__PURE__ */ jsx5("h3", { className: "font-black text-[#2E3191] uppercase tracking-tight text-xs truncate", children: project.name }),
                    /* @__PURE__ */ jsx5("p", { className: "text-[9px] text-slate-400 font-bold uppercase truncate", children: client?.name })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs5("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx5(
                    Link2,
                    {
                      to: `/projects/${project.id}/invoices`,
                      className: "p-2.5 bg-[#EC1C24]/5 text-[#EC1C24] rounded-xl",
                      title: "Manage Invoices",
                      children: /* @__PURE__ */ jsx5(FileCheck, { size: 18 })
                    }
                  ),
                  /* @__PURE__ */ jsx5(
                    Link2,
                    {
                      to: `/projects/${project.id}`,
                      className: "p-2.5 bg-[#2E3191]/5 text-[#2E3191] rounded-xl",
                      title: "Manage Quotations",
                      children: /* @__PURE__ */ jsx5(FileText2, { size: 18 })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs5("div", { className: "pt-4 border-t border-slate-50 flex items-center justify-end gap-4", children: [
                /* @__PURE__ */ jsx5(
                  "button",
                  {
                    onClick: () => handleOpenEditModal(project),
                    className: "p-2 text-slate-300 hover:text-[#2E3191]",
                    children: /* @__PURE__ */ jsx5(Edit2, { size: 16 })
                  }
                ),
                /* @__PURE__ */ jsx5(
                  "button",
                  {
                    onClick: () => onDeleteProject(project.id),
                    className: "p-2 text-slate-300 hover:text-[#EC1C24]",
                    children: /* @__PURE__ */ jsx5(Trash22, { size: 16 })
                  }
                )
              ] })
            ]
          },
          project.id
        );
      }) }),
      /* @__PURE__ */ jsx5("div", { className: "hidden lg:block bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0", children: /* @__PURE__ */ jsx5("div", { className: "overflow-x-auto flex-1", children: /* @__PURE__ */ jsxs5("table", { className: "w-full text-left border-collapse", children: [
        /* @__PURE__ */ jsx5("thead", { children: /* @__PURE__ */ jsxs5("tr", { className: "bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 sticky top-0 z-10", children: [
          /* @__PURE__ */ jsx5("th", { className: "px-8 py-6", children: "Project Identifier" }),
          /* @__PURE__ */ jsx5("th", { className: "px-8 py-6", children: "Client Partner" }),
          /* @__PURE__ */ jsx5("th", { className: "px-8 py-6", children: "Geographic Site" }),
          /* @__PURE__ */ jsx5("th", { className: "px-8 py-6", children: "Creation Date" }),
          /* @__PURE__ */ jsx5("th", { className: "px-8 py-6", children: "Status" }),
          /* @__PURE__ */ jsx5("th", { className: "px-8 py-6 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx5("tbody", { className: "divide-y divide-slate-50", children: filteredProjects.map((project) => {
          const client = clients.find((c) => c.id === project.clientId);
          return /* @__PURE__ */ jsxs5(
            "tr",
            {
              className: "group hover:bg-[#2E3191]/5 transition-colors",
              children: [
                /* @__PURE__ */ jsx5("td", { className: "px-8 py-6", children: /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsx5("div", { className: "w-10 h-10 rounded-xl bg-white border-2 border-slate-50 flex items-center justify-center text-[#2E3191] font-black text-sm group-hover:bg-[#2E3191] group-hover:text-white transition-all", children: project.name.charAt(0) }),
                  /* @__PURE__ */ jsx5("p", { className: "font-black text-[#2E3191] uppercase tracking-tight text-sm truncate max-w-[200px]", children: project.name })
                ] }) }),
                /* @__PURE__ */ jsx5("td", { className: "px-8 py-6 text-xs font-black text-slate-600 uppercase tracking-tight truncate max-w-[150px]", children: client?.name }),
                /* @__PURE__ */ jsx5("td", { className: "px-8 py-6 text-[11px] font-bold uppercase text-slate-400 tracking-tight", children: project.location }),
                /* @__PURE__ */ jsx5("td", { className: "px-8 py-6", children: /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors", children: [
                  /* @__PURE__ */ jsx5(Calendar, { size: 12, className: "text-[#EC1C24]" }),
                  /* @__PURE__ */ jsx5("span", { className: "text-[10px] font-black tracking-widest", children: formatDate(project.createdAt) })
                ] }) }),
                /* @__PURE__ */ jsx5("td", { className: "px-8 py-6", children: /* @__PURE__ */ jsx5(
                  "div",
                  {
                    className: `inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${project.status === "Ongoing" ? "bg-blue-50 text-[#2E3191] border-blue-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`,
                    children: project.status
                  }
                ) }),
                /* @__PURE__ */ jsx5("td", { className: "px-8 py-6 text-right", children: /* @__PURE__ */ jsxs5("div", { className: "flex items-center justify-end gap-2", children: [
                  /* @__PURE__ */ jsx5(
                    Link2,
                    {
                      to: `/projects/${project.id}/invoices`,
                      className: "p-2.5 text-[#EC1C24] hover:bg-[#EC1C24]/10 rounded-xl transition-all",
                      title: "Manage Invoices",
                      children: /* @__PURE__ */ jsx5(FileCheck, { size: 18 })
                    }
                  ),
                  /* @__PURE__ */ jsx5(
                    Link2,
                    {
                      to: `/projects/${project.id}`,
                      className: "p-2.5 text-slate-300 hover:text-[#2E3191] transition-all",
                      title: "Manage Quotations",
                      children: /* @__PURE__ */ jsx5(FileText2, { size: 18 })
                    }
                  ),
                  /* @__PURE__ */ jsx5(
                    "button",
                    {
                      onClick: () => handleOpenEditModal(project),
                      className: "p-2.5 text-slate-300 hover:text-[#2E3191] transition-all",
                      title: "Edit Project",
                      children: /* @__PURE__ */ jsx5(Edit2, { size: 18 })
                    }
                  ),
                  /* @__PURE__ */ jsx5(
                    "button",
                    {
                      onClick: () => onDeleteProject(project.id),
                      className: "p-2.5 text-slate-300 hover:text-[#EC1C24] transition-all",
                      title: "Delete Project",
                      children: /* @__PURE__ */ jsx5(Trash22, { size: 18 })
                    }
                  )
                ] }) })
              ]
            },
            project.id
          );
        }) })
      ] }) }) })
    ] }),
    showModal && /* @__PURE__ */ jsx5("div", { className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4 overflow-y-auto", children: /* @__PURE__ */ jsxs5("div", { className: "bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 animate-fade-in flex flex-col h-auto max-h-[90vh]", children: [
      /* @__PURE__ */ jsxs5("div", { className: "p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 shrink-0", children: [
        /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx5("div", { className: "w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-[#2E3191] text-white flex items-center justify-center", children: editingProject ? /* @__PURE__ */ jsx5(Edit2, { size: 20 }) : /* @__PURE__ */ jsx5(Plus3, { size: 20 }) }),
          /* @__PURE__ */ jsx5("div", { children: /* @__PURE__ */ jsx5("h2", { className: "text-lg lg:text-xl font-black text-[#2E3191] uppercase", children: editingProject ? "Modify Project" : "Initiate Project" }) })
        ] }),
        /* @__PURE__ */ jsx5("button", { onClick: closeModal, className: "text-slate-400 p-2", children: /* @__PURE__ */ jsx5(X3, { size: 24 }) })
      ] }),
      /* @__PURE__ */ jsxs5(
        "form",
        {
          onSubmit: handleSubmit,
          className: "p-6 lg:p-8 space-y-6 overflow-y-auto",
          children: [
            /* @__PURE__ */ jsxs5("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6", children: [
              /* @__PURE__ */ jsxs5("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx5("label", { className: "block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "Name" }),
                /* @__PURE__ */ jsx5(
                  "input",
                  {
                    required: true,
                    type: "text",
                    className: "w-full px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all",
                    value: formData.name,
                    onChange: (e) => setFormData({ ...formData, name: e.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs5("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx5("label", { className: "block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "Location" }),
                /* @__PURE__ */ jsx5(
                  "input",
                  {
                    required: true,
                    type: "text",
                    className: "w-full px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all",
                    value: formData.location,
                    onChange: (e) => setFormData({ ...formData, location: e.target.value })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs5("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx5("label", { className: "block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "Client Partner" }),
              /* @__PURE__ */ jsxs5("div", { className: "relative", children: [
                /* @__PURE__ */ jsxs5(
                  "select",
                  {
                    required: true,
                    className: "w-full px-5 py-3 lg:py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-[#2E3191] outline-none font-black text-slate-800 appearance-none cursor-pointer",
                    value: formData.clientId,
                    onChange: (e) => setFormData({ ...formData, clientId: e.target.value }),
                    children: [
                      /* @__PURE__ */ jsx5("option", { value: "", disabled: true, children: "Select Client..." }),
                      clients.map((c) => /* @__PURE__ */ jsx5("option", { value: c.id, children: c.name }, c.id))
                    ]
                  }
                ),
                /* @__PURE__ */ jsx5("div", { className: "absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300", children: /* @__PURE__ */ jsx5(ChevronDown, { size: 20 }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs5("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx5("label", { className: "block text-[9px] lg:text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "Quotation Type" }),
              /* @__PURE__ */ jsx5("div", { className: "grid grid-cols-3 gap-2", children: [
                {
                  type: "Supply and Fabrication" /* SUPPLY_AND_FABRICATION */,
                  label: "Supply & Fab",
                  icon: /* @__PURE__ */ jsx5(Factory, { size: 18 })
                },
                {
                  type: "Structural Fabrication" /* STRUCTURAL_FABRICATION */,
                  label: "Structural Fab",
                  icon: /* @__PURE__ */ jsx5(Hammer, { size: 18 })
                },
                {
                  type: "Job Work" /* JOB_WORK */,
                  label: "Job Work",
                  icon: /* @__PURE__ */ jsx5(Truck, { size: 18 })
                }
              ].map((wf) => /* @__PURE__ */ jsxs5(
                "button",
                {
                  type: "button",
                  onClick: () => setFormData({ ...formData, workflow: wf.type }),
                  className: `p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center ${formData.workflow === wf.type ? "bg-[#2E3191] border-[#2E3191] text-white shadow-lg" : "bg-slate-50 border-slate-100 text-slate-400 hover:border-[#2E3191]/30"}`,
                  children: [
                    /* @__PURE__ */ jsx5(
                      "div",
                      {
                        className: `w-10 h-10 rounded-xl flex items-center justify-center ${formData.workflow === wf.type ? "bg-white/20" : "bg-white shadow-sm"}`,
                        children: wf.icon
                      }
                    ),
                    /* @__PURE__ */ jsx5("p", { className: "text-[8px] font-black uppercase tracking-tight leading-none h-4 flex items-center", children: wf.label })
                  ]
                },
                wf.type
              )) })
            ] }),
            /* @__PURE__ */ jsxs5("div", { className: "flex gap-3 pt-4", children: [
              /* @__PURE__ */ jsx5(
                "button",
                {
                  type: "button",
                  onClick: closeModal,
                  className: "flex-1 px-4 py-4 border-2 border-slate-100 text-slate-400 font-black rounded-2xl uppercase text-[10px] tracking-widest",
                  children: "Abort"
                }
              ),
              /* @__PURE__ */ jsx5(
                "button",
                {
                  type: "submit",
                  className: "flex-1 px-4 py-4 bg-[#EC1C24] text-white font-black rounded-2xl shadow-xl uppercase text-[10px] tracking-widest active:scale-95",
                  children: editingProject ? "Save" : "Launch"
                }
              )
            ] })
          ]
        }
      )
    ] }) })
  ] });
};
var Projects_default = Projects;

// pages/ProjectDetails.tsx
import { useState as useState5, useEffect as useEffect2, useRef } from "react";
import { useParams, useNavigate as useNavigate3 } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Trash2 as Trash23,
  Eye,
  Save,
  FileText as FileText3,
  MapPin as MapPin3,
  ChevronUp,
  ChevronDown as ChevronDown2,
  Loader2 as Loader22,
  X as X4,
  PenTool,
  Grid3X3,
  Columns,
  List,
  Type,
  MessageSquare,
  Download,
  Contact,
  Ruler,
  FilePlus,
  PlusCircle,
  Building
} from "lucide-react";

// components/QuotationPreview.tsx
import React6 from "react";
import { Fragment as Fragment2, jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
var QuotationPreview = ({ quotation, branding, client, project }) => {
  const sections = quotation.sections;
  const showsIndex = project.workflow === "Supply and Fabrication" /* SUPPLY_AND_FABRICATION */;
  const PageSeparator = ({ num }) => /* @__PURE__ */ jsxs6("div", { className: "no-print w-full flex items-center gap-4 py-12 pointer-events-none select-none", children: [
    /* @__PURE__ */ jsx6("div", { className: "h-px flex-1 bg-dashed border-t-2 border-slate-100" }),
    /* @__PURE__ */ jsxs6("div", { className: "px-4 py-1 bg-slate-50 border border-slate-100 rounded-full flex items-center gap-2", children: [
      /* @__PURE__ */ jsx6("div", { className: "w-1.5 h-1.5 rounded-full bg-[#EC1C24] animate-pulse" }),
      /* @__PURE__ */ jsxs6("span", { className: "text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]", children: [
        "SYSTEM PAGE ",
        num < 10 ? `0${num}` : num
      ] })
    ] }),
    /* @__PURE__ */ jsx6("div", { className: "h-px flex-1 bg-dashed border-t-2 border-slate-100" })
  ] });
  const OfficialFooter = (pageNum) => /* @__PURE__ */ jsx6("div", { className: "mt-auto no-print", children: branding.footerImage ? /* @__PURE__ */ jsxs6("div", { className: "w-full relative", children: [
    /* @__PURE__ */ jsx6("img", { src: branding.footerImage, alt: "Footer Banner", className: "w-full object-fill h-32 mb-0" }),
    pageNum && /* @__PURE__ */ jsxs6("div", { className: "absolute bottom-1 right-2 text-[5px] font-black text-slate-400 uppercase tracking-widest bg-white/10 px-1 rounded", children: [
      "Pg. ",
      pageNum
    ] })
  ] }) : /* @__PURE__ */ jsxs6("div", { className: "flex justify-between items-end border-t border-slate-100 pt-4 p-8", children: [
    /* @__PURE__ */ jsxs6("div", { className: "grid grid-cols-2 gap-8 text-[9px] text-slate-500 font-medium", children: [
      /* @__PURE__ */ jsxs6("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx6("p", { className: "font-black text-[#EC1C24] uppercase tracking-widest text-[10px]", children: "Nagpur - Office" }),
        /* @__PURE__ */ jsxs6("p", { children: [
          "\u{1F4DE} ",
          branding.registry.phone1
        ] }),
        /* @__PURE__ */ jsxs6("p", { children: [
          "\u2709\uFE0F ",
          branding.registry.email
        ] }),
        /* @__PURE__ */ jsxs6("p", { children: [
          "\u{1F4CD} ",
          branding.registry.nagpurOffice
        ] })
      ] }),
      /* @__PURE__ */ jsxs6("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx6("p", { className: "font-black text-[#EC1C24] uppercase tracking-widest text-[10px]", children: "Delhi - (H.O.)" }),
        /* @__PURE__ */ jsxs6("p", { children: [
          "\u{1F4DE} ",
          branding.registry.phone2
        ] }),
        /* @__PURE__ */ jsx6("p", { children: "\u2709\uFE0F info@reviranexgen.com" }),
        /* @__PURE__ */ jsxs6("p", { children: [
          "\u{1F4CD} ",
          branding.registry.delhiOffice
        ] })
      ] })
    ] }),
    pageNum && /* @__PURE__ */ jsxs6("div", { className: "text-[5px] font-black text-slate-500 uppercase tracking-[0.2em]", children: [
      "Pg. ",
      pageNum
    ] })
  ] }) });
  const HeaderSection = () => branding.headerImage ? /* @__PURE__ */ jsx6("div", { className: "w-full mb-8", children: /* @__PURE__ */ jsx6("img", { src: branding.headerImage, alt: "Header", className: "w-full object-contain" }) }) : /* @__PURE__ */ jsxs6("div", { className: "flex justify-between items-start mb-12 p-12 pb-0", children: [
    /* @__PURE__ */ jsxs6("div", { className: "flex flex-col", children: [
      /* @__PURE__ */ jsx6(
        "div",
        {
          className: "p-3 rounded-xl mb-2 flex items-center justify-center",
          style: { backgroundColor: branding.logoBackgroundColor || "transparent" },
          children: /* @__PURE__ */ jsx6("img", { src: branding.logo, alt: "Logo", className: "h-14 object-contain" })
        }
      ),
      /* @__PURE__ */ jsx6("p", { className: "text-[10px] text-slate-400 font-bold uppercase tracking-widest", children: branding.headerText })
    ] }),
    /* @__PURE__ */ jsxs6("div", { className: "text-right", children: [
      /* @__PURE__ */ jsx6("h1", { className: "text-xl font-black text-[#2E3191]", children: branding.registry.name }),
      /* @__PURE__ */ jsxs6("p", { className: "text-[10px] text-slate-500 font-bold uppercase", children: [
        "CIN: ",
        branding.registry.cin
      ] })
    ] })
  ] });
  const StampOverlay = () => branding.stampSignature ? /* @__PURE__ */ jsx6(
    "div",
    {
      className: "absolute z-[100] pointer-events-none opacity-90",
      style: {
        right: "50px",
        bottom: "100px",
        width: "70px",
        height: "70px"
      },
      children: /* @__PURE__ */ jsx6("img", { src: branding.stampSignature, alt: "Official Stamp", className: "w-full h-full object-contain" })
    }
  ) : null;
  let globalPageCounter = 1;
  return /* @__PURE__ */ jsxs6("div", { className: "bg-white print:p-0 min-h-screen font-['Inter'] text-slate-800", children: [
    /* @__PURE__ */ jsxs6("div", { className: "max-w-4xl mx-auto shadow-sm border border-slate-100 mb-0 print:shadow-none print:border-none print:mb-0 print:p-0 relative page-break min-h-[1120px] flex flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsx6(HeaderSection, {}),
      /* @__PURE__ */ jsx6(StampOverlay, {}),
      /* @__PURE__ */ jsxs6("div", { className: "flex-1 px-12 pb-12", children: [
        /* @__PURE__ */ jsx6("div", { className: "mb-10 text-[12px] leading-relaxed", children: /* @__PURE__ */ jsxs6("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxs6("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxs6("p", { children: [
              /* @__PURE__ */ jsx6("span", { className: "font-bold", children: "Ref.:" }),
              " ",
              quotation.refNo
            ] }),
            /* @__PURE__ */ jsxs6("p", { children: [
              /* @__PURE__ */ jsx6("span", { className: "font-bold", children: "Enquiry No.:" }),
              " ",
              quotation.enquiryNo
            ] }),
            /* @__PURE__ */ jsxs6("p", { children: [
              /* @__PURE__ */ jsx6("span", { className: "font-bold", children: "Project Location:" }),
              " ",
              quotation.location
            ] })
          ] }),
          /* @__PURE__ */ jsxs6("div", { className: "text-right space-y-1", children: [
            /* @__PURE__ */ jsxs6("p", { children: [
              /* @__PURE__ */ jsx6("span", { className: "font-bold", children: "Date:" }),
              " ",
              quotation.date
            ] }),
            /* @__PURE__ */ jsxs6("p", { children: [
              /* @__PURE__ */ jsx6("span", { className: "font-bold", children: "Revision:" }),
              " R-00",
              quotation.version - 1
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx6("div", { className: "mb-4 text-center", children: /* @__PURE__ */ jsx6("h2", { className: "text-lg font-black border-b-2 border-slate-900 inline-block pb-0.5 px-4 uppercase tracking-tight", children: quotation.introText }) }),
        /* @__PURE__ */ jsxs6("div", { className: "mb-8 text-[12px]", children: [
          /* @__PURE__ */ jsx6("p", { className: "font-bold mb-2 uppercase text-slate-400", children: "To," }),
          /* @__PURE__ */ jsxs6("div", { className: "ml-4 space-y-1 pt-2", children: [
            /* @__PURE__ */ jsxs6("p", { className: "font-black text-[#2E3191] text-sm uppercase", children: [
              "M/s ",
              quotation.recipientName
            ] }),
            /* @__PURE__ */ jsx6("p", { className: "font-bold text-slate-500 uppercase", children: quotation.location }),
            /* @__PURE__ */ jsxs6("div", { className: "pt-4", children: [
              /* @__PURE__ */ jsxs6("p", { className: "font-bold text-slate-900", children: [
                "Subject: ",
                /* @__PURE__ */ jsx6("span", { className: "font-bold", children: quotation.subject })
              ] }),
              /* @__PURE__ */ jsx6("p", { className: "font-bold pt-4", children: quotation.salutation })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx6("div", { className: "space-y-6 text-[12px] leading-relaxed ml-4 text-slate-700", children: quotation.introBody.split("\n\n").map((para, idx) => /* @__PURE__ */ jsx6("p", { className: "text-left leading-6", children: para }, idx)) }),
        /* @__PURE__ */ jsxs6("div", { className: "mt-16 text-[12px] ml-4", children: [
          /* @__PURE__ */ jsx6("p", { className: "font-bold mb-4 text-slate-400 uppercase tracking-widest", children: "Regards," }),
          /* @__PURE__ */ jsxs6("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx6("p", { className: "font-black text-lg text-[#2E3191] leading-tight", children: quotation.regardsName }),
            /* @__PURE__ */ jsxs6("p", { className: "font-bold text-slate-700", children: [
              "Mo: ",
              /* @__PURE__ */ jsx6("span", { className: "font-normal", children: quotation.regardsPhone })
            ] }),
            /* @__PURE__ */ jsxs6("p", { className: "font-bold text-slate-700", children: [
              "Email: ",
              /* @__PURE__ */ jsx6("span", { className: "font-normal text-blue-600 underline", children: quotation.regardsEmail })
            ] })
          ] })
        ] })
      ] }),
      OfficialFooter(globalPageCounter++)
    ] }),
    /* @__PURE__ */ jsx6(PageSeparator, { num: globalPageCounter }),
    showsIndex && /* @__PURE__ */ jsxs6("div", { className: "max-w-4xl mx-auto shadow-sm border border-slate-100 mb-0 print:shadow-none print:border-none print:mb-0 print:p-0 relative page-break min-h-[1120px] flex flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsx6(HeaderSection, {}),
      /* @__PURE__ */ jsx6(StampOverlay, {}),
      /* @__PURE__ */ jsxs6("div", { className: "flex-1 px-12 pb-12", children: [
        /* @__PURE__ */ jsx6("div", { className: "mb-12 text-center", children: /* @__PURE__ */ jsx6("h3", { className: "text-sm font-black uppercase tracking-[0.2em] border-b-2 border-[#EC1C24] inline-block pb-1 px-16", children: "INDEX" }) }),
        /* @__PURE__ */ jsx6("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs6("table", { className: "quotation-table w-full border-collapse text-[11px] border border-slate-400", style: { tableLayout: "fixed" }, children: [
          /* @__PURE__ */ jsx6("thead", { children: /* @__PURE__ */ jsxs6("tr", { className: "header-row", children: [
            /* @__PURE__ */ jsx6("th", { className: "border border-slate-400 p-[5px] text-center font-black uppercase w-[80px]", children: "Sr. No." }),
            /* @__PURE__ */ jsx6("th", { className: "border border-slate-400 p-[5px] text-left font-black uppercase", children: "Subject" }),
            /* @__PURE__ */ jsx6("th", { className: "border border-slate-400 p-[5px] text-center font-black uppercase w-[120px]", children: "Page No." })
          ] }) }),
          /* @__PURE__ */ jsxs6("tbody", { children: [
            sections.map((section, idx) => /* @__PURE__ */ jsxs6("tr", { className: idx % 2 !== 0 ? "zebra-row" : "", children: [
              /* @__PURE__ */ jsx6("td", { className: "border border-slate-400 p-[5px] text-center font-bold text-slate-700 w-[80px]", children: (idx + 1).toString().padStart(2, "0") }),
              /* @__PURE__ */ jsx6("td", { className: "border border-slate-400 p-[5px] text-left font-bold text-[#2E3191] uppercase tracking-tight break-words", children: /* @__PURE__ */ jsx6("a", { href: `#section-${section.id}`, className: "hover:underline", children: section.title }) }),
              /* @__PURE__ */ jsx6("td", { className: "border border-slate-400 p-[5px] text-center font-bold text-slate-400 w-[120px]", children: idx + 3 })
            ] }, section.id)),
            quotation.designMockups && quotation.designMockups.length > 0 && /* @__PURE__ */ jsxs6("tr", { className: sections.length % 2 !== 0 ? "zebra-row" : "", children: [
              /* @__PURE__ */ jsx6("td", { className: "border border-slate-400 p-[5px] text-center font-bold text-slate-700 w-[80px]", children: (sections.length + 1).toString().padStart(2, "0") }),
              /* @__PURE__ */ jsx6("td", { className: "border border-slate-400 p-[5px] text-left font-bold text-[#2E3191] uppercase tracking-tight break-words", children: "DESIGN MOCKUP" }),
              /* @__PURE__ */ jsx6("td", { className: "border border-slate-400 p-[5px] text-center font-bold text-slate-400 w-[120px]", children: sections.length + 3 })
            ] })
          ] })
        ] }) })
      ] }),
      OfficialFooter(globalPageCounter++)
    ] }),
    showsIndex && /* @__PURE__ */ jsx6(PageSeparator, { num: globalPageCounter }),
    sections.map((section, idx) => /* @__PURE__ */ jsxs6(React6.Fragment, { children: [
      /* @__PURE__ */ jsxs6("div", { id: `section-${section.id}`, className: "max-w-4xl mx-auto shadow-sm border border-slate-100 mb-0 print:shadow-none print:border-none print:mb-0 print:p-0 relative page-break min-h-[1120px] flex flex-col overflow-hidden", children: [
        /* @__PURE__ */ jsx6(HeaderSection, {}),
        /* @__PURE__ */ jsx6(StampOverlay, {}),
        /* @__PURE__ */ jsxs6("div", { className: "flex-1 px-12 pb-12", children: [
          /* @__PURE__ */ jsx6("div", { className: "mb-6", children: /* @__PURE__ */ jsx6("h3", { className: "text-sm font-black text-slate-900 tracking-tight uppercase border-l-4 border-[#EC1C24] pl-4", children: section.title }) }),
          section.content && /* @__PURE__ */ jsx6("div", { className: "text-[12px] text-slate-700 mb-6 leading-relaxed text-left whitespace-pre-wrap", children: section.content }),
          section.type === "table" && /* @__PURE__ */ jsx6("div", { className: "overflow-x-auto mb-8", children: /* @__PURE__ */ jsxs6("table", { className: "quotation-table w-full border-collapse text-[11px] border border-slate-400", style: { tableLayout: "fixed" }, children: [
            /* @__PURE__ */ jsx6("thead", { children: /* @__PURE__ */ jsx6("tr", { className: "header-row", children: section.headers.map((h, i) => {
              const hText = h.toLowerCase();
              const isSrNo = hText.includes("sr.") || hText.includes("sl.") || hText.includes("sr. no.") || hText.includes("sl. no.") || hText === "no" || hText === "no.";
              const customWidth = section.columnWidths?.[i];
              let width = "auto";
              if (isSrNo) width = "80px";
              else if (customWidth) width = `${customWidth}mm`;
              else if (hText.includes("uom") || hText.includes("qty")) width = "80px";
              else if (hText.includes("rate") || hText.includes("amount")) width = "120px";
              return /* @__PURE__ */ jsx6("th", { style: { width }, className: `border border-slate-400 p-[5px] font-black uppercase break-words ${isSrNo ? "text-center" : "text-left"}`, children: isSrNo ? "Sr. No." : h }, i);
            }) }) }),
            /* @__PURE__ */ jsx6("tbody", { children: section.rows.map((row, ri) => /* @__PURE__ */ jsx6("tr", { className: ri % 2 !== 0 ? "zebra-row" : "", children: row.map((cell, ci) => {
              const hText = section.headers[ci]?.toLowerCase() || "";
              const isSrNo = hText.includes("sr.") || hText.includes("sl.") || hText.includes("sr. no.") || hText.includes("sl. no.") || hText === "no" || hText === "no.";
              const isNumeric = hText.includes("rate") || hText.includes("amount") || hText.includes("qty");
              return /* @__PURE__ */ jsx6("td", { className: `border border-slate-400 p-[5px] font-medium text-slate-800 break-words ${isSrNo ? "text-center font-bold align-top" : isNumeric ? "text-right align-top" : "text-left align-top"}`, children: /* @__PURE__ */ jsx6("div", { className: "whitespace-pre-wrap leading-relaxed h-auto overflow-visible", children: cell }) }, ci);
            }) }, ri)) })
          ] }) }),
          (section.type === "list" || section.type === "mixed") && /* @__PURE__ */ jsx6("div", { className: "space-y-4 text-[12px] leading-relaxed", children: section.items && section.items.length > 0 && /* @__PURE__ */ jsx6("ul", { className: "space-y-4 pl-6", children: section.items.map((item, i) => /* @__PURE__ */ jsx6("li", { className: "list-disc marker:text-[#EC1C24] text-slate-700 font-normal leading-relaxed text-left", children: item }, i)) }) }),
          idx === sections.length - 1 && /* @__PURE__ */ jsxs6("div", { className: "mt-16 text-left space-y-8 animate-fade-in pb-12", children: [
            /* @__PURE__ */ jsx6("div", { className: "text-[12px] text-slate-700 font-medium max-w-full space-y-4", children: (quotation.closingBody || "").split("\n\n").map((para, pIdx) => /* @__PURE__ */ jsx6("p", { className: "text-left leading-6", children: para }, pIdx)) }),
            /* @__PURE__ */ jsxs6("div", { className: "pt-10 border-t border-slate-100", children: [
              /* @__PURE__ */ jsx6("p", { className: "font-bold text-[12px] mb-3 text-slate-900 tracking-tight italic", children: "Thanking you" }),
              /* @__PURE__ */ jsx6("h4", { className: "text-base font-black text-[#2E3191] uppercase tracking-tighter leading-tight", children: branding.registry.name }),
              /* @__PURE__ */ jsx6("p", { className: "text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mt-16 text-center", children: "!! End of Documents!!" })
            ] })
          ] })
        ] }),
        OfficialFooter(globalPageCounter++)
      ] }),
      idx < sections.length - 1 && /* @__PURE__ */ jsx6(PageSeparator, { num: globalPageCounter })
    ] }, section.id)),
    quotation.designMockups && quotation.designMockups.length > 0 && /* @__PURE__ */ jsxs6(Fragment2, { children: [
      /* @__PURE__ */ jsx6(PageSeparator, { num: globalPageCounter }),
      /* @__PURE__ */ jsxs6("div", { className: "max-w-4xl mx-auto shadow-sm border border-slate-100 mb-0 print:shadow-none print:border-none print:mb-0 print:p-0 relative page-break min-h-[1120px] flex flex-col overflow-hidden", children: [
        /* @__PURE__ */ jsx6(HeaderSection, {}),
        /* @__PURE__ */ jsx6(StampOverlay, {}),
        /* @__PURE__ */ jsxs6("div", { className: "flex-1 px-12 pb-12", children: [
          /* @__PURE__ */ jsx6("div", { className: "mb-8", children: /* @__PURE__ */ jsx6("h3", { className: "text-sm font-black text-[#EC1C24] tracking-tight uppercase border-b-2 border-[#EC1C24] inline-block pb-1", children: "Design Mockup" }) }),
          /* @__PURE__ */ jsx6("div", { className: "grid grid-cols-1 gap-12", children: quotation.designMockups.map((mockup, midx) => /* @__PURE__ */ jsx6("div", { className: "w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm", children: /* @__PURE__ */ jsx6("img", { src: mockup, alt: `Design Mockup ${midx + 1}`, className: "w-full object-contain max-h-[700px] bg-slate-50" }) }, midx)) })
        ] }),
        OfficialFooter(globalPageCounter++)
      ] })
    ] }),
    /* @__PURE__ */ jsx6("style", { children: `
        @media print {
          .page-break { page-break-after: always; break-after: page; }
          body { background-color: white !important; }
          .no-print { display: none !important; }
        }
        .header-row { background-color: #FDF2F2 !important; }
        .zebra-row { background-color: #F9F9FA !important; }
        .quotation-table { border: 1px solid #94a3b8 !important; border-collapse: collapse !important; width: 100% !important; }
        .quotation-table th, .quotation-table td { border: 1px solid #94a3b8 !important; padding: 6px !important; }
        .quotation-table th { color: #1e293b; line-height: 1.2; text-align: center; vertical-align: middle; }
        .quotation-table td { line-height: 1.5; }
      ` })
  ] });
};
var QuotationPreview_default = QuotationPreview;

// pages/ProjectDetails.tsx
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
var AutoExpandingTextarea = ({ value, onChange, className, placeholder }) => {
  const textareaRef = useRef(null);
  useEffect2(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);
  return /* @__PURE__ */ jsx7(
    "textarea",
    {
      ref: textareaRef,
      value,
      onChange: (e) => onChange(e.target.value),
      className: `${className} resize-none overflow-hidden block w-full outline-none focus:outline-none`,
      placeholder,
      rows: 1
    }
  );
};
var ProjectDetails = ({
  projects,
  clients,
  quotations,
  branding,
  onAddQuotation,
  onUpdateQuotation,
  onDeleteQuotation,
  onDuplicateQuotation
}) => {
  const { projectId } = useParams();
  const navigate = useNavigate3();
  const [selectedQuoteId, setSelectedQuoteId] = useState5(null);
  const [localQuote, setLocalQuote] = useState5(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState5(false);
  const [showTableModal, setShowTableModal] = useState5(false);
  const [tableConfig, setTableConfig] = useState5({ rows: 3, cols: 3 });
  const [isSaving, setIsSaving] = useState5(false);
  const [isExporting, setIsExporting] = useState5(false);
  const [saveStatus, setSaveStatus] = useState5(
    "idle"
  );
  const [isDirty, setIsDirty] = useState5(false);
  const [notifications, setNotifications] = useState5([]);
  const project = projects.find((p) => p.id === projectId);
  const client = clients.find((c) => c.id === project?.clientId);
  const projectQuotes = quotations.filter((q) => q.projectId === projectId).sort((a, b) => b.version - a.version);
  useEffect2(() => {
    if (projectQuotes.length > 0 && !selectedQuoteId) {
      setSelectedQuoteId(projectQuotes[projectQuotes.length - 1].id);
    }
  }, [projectQuotes, selectedQuoteId]);
  useEffect2(() => {
    const quote = quotations.find((q) => q.id === selectedQuoteId);
    if (quote) {
      setLocalQuote(JSON.parse(JSON.stringify(quote)));
      setSaveStatus("idle");
      setIsDirty(false);
    }
  }, [selectedQuoteId, quotations]);
  const addNotification = (type, message) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { type, message, id }]);
    setTimeout(
      () => setNotifications((prev) => prev.filter((n) => n.id !== id)),
      4e3
    );
  };
  if (!project || !client) return null;
  const handleLocalUpdate = (updates) => {
    if (localQuote) {
      setLocalQuote((prev) => prev ? { ...prev, ...updates } : null);
      setIsDirty(true);
    }
  };
  const moveSection = (index, direction) => {
    if (!localQuote) return;
    const newSections = [...localQuote.sections];
    if (direction === "up" && index > 0)
      [newSections[index], newSections[index - 1]] = [
        newSections[index - 1],
        newSections[index]
      ];
    else if (direction === "down" && index < newSections.length - 1)
      [newSections[index], newSections[index + 1]] = [
        newSections[index + 1],
        newSections[index]
      ];
    handleLocalUpdate({ sections: newSections });
  };
  const addTableWithDimensions = () => {
    if (!localQuote) return;
    const { rows, cols } = tableConfig;
    const headers = new Array(cols).fill("").map((_, i) => i === 0 ? "Sr. No." : `Attribute ${i + 1}`);
    const initialRows = new Array(rows).fill("").map(() => new Array(cols).fill(""));
    const columnWidths = new Array(cols).fill(null).map((_, i) => i === 0 ? 21 : null);
    const newSection = {
      id: Math.random().toString(36).substr(2, 9),
      title: "NEW DATA MATRIX",
      type: "table",
      headers,
      rows: initialRows,
      items: [],
      content: "",
      columnWidths
    };
    handleLocalUpdate({ sections: [...localQuote.sections, newSection] });
    setShowTableModal(false);
  };
  const addColumnToSection = (sectionId) => {
    if (!localQuote) return;
    const newSections = localQuote.sections.map((s) => {
      if (s.id === sectionId) {
        return {
          ...s,
          headers: [...s.headers, `Col ${s.headers.length + 1}`],
          rows: s.rows.map((r) => [...r, ""]),
          columnWidths: [
            ...s.columnWidths || new Array(s.headers.length).fill(null),
            null
          ]
        };
      }
      return s;
    });
    handleLocalUpdate({ sections: newSections });
  };
  const removeColumnFromSection = (sectionId, colIdx) => {
    if (!localQuote) return;
    const newSections = localQuote.sections.map((s) => {
      if (s.id === sectionId) {
        return {
          ...s,
          headers: s.headers.filter((_, i) => i !== colIdx),
          rows: s.rows.map((r) => r.filter((_, i) => i !== colIdx)),
          columnWidths: (s.columnWidths || new Array(s.headers.length).fill(null)).filter((_, i) => i !== colIdx)
        };
      }
      return s;
    });
    handleLocalUpdate({ sections: newSections });
  };
  const updateColumnWidth = (sectionId, colIdx, width) => {
    if (!localQuote) return;
    const newSections = localQuote.sections.map((s) => {
      if (s.id === sectionId) {
        const newWidths = [
          ...s.columnWidths || new Array(s.headers.length).fill(null)
        ];
        newWidths[colIdx] = width;
        return { ...s, columnWidths: newWidths };
      }
      return s;
    });
    handleLocalUpdate({ sections: newSections });
  };
  const handleSaveToDatabase = async () => {
    if (!localQuote) return;
    setIsSaving(true);
    try {
      await onUpdateQuotation(localQuote.id, localQuote);
      setSaveStatus("success");
      setIsDirty(false);
      addNotification("success", "Offer synchronized with master storage.");
    } catch (error) {
      setSaveStatus("error");
      addNotification("error", "Sync Failure.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleExportPDF = async () => {
    if (!localQuote) return;
    setIsExporting(true);
    addNotification("info", "Rendering Dynamic PDF Matrix...");
    try {
      const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const margin = 12;
      const pageWidth = 210;
      const pageHeight = 297;
      const contentWidth = pageWidth - margin * 2;
      const headerH = (120 + 10) * 0.264583;
      const footerH = (100 + 5 + 4) * 0.264583;
      const footerY = pageHeight - footerH;
      const brandBlue = [46, 49, 145];
      const brandRed = [236, 28, 36];
      const tableHeaderBg = [253, 242, 242];
      const zebraBg = [249, 249, 250];
      let currentPage = 1;
      let indexPageNum = -1;
      const sectionPageMap = {};
      const drawHeader = (d) => {
        if (branding.headerImage) {
          try {
            d.addImage(branding.headerImage, "JPEG", 0, 0, pageWidth, headerH);
          } catch (e) {
          }
        } else {
          d.setFillColor(255, 255, 255).rect(0, 0, pageWidth, headerH, "F");
          d.setFontSize(14).setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]).setFont("helvetica", "bold").text(branding.registry.name, pageWidth / 2, 12, {
            align: "center"
          });
          d.setFontSize(8).setTextColor(100).setFont("helvetica", "normal").text(`CIN - ${branding.registry.cin}`, pageWidth / 2, 17, {
            align: "center"
          });
        }
      };
      const drawFooter = (d, pageNum) => {
        if (branding.footerImage) {
          try {
            d.addImage(
              branding.footerImage,
              "JPEG",
              0,
              footerY,
              pageWidth,
              footerH
            );
          } catch (e) {
          }
        } else {
          d.setFillColor(255, 255, 255).rect(
            0,
            footerY,
            pageWidth,
            footerH,
            "F"
          );
          d.setDrawColor(brandRed[0], brandRed[1], brandRed[2]).setLineWidth(0.4).line(margin, footerY + 2, margin + contentWidth, footerY + 2);
          d.setFontSize(7).setFont("helvetica", "bold").setTextColor(brandRed[0], brandRed[1], brandRed[2]);
          d.text("Nagpur - Office", margin, footerY + 8);
          d.text("Delhi - (H.O.)", margin + contentWidth / 2 + 5, footerY + 8);
          d.setFontSize(6).setFont("helvetica", "normal").setTextColor(80);
          const nagText = d.splitTextToSize(
            branding.registry.nagpurOffice,
            contentWidth / 2 - 10
          );
          d.text(nagText, margin, footerY + 12);
          const delText = d.splitTextToSize(
            branding.registry.delhiOffice,
            contentWidth / 2 - 10
          );
          d.text(delText, margin + contentWidth / 2 + 5, footerY + 12);
        }
        d.setFontSize(8).setTextColor(150).setFont("helvetica", "normal").text(
          `Pg. ${pageNum}`,
          pageWidth - margin - 5,
          footerY + footerH - 5
        );
      };
      const addNewPage = (d) => {
        d.addPage();
        currentPage++;
        drawHeader(d);
        drawFooter(d, currentPage);
        return headerH + 8;
      };
      drawHeader(doc);
      drawFooter(doc, currentPage);
      let y = headerH + 10;
      doc.setFontSize(9).setTextColor(0).setFont("helvetica", "bold");
      doc.text(`Ref.: ${localQuote.refNo}`, margin, y);
      doc.text(`Date: ${localQuote.date}`, pageWidth - margin, y, {
        align: "right"
      });
      y += 5;
      doc.text(`Enquiry No.: ${localQuote.enquiryNo}`, margin, y);
      y += 5;
      doc.text(`Project Location: ${localQuote.location}`, margin, y);
      y += 15;
      doc.setFontSize(13).setTextColor(0).setFont("helvetica", "bold");
      const coverTitle = localQuote.introText.toUpperCase();
      doc.text(coverTitle, pageWidth / 2, y, { align: "center" });
      doc.line(
        (pageWidth - doc.getTextWidth(coverTitle)) / 2,
        y + 1,
        (pageWidth + doc.getTextWidth(coverTitle)) / 2,
        y + 1
      );
      y += 15;
      doc.setFontSize(10).setFont("helvetica", "bold").text("To,", margin, y);
      y += 6;
      doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]).setFontSize(11).text(`M/s ${localQuote.recipientName}`, margin + 5, y);
      y += 6;
      doc.setFontSize(9).setTextColor(100).text(localQuote.location, margin + 5, y);
      y += 12;
      doc.setTextColor(0).setFontSize(10).setFont("helvetica", "bold").text(`Subject: ${localQuote.subject}`, margin + 5, y);
      y += 8;
      doc.text(localQuote.salutation, margin + 5, y);
      y += 8;
      doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(60);
      const introLines = doc.splitTextToSize(
        localQuote.introBody,
        contentWidth - 10
      );
      doc.text(introLines, margin + 5, y);
      y += introLines.length * 5 + 15;
      doc.setFont("helvetica", "bold").setTextColor(150).text("Regards,", margin + 5, y);
      y += 8;
      doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]).setFontSize(12).text(localQuote.regardsName, margin + 5, y);
      y += 6;
      doc.setTextColor(80).setFontSize(9).setFont("helvetica", "normal").text(`Mo: ${localQuote.regardsPhone}`, margin + 5, y);
      y += 5;
      doc.text(`Email: ${localQuote.regardsEmail}`, margin + 5, y);
      if (project.workflow === "Supply and Fabrication" /* SUPPLY_AND_FABRICATION */) {
        y = addNewPage(doc);
        indexPageNum = currentPage;
        doc.setFontSize(14).setFont("helvetica", "bold").setTextColor(brandRed[0], brandRed[1], brandRed[2]).text("INDEX", pageWidth / 2, y, { align: "center" });
        y += 12;
        doc.setLineWidth(0.2).setDrawColor(150);
        doc.setFillColor(tableHeaderBg[0], tableHeaderBg[1], tableHeaderBg[2]).rect(margin, y, contentWidth, 10, "F");
        doc.rect(margin, y, contentWidth, 10);
        doc.line(margin + 20, y, margin + 20, y + 10);
        doc.line(
          margin + contentWidth - 30,
          y,
          margin + contentWidth - 30,
          y + 10
        );
        doc.setFontSize(10).setTextColor(0).setFont("helvetica", "bold");
        doc.text("Sr. No.", margin + 4, y + 6.5);
        doc.text("Subject", margin + 25, y + 6.5);
        doc.text("Page No.", margin + contentWidth - 25, y + 6.5);
        y += 10;
      }
      localQuote.sections.forEach((section, sIdx) => {
        if (sIdx === 0 || y > footerY - 40) y = addNewPage(doc);
        else y += 10;
        sectionPageMap[section.id] = currentPage;
        doc.setFillColor(brandRed[0], brandRed[1], brandRed[2]).rect(margin, y - 4, 3, 7, "F");
        doc.setFontSize(11).setFont("helvetica", "bold").setTextColor(0).text(section.title.toUpperCase(), margin + 6, y + 1.5);
        y += 10;
        if (section.content) {
          doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(60);
          const cLines = doc.splitTextToSize(section.content, contentWidth);
          doc.text(cLines, margin, y);
          y += cLines.length * 4.5 + 5;
        }
        if (section.type === "table") {
          const totalFixed = (section.columnWidths || []).reduce(
            (acc, w) => acc + (w || 0),
            0
          );
          const autoColsCount = section.headers.length - (section.columnWidths || []).filter((w) => w !== null).length;
          const autoWidth = autoColsCount > 0 ? (contentWidth - totalFixed) / autoColsCount : 0;
          const colWidthsCalculated = section.headers.map(
            (_, i) => section.columnWidths?.[i] || autoWidth
          );
          doc.setLineWidth(0.2).setDrawColor(180);
          doc.setFillColor(tableHeaderBg[0], tableHeaderBg[1], tableHeaderBg[2]).rect(margin, y, contentWidth, 10, "F");
          doc.rect(margin, y, contentWidth, 10);
          doc.setFontSize(8).setFont("helvetica", "bold").setTextColor(0);
          let currentHeaderX = margin;
          section.headers.forEach((h, hi) => {
            if (hi > 0) doc.line(currentHeaderX, y, currentHeaderX, y + 10);
            doc.text(h, currentHeaderX + 2, y + 6);
            currentHeaderX += colWidthsCalculated[hi];
          });
          y += 10;
          section.rows.forEach((row, ri) => {
            let maxLines = 1;
            const rowContents = row.map((cell, ci) => {
              const lines = doc.splitTextToSize(
                cell,
                colWidthsCalculated[ci] - 4
              );
              maxLines = Math.max(maxLines, lines.length);
              return lines;
            });
            const rowH = maxLines * 4 + 3;
            if (y + rowH > footerY - 5) {
              y = addNewPage(doc);
              doc.setFillColor(
                tableHeaderBg[0],
                tableHeaderBg[1],
                tableHeaderBg[2]
              ).rect(margin, y, contentWidth, 10, "F");
              doc.rect(margin, y, contentWidth, 10);
              let tempX = margin;
              section.headers.forEach((h, hi) => {
                if (hi > 0) doc.line(tempX, y, tempX, y + 10);
                doc.text(h, tempX + 2, y + 6);
                tempX += colWidthsCalculated[hi];
              });
              y += 10;
            }
            if (ri % 2 !== 0)
              doc.setFillColor(zebraBg[0], zebraBg[1], zebraBg[2]).rect(margin, y, contentWidth, rowH, "F");
            doc.rect(margin, y, contentWidth, rowH);
            let tempRowX = margin;
            rowContents.forEach((lines, ci) => {
              if (ci > 0) doc.line(tempRowX, y, tempRowX, y + rowH);
              doc.setFontSize(8).setFont("helvetica", "normal").setTextColor(20).text(lines, tempRowX + 2, y + 4.5);
              tempRowX += colWidthsCalculated[ci];
            });
            y += rowH;
          });
        }
        if (section.type === "list" || section.type === "mixed") {
          section.items.forEach((item) => {
            const iLines = doc.splitTextToSize(item, contentWidth - 10);
            const itemH = iLines.length * 5 + 1.5;
            if (y + itemH > footerY - 5) y = addNewPage(doc);
            doc.setFillColor(brandRed[0], brandRed[1], brandRed[2]).circle(margin + 2.5, y + 1.5, 0.7, "F");
            doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(60).text(iLines, margin + 7, y + 2.5);
            y += itemH;
          });
        }
        if (sIdx === localQuote.sections.length - 1) {
          y += 12;
          if (y > footerY - 60) y = addNewPage(doc);
          doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(40);
          const closeLines = doc.splitTextToSize(
            localQuote.closingBody,
            contentWidth
          );
          doc.text(closeLines, margin, y);
          y += closeLines.length * 5 + 10;
          doc.setDrawColor(240).line(margin, y, margin + contentWidth, y);
          y += 8;
          doc.setFontSize(10).setTextColor(0).setFont("helvetica", "bold").text("Thanking you", margin, y);
          y += 8;
          doc.setFontSize(13).setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]).setFont("helvetica", "bold").text(branding.registry.name, margin, y);
          doc.setFontSize(9).setTextColor(200).setFont("helvetica", "bold").text("!! End of Documents !!", pageWidth / 2, footerY - 3, {
            align: "center"
          });
        }
      });
      if (indexPageNum !== -1) {
        doc.setPage(indexPageNum);
        let indexY = headerH + 10 + 12 + 10;
        localQuote.sections.forEach((s, idx) => {
          doc.setLineWidth(0.2).setDrawColor(150);
          doc.rect(margin, indexY, contentWidth, 9);
          doc.line(margin + 20, indexY, margin + 20, indexY + 9);
          doc.line(
            margin + contentWidth - 30,
            indexY,
            margin + contentWidth - 30,
            indexY + 9
          );
          doc.setFontSize(9).setTextColor(0).setFont("helvetica", "normal");
          doc.text(
            (idx + 1).toString().padStart(2, "0"),
            margin + 10,
            indexY + 6,
            { align: "center" }
          );
          doc.setFont("helvetica", "bold").setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
          doc.text(s.title.toUpperCase(), margin + 25, indexY + 6);
          doc.setFont("helvetica", "normal").setTextColor(150);
          doc.text(
            sectionPageMap[s.id].toString(),
            margin + contentWidth - 15,
            indexY + 6,
            { align: "center" }
          );
          indexY += 9;
        });
      }
      if (branding.stampSignature) {
        const totalPages = doc.getNumberOfPages();
        const sWidth = 70 * 0.264583;
        const sHeight = 70 * 0.264583;
        const sX = pageWidth - 50 * 0.264583 - sWidth;
        const sY = pageHeight - 100 * 0.264583 - sHeight;
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          try {
            doc.addImage(
              branding.stampSignature,
              "PNG",
              sX,
              sY,
              sWidth,
              sHeight,
              void 0,
              "FAST"
            );
          } catch (e) {
          }
        }
      }
      doc.save(`Quotation_${localQuote.refNo.replace(/\//g, "_")}.pdf`);
      addNotification("success", "Corporate Offer Cluster Dispatched.");
    } catch (e) {
      addNotification("error", `PDF Render Conflict: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };
  return /* @__PURE__ */ jsxs7("div", { className: "space-y-6 pb-24 relative bg-slate-50/20 min-h-full animate-fade-in", children: [
    /* @__PURE__ */ jsx7("div", { className: "fixed top-20 right-4 lg:right-8 z-[120] space-y-3 pointer-events-none w-80", children: notifications.map((n) => /* @__PURE__ */ jsx7(
      "div",
      {
        className: `pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-start gap-3 animate-slide-in-right ${n.type === "success" ? "bg-[#2E3191] text-white border-white/10" : n.type === "error" ? "bg-[#EC1C24] text-white border-white/10" : "bg-blue-50 text-blue-900 border-blue-100"}`,
        children: /* @__PURE__ */ jsx7("p", { className: "text-[10px] font-black uppercase tracking-widest", children: n.message })
      },
      n.id
    )) }),
    /* @__PURE__ */ jsxs7("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm", children: [
      /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx7(
          "button",
          {
            onClick: () => navigate("/projects"),
            className: "p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-[#2E3191] transition-all focus:ring-2 focus:ring-[#2E3191]/10",
            children: /* @__PURE__ */ jsx7(ArrowLeft, { size: 20 })
          }
        ),
        /* @__PURE__ */ jsxs7("div", { children: [
          /* @__PURE__ */ jsx7("h1", { className: "text-xl lg:text-2xl font-black text-[#2E3191] uppercase tracking-tight", children: project.name }),
          /* @__PURE__ */ jsxs7("p", { className: "text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx7(MapPin3, { size: 12, className: "text-[#EC1C24]" }),
            " ",
            project.location
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx7("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxs7(
        "button",
        {
          onClick: () => onAddQuotation(project.id),
          className: "px-6 py-4 bg-[#2E3191] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-[#2E3191]/20 hover:scale-105 active:scale-95 flex items-center gap-2",
          children: [
            /* @__PURE__ */ jsx7(FilePlus, { size: 16 }),
            " New Quotation"
          ]
        }
      ) })
    ] }),
    localQuote ? /* @__PURE__ */ jsxs7("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs7("div", { className: "bg-[#2E3191] p-4 lg:p-5 rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-4 z-40 border border-white/10 mx-1", children: [
        /* @__PURE__ */ jsxs7("div", { className: "flex items-center overflow-x-auto no-scrollbar space-x-3 py-1 px-1 flex-1", children: [
          /* @__PURE__ */ jsx7("span", { className: "text-[9px] font-black text-white/30 uppercase tracking-widest mr-2", children: "Versions:" }),
          projectQuotes.map((q) => /* @__PURE__ */ jsx7(
            "button",
            {
              onClick: () => setSelectedQuoteId(q.id),
              className: `w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all shrink-0 border-2 ${selectedQuoteId === q.id ? "bg-[#EC1C24] text-white border-white shadow-[0_8px_16px_-4px_rgba(236,28,36,0.5)] scale-110 z-10" : "bg-white/10 text-white/30 border-white/5 hover:bg-white/20 hover:text-white"}`,
              children: q.version
            },
            q.id
          ))
        ] }),
        /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-2 lg:gap-3 shrink-0", children: [
          /* @__PURE__ */ jsx7(
            "button",
            {
              onClick: () => setIsPreviewOpen(true),
              className: "p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all group",
              title: "View Quotation (Preview)",
              children: /* @__PURE__ */ jsx7(Eye, { size: 20, className: "group-hover:scale-110" })
            }
          ),
          /* @__PURE__ */ jsx7(
            "button",
            {
              onClick: () => onDuplicateQuotation(localQuote.id),
              className: "p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all group",
              title: "Duplicate Current Version",
              children: /* @__PURE__ */ jsx7(Copy, { size: 20, className: "group-hover:scale-110" })
            }
          ),
          /* @__PURE__ */ jsxs7(
            "button",
            {
              onClick: handleExportPDF,
              disabled: isExporting,
              className: `flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isExporting ? "bg-white/10 text-white/30" : "bg-emerald-500 text-white shadow-lg active:scale-95"}`,
              children: [
                isExporting ? /* @__PURE__ */ jsx7(Loader22, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsx7(Download, { size: 16 }),
                "Export PDF"
              ]
            }
          ),
          /* @__PURE__ */ jsxs7(
            "button",
            {
              onClick: handleSaveToDatabase,
              disabled: !isDirty || isSaving,
              className: `flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isSaving ? "bg-white/10 text-white/30" : isDirty ? "bg-white text-[#2E3191] animate-save-pulse" : "bg-white/5 text-white/20 cursor-default"}`,
              children: [
                isSaving ? /* @__PURE__ */ jsx7(Loader22, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsx7(Save, { size: 14 }),
                saveStatus === "success" ? "Synced" : "Save Changes"
              ]
            }
          ),
          /* @__PURE__ */ jsx7(
            "button",
            {
              onClick: () => {
                onDeleteQuotation(localQuote.id);
                setSelectedQuoteId(null);
              },
              className: "p-3 bg-white/10 text-white/30 hover:text-[#EC1C24] rounded-xl transition-all",
              title: "Purge Version",
              children: /* @__PURE__ */ jsx7(Trash23, { size: 20 })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs7("div", { className: "bg-white rounded-[3rem] p-8 lg:p-12 border border-slate-100 shadow-sm space-y-12", children: [
        /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-3 border-b border-slate-50 pb-6", children: [
          /* @__PURE__ */ jsx7(PenTool, { size: 22, className: "text-[#EC1C24]" }),
          /* @__PURE__ */ jsx7("h2", { className: "text-xl lg:text-2xl font-black text-[#2E3191] uppercase tracking-tight", children: "Technical Proposal Metadata" })
        ] }),
        /* @__PURE__ */ jsxs7("div", { className: "space-y-10", children: [
          /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
            /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs7("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx7("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "Ref ID" }),
                /* @__PURE__ */ jsx7(
                  "input",
                  {
                    className: "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs font-bold focus:ring-2 focus:ring-[#2E3191]/5",
                    value: localQuote.refNo,
                    onChange: (e) => handleLocalUpdate({ refNo: e.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs7("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx7("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "Creation Date" }),
                /* @__PURE__ */ jsx7(
                  "input",
                  {
                    className: "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs font-bold focus:ring-2 focus:ring-[#2E3191]/5",
                    value: localQuote.date,
                    onChange: (e) => handleLocalUpdate({ date: e.target.value })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs7("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx7("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "Enquiry Ref" }),
                /* @__PURE__ */ jsx7(
                  "input",
                  {
                    className: "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs font-bold focus:ring-2 focus:ring-[#2E3191]/5",
                    value: localQuote.enquiryNo,
                    onChange: (e) => handleLocalUpdate({ enquiryNo: e.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs7("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx7("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "Project Site (Legacy)" }),
                /* @__PURE__ */ jsx7(
                  "input",
                  {
                    className: "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#2E3191]/5",
                    value: localQuote.location,
                    onChange: (e) => handleLocalUpdate({ location: e.target.value })
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs7("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsx7("div", { className: "bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-inner", children: /* @__PURE__ */ jsxs7("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx7("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "Proposal Header Title" }),
              /* @__PURE__ */ jsx7(
                "input",
                {
                  className: "w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-black uppercase transition-all focus:ring-4 focus:ring-[#2E3191]/5",
                  value: localQuote.introText,
                  onChange: (e) => handleLocalUpdate({ introText: e.target.value })
                }
              )
            ] }) }),
            /* @__PURE__ */ jsx7("div", { className: "bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-inner", children: /* @__PURE__ */ jsxs7("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx7("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "Client Subject Specification" }),
              /* @__PURE__ */ jsx7(
                "input",
                {
                  className: "w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold transition-all focus:ring-4 focus:ring-[#2E3191]/5",
                  value: localQuote.subject,
                  onChange: (e) => handleLocalUpdate({ subject: e.target.value })
                }
              )
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs7("div", { className: "bg-white rounded-[2.5rem] p-8 lg:p-10 border-2 border-[#2E3191]/5 space-y-6 animate-fade-in shadow-lg shadow-[#2E3191]/5", children: [
            /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-3 border-b border-slate-50 pb-4", children: [
              /* @__PURE__ */ jsx7(Building, { size: 20, className: "text-[#EC1C24]" }),
              /* @__PURE__ */ jsx7("h3", { className: "text-sm font-black text-[#2E3191] uppercase tracking-tight", children: "Main Covering Letter (Recipient Block)" })
            ] }),
            /* @__PURE__ */ jsxs7("div", { className: "p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-6", children: [
              /* @__PURE__ */ jsx7("p", { className: "text-[11px] font-black text-[#EC1C24] uppercase tracking-[0.2em] mb-4", children: "To," }),
              /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
                /* @__PURE__ */ jsxs7("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx7("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "Company Name" }),
                  /* @__PURE__ */ jsx7(
                    "input",
                    {
                      className: "w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-black uppercase outline-none focus:ring-4 focus:ring-[#2E3191]/10 transition-all",
                      value: localQuote.recipientName,
                      onChange: (e) => handleLocalUpdate({ recipientName: e.target.value }),
                      placeholder: "M/s Organisation Name"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs7("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx7("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "Project Location (Site)" }),
                  /* @__PURE__ */ jsx7(
                    "input",
                    {
                      className: "w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#2E3191]/10 transition-all",
                      value: localQuote.location,
                      onChange: (e) => handleLocalUpdate({ location: e.target.value }),
                      placeholder: "Site Location Address"
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs7("div", { className: "space-y-2 pt-4", children: [
              /* @__PURE__ */ jsx7("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "Main Covering Letter Context (Body)" }),
              /* @__PURE__ */ jsx7(
                "textarea",
                {
                  className: "w-full px-6 py-6 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] text-sm font-medium h-64 leading-relaxed outline-none focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 transition-all shadow-inner",
                  value: localQuote.introBody,
                  onChange: (e) => handleLocalUpdate({ introBody: e.target.value })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs7("div", { className: "bg-[#2E3191]/5 p-8 rounded-[2.5rem] border border-[#2E3191]/10 space-y-6", children: [
            /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-3 border-b border-[#2E3191]/10 pb-4", children: [
              /* @__PURE__ */ jsx7(Contact, { size: 20, className: "text-[#EC1C24]" }),
              /* @__PURE__ */ jsx7("h4", { className: "text-[10px] font-black text-[#2E3191] uppercase tracking-widest", children: "Master Signatory Authority" })
            ] }),
            /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
              /* @__PURE__ */ jsxs7("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx7("p", { className: "text-[8px] font-black text-slate-400 uppercase ml-1", children: "Full Legal Name" }),
                /* @__PURE__ */ jsx7(
                  "input",
                  {
                    className: "w-full px-5 py-3 bg-white border border-slate-100 rounded-xl text-xs font-black text-[#2E3191]",
                    value: localQuote.regardsName,
                    onChange: (e) => handleLocalUpdate({ regardsName: e.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs7("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx7("p", { className: "text-[8px] font-black text-slate-400 uppercase ml-1", children: "Contact Handset" }),
                /* @__PURE__ */ jsx7(
                  "input",
                  {
                    className: "w-full px-5 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-[#2E3191]",
                    value: localQuote.regardsPhone,
                    onChange: (e) => handleLocalUpdate({ regardsPhone: e.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs7("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx7("p", { className: "text-[8px] font-black text-slate-400 uppercase ml-1", children: "Official SMTP Channel" }),
                /* @__PURE__ */ jsx7(
                  "input",
                  {
                    className: "w-full px-5 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-[#2E3191]",
                    value: localQuote.regardsEmail,
                    onChange: (e) => handleLocalUpdate({ regardsEmail: e.target.value })
                  }
                )
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs7("div", { className: "space-y-8", children: [
        localQuote.sections.map((section, idx) => /* @__PURE__ */ jsxs7(
          "div",
          {
            className: "bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-100 shadow-sm space-y-6 group hover:border-[#2E3191]/20 transition-all",
            children: [
              /* @__PURE__ */ jsxs7("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-4 flex-1", children: [
                  /* @__PURE__ */ jsx7("div", { className: "w-10 h-10 rounded-xl bg-[#2E3191] text-white flex items-center justify-center font-black text-xs", children: (idx + 1).toString().padStart(2, "0") }),
                  /* @__PURE__ */ jsx7(
                    "input",
                    {
                      className: "flex-1 bg-transparent border-b-2 border-transparent focus:border-[#EC1C24] outline-none font-black uppercase text-[#2E3191] text-sm py-1 transition-all",
                      value: section.title,
                      onChange: (e) => handleLocalUpdate({
                        sections: localQuote.sections.map(
                          (s) => s.id === section.id ? { ...s, title: e.target.value } : s
                        )
                      })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity", children: [
                  section.type === "table" && /* @__PURE__ */ jsxs7(
                    "button",
                    {
                      onClick: () => addColumnToSection(section.id),
                      className: "p-2 text-[#2E3191] hover:bg-blue-50 rounded-xl flex items-center gap-1 text-[9px] font-black uppercase",
                      children: [
                        /* @__PURE__ */ jsx7(Columns, { size: 16 }),
                        " + Column"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx7(
                    "button",
                    {
                      onClick: () => moveSection(idx, "up"),
                      className: "p-2 text-slate-300 hover:text-[#2E3191]",
                      children: /* @__PURE__ */ jsx7(ChevronUp, { size: 20 })
                    }
                  ),
                  /* @__PURE__ */ jsx7(
                    "button",
                    {
                      onClick: () => moveSection(idx, "down"),
                      className: "p-2 text-slate-300 hover:text-[#2E3191]",
                      children: /* @__PURE__ */ jsx7(ChevronDown2, { size: 20 })
                    }
                  ),
                  /* @__PURE__ */ jsx7(
                    "button",
                    {
                      onClick: () => handleLocalUpdate({
                        sections: localQuote.sections.filter(
                          (s) => s.id !== section.id
                        )
                      }),
                      className: "p-2 text-slate-200 hover:text-[#EC1C24] transition-all",
                      children: /* @__PURE__ */ jsx7(X4, { size: 20 })
                    }
                  )
                ] })
              ] }),
              section.type === "table" && /* @__PURE__ */ jsxs7("div", { className: "overflow-x-auto rounded-3xl border border-slate-50 pb-4", children: [
                /* @__PURE__ */ jsxs7("table", { className: "w-full text-xs border-collapse", children: [
                  /* @__PURE__ */ jsx7("thead", { className: "bg-slate-50 font-black uppercase tracking-widest border-b border-slate-100", children: /* @__PURE__ */ jsxs7("tr", { children: [
                    /* @__PURE__ */ jsx7("th", { className: "p-5 text-center border-r w-12 text-slate-400", children: "#" }),
                    section.headers.map((h, hi) => {
                      const isSrNo = h.toLowerCase().includes("sr.") || h.toLowerCase().includes("sl.");
                      const currentWidth = section.columnWidths?.[hi];
                      return /* @__PURE__ */ jsx7(
                        "th",
                        {
                          className: "p-5 text-left border-r last:border-r-0 relative group/col",
                          children: /* @__PURE__ */ jsxs7("div", { className: "space-y-2", children: [
                            /* @__PURE__ */ jsxs7("div", { className: "flex items-center justify-between gap-2", children: [
                              /* @__PURE__ */ jsx7(
                                "input",
                                {
                                  className: "bg-transparent outline-none w-full font-black text-[#2E3191]",
                                  value: h,
                                  onChange: (e) => {
                                    const newH = [...section.headers];
                                    newH[hi] = e.target.value;
                                    handleLocalUpdate({
                                      sections: localQuote.sections.map(
                                        (s) => s.id === section.id ? { ...s, headers: newH } : s
                                      )
                                    });
                                  }
                                }
                              ),
                              !isSrNo && hi > 0 && /* @__PURE__ */ jsx7(
                                "button",
                                {
                                  onClick: () => removeColumnFromSection(
                                    section.id,
                                    hi
                                  ),
                                  className: "opacity-0 group-hover/col:opacity-100 text-[#EC1C24]",
                                  children: /* @__PURE__ */ jsx7(X4, { size: 14 })
                                }
                              )
                            ] }),
                            /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-1 opacity-20 group-hover/col:opacity-100 transition-opacity", children: [
                              /* @__PURE__ */ jsx7(
                                Ruler,
                                {
                                  size: 10,
                                  className: "text-slate-400"
                                }
                              ),
                              /* @__PURE__ */ jsx7(
                                "input",
                                {
                                  type: "number",
                                  className: "bg-white border border-slate-200 rounded px-1 text-[9px] w-12 outline-none font-bold",
                                  placeholder: "Auto",
                                  value: currentWidth || "",
                                  onChange: (e) => updateColumnWidth(
                                    section.id,
                                    hi,
                                    e.target.value === "" ? null : parseInt(e.target.value)
                                  )
                                }
                              ),
                              /* @__PURE__ */ jsx7("span", { className: "text-[7px] text-slate-400 font-black", children: "MM" })
                            ] })
                          ] })
                        },
                        hi
                      );
                    }),
                    /* @__PURE__ */ jsx7("th", { className: "p-5 text-center w-12" })
                  ] }) }),
                  /* @__PURE__ */ jsx7("tbody", { className: "divide-y divide-slate-50", children: section.rows.map((row, ri) => /* @__PURE__ */ jsxs7(
                    "tr",
                    {
                      className: "hover:bg-slate-50/50 group/row",
                      children: [
                        /* @__PURE__ */ jsx7("td", { className: "p-5 text-center border-r text-xs font-black text-slate-300", children: ri + 1 }),
                        row.map((cell, ci) => /* @__PURE__ */ jsx7(
                          "td",
                          {
                            className: "p-5 border-r last:border-r-0 font-bold text-slate-600",
                            children: /* @__PURE__ */ jsx7(
                              AutoExpandingTextarea,
                              {
                                value: cell,
                                onChange: (val) => {
                                  const newRows = [...section.rows];
                                  newRows[ri] = [...newRows[ri]];
                                  newRows[ri][ci] = val;
                                  handleLocalUpdate({
                                    sections: localQuote.sections.map(
                                      (s) => s.id === section.id ? { ...s, rows: newRows } : s
                                    )
                                  });
                                },
                                className: "bg-transparent text-xs"
                              }
                            )
                          },
                          ci
                        )),
                        /* @__PURE__ */ jsx7("td", { className: "p-5 text-center", children: /* @__PURE__ */ jsx7(
                          "button",
                          {
                            onClick: () => handleLocalUpdate({
                              sections: localQuote.sections.map(
                                (s) => s.id === section.id ? {
                                  ...s,
                                  rows: s.rows.filter(
                                    (_, i) => i !== ri
                                  )
                                } : s
                              )
                            }),
                            className: "opacity-0 group-hover/row:opacity-100 p-2 text-slate-200 hover:text-[#EC1C24] transition-all",
                            children: /* @__PURE__ */ jsx7(Trash23, { size: 16 })
                          }
                        ) })
                      ]
                    },
                    ri
                  )) })
                ] }),
                /* @__PURE__ */ jsxs7(
                  "button",
                  {
                    onClick: () => handleLocalUpdate({
                      sections: localQuote.sections.map(
                        (s) => s.id === section.id ? {
                          ...s,
                          rows: [
                            ...s.rows,
                            new Array(s.headers.length).fill("")
                          ]
                        } : s
                      )
                    }),
                    className: "w-full p-5 text-[10px] font-black uppercase text-[#2E3191] hover:bg-slate-50 border-t border-dashed border-slate-100 transition-all flex items-center justify-center gap-2",
                    children: [
                      /* @__PURE__ */ jsx7(PlusCircle, { size: 16 }),
                      " Add Ledger Entry"
                    ]
                  }
                )
              ] }),
              section.type === "list" && /* @__PURE__ */ jsxs7("div", { className: "space-y-4", children: [
                section.items.map((item, ii) => /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsx7("div", { className: "w-1.5 h-1.5 rounded-full bg-[#EC1C24] shrink-0" }),
                  /* @__PURE__ */ jsx7(
                    AutoExpandingTextarea,
                    {
                      value: item,
                      onChange: (val) => {
                        const newI = [...section.items];
                        newI[ii] = val;
                        handleLocalUpdate({
                          sections: localQuote.sections.map(
                            (s) => s.id === section.id ? { ...s, items: newI } : s
                          )
                        });
                      },
                      className: "flex-1 bg-slate-50/50 p-5 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-[#2E3191] focus:bg-white transition-all shadow-inner"
                    }
                  ),
                  /* @__PURE__ */ jsx7(
                    "button",
                    {
                      onClick: () => handleLocalUpdate({
                        sections: localQuote.sections.map(
                          (s) => s.id === section.id ? {
                            ...s,
                            items: s.items.filter((_, i) => i !== ii)
                          } : s
                        )
                      }),
                      className: "p-2 text-slate-200 hover:text-[#EC1C24] transition-all",
                      children: /* @__PURE__ */ jsx7(X4, { size: 20 })
                    }
                  )
                ] }, ii)),
                /* @__PURE__ */ jsx7(
                  "button",
                  {
                    onClick: () => handleLocalUpdate({
                      sections: localQuote.sections.map(
                        (s) => s.id === section.id ? { ...s, items: [...s.items, ""] } : s
                      )
                    }),
                    className: "text-[10px] font-black uppercase text-[#2E3191] ml-6 hover:underline transition-all",
                    children: "+ Append Bullet Specification"
                  }
                )
              ] }),
              section.type === "text" && /* @__PURE__ */ jsx7(
                "textarea",
                {
                  className: "w-full bg-slate-50/50 p-8 rounded-[2rem] text-xs font-medium leading-relaxed outline-none border border-transparent focus:border-[#2E3191] focus:bg-white h-48 transition-all shadow-inner",
                  value: section.content,
                  onChange: (e) => handleLocalUpdate({
                    sections: localQuote.sections.map(
                      (s) => s.id === section.id ? { ...s, content: e.target.value } : s
                    )
                  })
                }
              )
            ]
          },
          section.id
        )),
        /* @__PURE__ */ jsxs7("div", { className: "bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-8", children: [
          /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-3 border-b border-slate-50 pb-4", children: [
            /* @__PURE__ */ jsx7(MessageSquare, { size: 22, className: "text-[#EC1C24]" }),
            /* @__PURE__ */ jsx7("h2", { className: "text-xl font-black text-[#2E3191] uppercase tracking-tight", children: "Closing Affirmation" })
          ] }),
          /* @__PURE__ */ jsxs7("div", { className: "space-y-8", children: [
            /* @__PURE__ */ jsxs7("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx7("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "Commercial Wrap-Up Text" }),
              /* @__PURE__ */ jsx7(
                "textarea",
                {
                  className: "w-full px-6 py-6 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] text-xs font-medium h-40 leading-relaxed outline-none focus:bg-white transition-all shadow-inner",
                  value: localQuote.closingBody,
                  onChange: (e) => handleLocalUpdate({ closingBody: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50", children: [
              /* @__PURE__ */ jsxs7("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx7("p", { className: "text-[9px] font-black uppercase tracking-widest text-slate-400", children: "Formal Sign-Off" }),
                /* @__PURE__ */ jsx7("p", { className: "text-sm font-bold text-slate-800 p-5 bg-slate-50 rounded-2xl border border-slate-100 italic", children: "Thanking you" })
              ] }),
              /* @__PURE__ */ jsxs7("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx7("p", { className: "text-[9px] font-black uppercase tracking-widest text-slate-400", children: "Entity Authorization Signature" }),
                /* @__PURE__ */ jsx7("p", { className: "text-sm font-black text-[#2E3191] p-5 bg-slate-50 rounded-2xl border border-slate-100 uppercase tracking-tight", children: branding.registry.name })
              ] })
            ] }),
            /* @__PURE__ */ jsx7("div", { className: "pt-10 text-center", children: /* @__PURE__ */ jsx7("p", { className: "text-[11px] font-black text-slate-200 uppercase tracking-[0.8em]", children: "!! DOCUMENT TERMINATION !!" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs7("div", { className: "flex flex-wrap items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsxs7(
            "button",
            {
              onClick: () => setShowTableModal(true),
              className: "px-8 py-5 bg-white border-2 border-slate-100 rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-[#2E3191] hover:border-[#2E3191] hover:shadow-xl transition-all flex items-center gap-3",
              children: [
                /* @__PURE__ */ jsx7(Grid3X3, { size: 20 }),
                " Deploy Matrix"
              ]
            }
          ),
          /* @__PURE__ */ jsxs7(
            "button",
            {
              onClick: () => handleLocalUpdate({
                sections: [
                  ...localQuote.sections,
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    title: "NEW TECHNICAL SPECIFICATIONS",
                    type: "list",
                    headers: [],
                    rows: [],
                    items: [""],
                    content: ""
                  }
                ]
              }),
              className: "px-8 py-5 bg-white border-2 border-slate-100 rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-emerald-600 hover:border-emerald-500 hover:shadow-xl transition-all flex items-center gap-3",
              children: [
                /* @__PURE__ */ jsx7(List, { size: 20 }),
                " Deploy List"
              ]
            }
          ),
          /* @__PURE__ */ jsxs7(
            "button",
            {
              onClick: () => handleLocalUpdate({
                sections: [
                  ...localQuote.sections,
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    title: "TECHNICAL COMMENTARY",
                    type: "text",
                    headers: [],
                    rows: [],
                    items: [],
                    content: "Enter technical context here..."
                  }
                ]
              }),
              className: "px-8 py-5 bg-white border-2 border-slate-100 rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-amber-600 hover:border-amber-500 hover:shadow-xl transition-all flex items-center gap-3",
              children: [
                /* @__PURE__ */ jsx7(Type, { size: 20 }),
                " Deploy Text"
              ]
            }
          )
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxs7("div", { className: "h-[60vh] flex flex-col items-center justify-center text-slate-300 bg-white rounded-[3rem] border border-dashed border-slate-200", children: [
      /* @__PURE__ */ jsx7("div", { className: "p-8 rounded-[2rem] bg-slate-50 mb-6", children: /* @__PURE__ */ jsx7(FileText3, { size: 64, className: "opacity-10" }) }),
      /* @__PURE__ */ jsx7("p", { className: "font-black uppercase tracking-[0.3em] text-xs mb-8", children: "No Active Versions Discovered" }),
      /* @__PURE__ */ jsx7(
        "button",
        {
          onClick: () => onAddQuotation(project.id),
          className: "px-10 py-5 bg-[#2E3191] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#2E3191]/20 active:scale-95 transition-all",
          children: "Generate Master Draft V1"
        }
      )
    ] }),
    isPreviewOpen && localQuote && /* @__PURE__ */ jsxs7("div", { className: "fixed inset-0 z-[110] bg-white flex flex-col animate-fade-in overflow-y-auto", children: [
      /* @__PURE__ */ jsxs7("div", { className: "flex items-center justify-between p-6 bg-[#2E3191] sticky top-0 z-50 no-print border-b border-white/10", children: [
        /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs7("div", { className: "w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-black text-xs", children: [
            "V",
            localQuote.version
          ] }),
          /* @__PURE__ */ jsx7("h2", { className: "text-white font-black uppercase text-xs tracking-widest", children: localQuote.refNo })
        ] }),
        /* @__PURE__ */ jsxs7("div", { className: "flex gap-4", children: [
          /* @__PURE__ */ jsxs7(
            "button",
            {
              onClick: handleExportPDF,
              className: "px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 shadow-xl flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsx7(Download, { size: 14 }),
                " Download PDF"
              ]
            }
          ),
          /* @__PURE__ */ jsx7(
            "button",
            {
              onClick: () => setIsPreviewOpen(false),
              className: "p-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors",
              children: /* @__PURE__ */ jsx7(X4, { size: 24 })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx7("div", { className: "flex-1 p-0 flex justify-center bg-slate-50/50 print:bg-white", children: /* @__PURE__ */ jsx7("div", { className: "w-full max-w-4xl shadow-2xl bg-white print:shadow-none print:max-w-none my-8 lg:my-16 border border-slate-200/50 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsx7(
        QuotationPreview_default,
        {
          quotation: localQuote,
          branding,
          client,
          project
        }
      ) }) })
    ] }),
    showTableModal && /* @__PURE__ */ jsx7("div", { className: "fixed inset-0 z-[130] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs7("div", { className: "bg-white rounded-[3rem] w-full max-w-xs p-10 space-y-8 animate-fade-in border border-slate-100", children: [
      /* @__PURE__ */ jsx7("h3", { className: "text-xl font-black text-[#2E3191] uppercase text-center tracking-tight", children: "Matrix Geometry" }),
      /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs7("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx7("label", { className: "text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1", children: "Rows" }),
          /* @__PURE__ */ jsx7(
            "input",
            {
              type: "number",
              className: "w-full p-5 bg-slate-50 rounded-2xl text-center font-black text-[#2E3191] outline-none focus:ring-4 focus:ring-[#2E3191]/5",
              value: tableConfig.rows,
              onChange: (e) => setTableConfig({
                ...tableConfig,
                rows: Math.max(1, parseInt(e.target.value) || 1)
              })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs7("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx7("label", { className: "text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1", children: "Columns" }),
          /* @__PURE__ */ jsx7(
            "input",
            {
              type: "number",
              className: "w-full p-5 bg-slate-50 rounded-2xl text-center font-black text-[#2E3191] outline-none focus:ring-4 focus:ring-[#2E3191]/5",
              value: tableConfig.cols,
              onChange: (e) => setTableConfig({
                ...tableConfig,
                cols: Math.max(1, parseInt(e.target.value) || 1)
              })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs7("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx7(
          "button",
          {
            onClick: () => setShowTableModal(false),
            className: "flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest",
            children: "Abort"
          }
        ),
        /* @__PURE__ */ jsx7(
          "button",
          {
            onClick: addTableWithDimensions,
            className: "flex-1 py-4 bg-[#EC1C24] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all",
            children: "Construct"
          }
        )
      ] })
    ] }) })
  ] });
};
var ProjectDetails_default = ProjectDetails;

// pages/InvoiceManagement.tsx
import { useState as useState6, useEffect as useEffect3 } from "react";
import { useParams as useParams2, useNavigate as useNavigate4 } from "react-router-dom";
import {
  ArrowLeft as ArrowLeft2,
  Trash2 as Trash24,
  Eye as Eye2,
  Save as Save2,
  CheckCircle2,
  Send,
  Loader2 as Loader23,
  X as X5,
  AlertCircle,
  PenTool as PenTool2,
  Grid3X3 as Grid3X32,
  Calculator,
  Building2,
  ReceiptText,
  Copy as Copy2,
  MessageCircle,
  Mail as MailIcon,
  Download as Download2
} from "lucide-react";

// components/InvoicePreview.tsx
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
var InvoicePreview = ({ invoice, branding, client, project }) => {
  const basicTotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const igst = invoice.taxType === "Inter-State" ? basicTotal * 0.18 : 0;
  const cgst = invoice.taxType === "Intra-State" ? basicTotal * 0.09 : 0;
  const sgst = invoice.taxType === "Intra-State" ? basicTotal * 0.09 : 0;
  const grandTotal = basicTotal + igst + cgst + sgst;
  const rounded = Math.round(grandTotal);
  const roundOff = rounded - grandTotal;
  return /* @__PURE__ */ jsx8("div", { className: "w-full max-w-[210mm] bg-white p-[10mm] border border-slate-200 mx-auto shadow-2xl print:p-0 print:border-none print:shadow-none text-slate-900 font-['Inter']", children: /* @__PURE__ */ jsxs8("div", { className: "border-[0.5pt] border-slate-900 flex flex-col min-h-[277mm]", children: [
    /* @__PURE__ */ jsx8("div", { className: "text-center py-1.5 border-b-[0.5pt] border-slate-900 bg-slate-100", children: /* @__PURE__ */ jsx8("h1", { className: "text-sm font-black uppercase tracking-[0.2em]", children: "PROFORMA INVOICE" }) }),
    branding.headerImage ? /* @__PURE__ */ jsx8("div", { className: "w-full border-b-[0.5pt] border-slate-900", children: /* @__PURE__ */ jsx8("img", { src: branding.headerImage, alt: "Brand Header", className: "w-full h-auto block" }) }) : /* @__PURE__ */ jsxs8("div", { className: "flex border-b-[0.5pt] border-slate-900 p-4 items-center", children: [
      /* @__PURE__ */ jsx8("div", { className: "w-1/3", children: /* @__PURE__ */ jsx8("img", { src: branding.logo, alt: "Company Logo", className: "h-16 object-contain" }) }),
      /* @__PURE__ */ jsxs8("div", { className: "w-2/3 text-center pr-12", children: [
        /* @__PURE__ */ jsx8("h2", { className: "text-xl font-black text-[#2E3191] leading-tight", children: branding.registry.name }),
        /* @__PURE__ */ jsxs8("p", { className: "text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1", children: [
          "CIN - ",
          branding.registry.cin
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs8("div", { className: "grid grid-cols-12 border-b-[0.5pt] border-slate-900 text-[8.5pt] leading-tight", children: [
      /* @__PURE__ */ jsx8("div", { className: "col-span-5 border-r-[0.5pt] border-slate-900 p-2 space-y-1", children: /* @__PURE__ */ jsxs8("p", { children: [
        /* @__PURE__ */ jsx8("span", { className: "font-medium", children: "CIN:" }),
        " ",
        /* @__PURE__ */ jsx8("span", { className: "font-bold", children: branding.registry.cin })
      ] }) }),
      /* @__PURE__ */ jsx8("div", { className: "col-span-4 border-r-[0.5pt] border-slate-900 p-2 space-y-1", children: /* @__PURE__ */ jsxs8("p", { children: [
        /* @__PURE__ */ jsx8("span", { className: "font-medium", children: "Company GSTIN:" }),
        " ",
        /* @__PURE__ */ jsx8("span", { className: "font-bold", children: branding.registry.gstin })
      ] }) }),
      /* @__PURE__ */ jsx8("div", { className: "col-span-3 p-2 space-y-1", children: /* @__PURE__ */ jsxs8("p", { children: [
        /* @__PURE__ */ jsx8("span", { className: "font-medium", children: "PI No:" }),
        " ",
        /* @__PURE__ */ jsx8("span", { className: "font-bold", children: invoice.piNo })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs8("div", { className: "grid grid-cols-12 border-b-[0.5pt] border-slate-900 text-[8.5pt] leading-tight", children: [
      /* @__PURE__ */ jsx8("div", { className: "col-span-9 border-r-[0.5pt] border-slate-900 p-2 space-y-1", children: /* @__PURE__ */ jsxs8("p", { children: [
        /* @__PURE__ */ jsx8("span", { className: "font-medium", children: "Email:" }),
        " ",
        /* @__PURE__ */ jsx8("span", { className: "font-bold text-[#2E3191]", children: branding.registry.email })
      ] }) }),
      /* @__PURE__ */ jsx8("div", { className: "col-span-3 p-2 space-y-1", children: /* @__PURE__ */ jsxs8("p", { children: [
        /* @__PURE__ */ jsx8("span", { className: "font-medium", children: "Date:" }),
        " ",
        /* @__PURE__ */ jsx8("span", { className: "font-bold", children: invoice.date })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx8("div", { className: "bg-slate-100 p-2 border-b-[0.5pt] border-slate-900", children: /* @__PURE__ */ jsx8("p", { className: "text-[8.5pt] font-black uppercase tracking-widest", children: "Client Details:" }) }),
    /* @__PURE__ */ jsx8("table", { className: "w-full border-collapse text-[8.5pt] border-b-[0.5pt] border-slate-900", children: /* @__PURE__ */ jsxs8("tbody", { children: [
      /* @__PURE__ */ jsxs8("tr", { className: "border-b-[0.5pt] border-slate-900", children: [
        /* @__PURE__ */ jsx8("td", { className: "w-40 p-2 border-r-[0.5pt] border-slate-900 font-medium bg-slate-50/50", children: "Organisation Name:" }),
        /* @__PURE__ */ jsxs8("td", { className: "p-2 font-bold uppercase", children: [
          "M/s ",
          invoice.clientName
        ] })
      ] }),
      /* @__PURE__ */ jsxs8("tr", { className: "border-b-[0.5pt] border-slate-900", children: [
        /* @__PURE__ */ jsx8("td", { className: "w-40 p-2 border-r-[0.5pt] border-slate-900 font-medium bg-slate-50/50", children: "Registered Address:" }),
        /* @__PURE__ */ jsx8("td", { className: "p-2 font-bold uppercase", children: invoice.registeredAddress })
      ] }),
      /* @__PURE__ */ jsxs8("tr", { className: "border-b-[0.5pt] border-slate-900", children: [
        /* @__PURE__ */ jsx8("td", { className: "w-40 p-2 border-r-[0.5pt] border-slate-900 font-medium bg-slate-50/50", children: "Consignee Address:" }),
        /* @__PURE__ */ jsx8("td", { className: "p-2 font-bold uppercase whitespace-pre-wrap", children: invoice.consigneeAddress })
      ] }),
      /* @__PURE__ */ jsxs8("tr", { className: "border-b-[0.5pt] border-slate-900", children: [
        /* @__PURE__ */ jsx8("td", { className: "w-40 p-2 border-r-[0.5pt] border-slate-900 font-medium bg-slate-50/50", children: "GSTIN:" }),
        /* @__PURE__ */ jsx8("td", { className: "p-2 font-bold uppercase", children: invoice.gstin })
      ] }),
      /* @__PURE__ */ jsxs8("tr", { children: [
        /* @__PURE__ */ jsx8("td", { className: "w-40 p-2 border-r-[0.5pt] border-slate-900 font-medium bg-slate-50/50", children: "W.O.No.:" }),
        /* @__PURE__ */ jsx8("td", { className: "p-0", children: /* @__PURE__ */ jsxs8("div", { className: "flex w-full h-full items-center", children: [
          /* @__PURE__ */ jsx8("div", { className: "flex-1 p-2 font-bold uppercase", children: invoice.woNo }),
          /* @__PURE__ */ jsx8("div", { className: "w-40 p-2 border-l-[0.5pt] border-r-[0.5pt] border-slate-900 font-medium bg-slate-50/50 h-full flex items-center", children: "Dispatch Details:" }),
          /* @__PURE__ */ jsx8("div", { className: "flex-1 p-2 font-bold uppercase", children: invoice.dispatchDetails })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx8("div", { className: "flex-1", children: /* @__PURE__ */ jsxs8("table", { className: "w-full border-collapse text-[8pt] border-none", children: [
      /* @__PURE__ */ jsx8("thead", { children: /* @__PURE__ */ jsxs8("tr", { className: "bg-slate-100 border-b-[0.5pt] border-slate-900 font-bold", children: [
        /* @__PURE__ */ jsxs8("th", { className: "border-r-[0.5pt] border-slate-900 p-1 w-10 text-center", children: [
          "Sr.",
          /* @__PURE__ */ jsx8("br", {}),
          "No."
        ] }),
        /* @__PURE__ */ jsx8("th", { className: "border-r-[0.5pt] border-slate-900 p-1 text-left", children: "Description" }),
        /* @__PURE__ */ jsx8("th", { className: "border-r-[0.5pt] border-slate-900 p-1 w-20 text-center", children: "HSN Code" }),
        /* @__PURE__ */ jsx8("th", { className: "border-r-[0.5pt] border-slate-900 p-1 w-16 text-center", children: "Qty. (LS)" }),
        /* @__PURE__ */ jsx8("th", { className: "border-r-[0.5pt] border-slate-900 p-1 w-16 text-center", children: "Rate per KG" }),
        /* @__PURE__ */ jsx8("th", { className: "border-r-[0.5pt] border-slate-900 p-1 w-16 text-center", children: "Percentage" }),
        /* @__PURE__ */ jsx8("th", { className: "p-1 w-32 text-right", children: "Basic Amount (INR)" })
      ] }) }),
      /* @__PURE__ */ jsxs8("tbody", { children: [
        invoice.items.map((item, idx) => /* @__PURE__ */ jsxs8("tr", { className: `align-top border-b-[0.5pt] border-slate-900 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`, children: [
          /* @__PURE__ */ jsx8("td", { className: "border-r-[0.5pt] border-slate-900 p-2 text-center", children: idx + 1 }),
          /* @__PURE__ */ jsx8("td", { className: "border-r-[0.5pt] border-slate-900 p-2 font-bold uppercase", children: item.description }),
          /* @__PURE__ */ jsx8("td", { className: "border-r-[0.5pt] border-slate-900 p-2 text-center", children: item.hsnCode }),
          /* @__PURE__ */ jsx8("td", { className: "border-r-[0.5pt] border-slate-900 p-2 text-center font-bold", children: Math.round(item.qty) }),
          /* @__PURE__ */ jsx8("td", { className: "border-r-[0.5pt] border-slate-900 p-2 text-center", children: item.ratePerKg || "-" }),
          /* @__PURE__ */ jsxs8("td", { className: "border-r-[0.5pt] border-slate-900 p-2 text-center", children: [
            item.percentage,
            "%"
          ] }),
          /* @__PURE__ */ jsx8("td", { className: "p-2 text-right font-black text-[9.5pt]", children: item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 }) })
        ] }, item.id)),
        /* @__PURE__ */ jsxs8("tr", { className: `h-8 align-top border-b-[0.5pt] border-slate-900 ${invoice.items.length % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`, children: [
          /* @__PURE__ */ jsx8("td", { className: "border-r-[0.5pt] border-slate-900" }),
          /* @__PURE__ */ jsx8("td", { className: "border-r-[0.5pt] border-slate-900" }),
          /* @__PURE__ */ jsx8("td", { className: "border-r-[0.5pt] border-slate-900" }),
          /* @__PURE__ */ jsx8("td", { className: "border-r-[0.5pt] border-slate-900" }),
          /* @__PURE__ */ jsx8("td", { className: "border-r-[0.5pt] border-slate-900" }),
          /* @__PURE__ */ jsx8("td", { className: "border-r-[0.5pt] border-slate-900" }),
          /* @__PURE__ */ jsx8("td", {})
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs8("div", { className: "grid grid-cols-12 text-[8.5pt] border-t-[0.5pt] border-slate-900", children: [
      /* @__PURE__ */ jsxs8("div", { className: "col-span-8 border-r-[0.5pt] border-slate-900 flex flex-col", children: [
        /* @__PURE__ */ jsxs8("div", { className: "p-2 min-h-14 border-b-[0.5pt] border-slate-900 flex flex-col justify-start bg-white", children: [
          /* @__PURE__ */ jsx8("p", { className: "font-medium text-slate-500 uppercase text-[7pt] mb-1", children: "Total Amount In Words:" }),
          /* @__PURE__ */ jsx8("p", { className: "font-bold text-[#2E3191] uppercase leading-tight italic", children: invoice.amountInWords })
        ] }),
        /* @__PURE__ */ jsxs8("div", { className: "p-2 bg-slate-50/30 flex-1", children: [
          /* @__PURE__ */ jsx8("p", { className: "font-black text-[9pt] mb-2 uppercase border-b-[0.5pt] border-slate-200 inline-block", children: "Bank Details:" }),
          /* @__PURE__ */ jsxs8("div", { className: "grid grid-cols-1 gap-1 text-[8pt]", children: [
            /* @__PURE__ */ jsxs8("p", { children: [
              /* @__PURE__ */ jsx8("span", { className: "font-bold w-28 inline-block", children: "Account Name:" }),
              " ",
              invoice.bankDetails.accountName
            ] }),
            /* @__PURE__ */ jsxs8("p", { children: [
              /* @__PURE__ */ jsx8("span", { className: "font-bold w-28 inline-block", children: "Address:" }),
              " ",
              invoice.bankDetails.address
            ] }),
            /* @__PURE__ */ jsxs8("p", { children: [
              /* @__PURE__ */ jsx8("span", { className: "font-bold w-28 inline-block", children: "Account Number:" }),
              " ",
              invoice.bankDetails.accountNumber
            ] }),
            /* @__PURE__ */ jsxs8("p", { children: [
              /* @__PURE__ */ jsx8("span", { className: "font-bold w-28 inline-block", children: "IFSC Code:" }),
              " ",
              invoice.bankDetails.ifscCode
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs8("div", { className: "col-span-4 flex flex-col divide-y-[0.5pt] divide-slate-900 font-bold", children: [
        /* @__PURE__ */ jsxs8("div", { className: "flex justify-between p-2", children: [
          /* @__PURE__ */ jsx8("span", { children: "Total Amount (INR)" }),
          /* @__PURE__ */ jsx8("span", { children: basicTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 }) })
        ] }),
        /* @__PURE__ */ jsxs8("div", { className: "flex justify-between p-2 bg-slate-100", children: [
          /* @__PURE__ */ jsx8("span", { children: "Total Amount before Tax" }),
          /* @__PURE__ */ jsx8("span", { children: basicTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 }) })
        ] }),
        /* @__PURE__ */ jsxs8("div", { className: "flex justify-between p-2 font-medium", children: [
          /* @__PURE__ */ jsx8("span", { children: "(1) Add: CGST 9%" }),
          /* @__PURE__ */ jsx8("span", { children: cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 }) })
        ] }),
        /* @__PURE__ */ jsxs8("div", { className: "flex justify-between p-2 font-medium", children: [
          /* @__PURE__ */ jsx8("span", { children: "(2) Add: SGST 9%" }),
          /* @__PURE__ */ jsx8("span", { children: sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 }) })
        ] }),
        /* @__PURE__ */ jsxs8("div", { className: "flex justify-between p-2 font-medium", children: [
          /* @__PURE__ */ jsx8("span", { children: "(3) Add: IGST 18%" }),
          /* @__PURE__ */ jsx8("span", { children: igst.toLocaleString("en-IN", { minimumFractionDigits: 2 }) })
        ] }),
        /* @__PURE__ */ jsxs8("div", { className: "flex justify-between p-2 bg-slate-100 font-black", children: [
          /* @__PURE__ */ jsx8("span", { children: "Total GST" }),
          /* @__PURE__ */ jsx8("span", { children: (cgst + sgst + igst).toLocaleString("en-IN", { minimumFractionDigits: 2 }) })
        ] }),
        /* @__PURE__ */ jsxs8("div", { className: "flex justify-between p-2 text-[11pt] font-black text-[#EC1C24] bg-red-50/50", children: [
          /* @__PURE__ */ jsx8("span", { children: "Grand Total" }),
          /* @__PURE__ */ jsx8("span", { children: rounded.toLocaleString("en-IN") })
        ] }),
        /* @__PURE__ */ jsxs8("div", { className: "flex justify-between p-2 text-[7.5pt] font-medium text-slate-400", children: [
          /* @__PURE__ */ jsx8("span", { children: "Round Off" }),
          /* @__PURE__ */ jsx8("span", { children: roundOff.toFixed(2) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs8("div", { className: "flex border-t-[0.5pt] border-slate-900 h-32 relative", children: [
      /* @__PURE__ */ jsx8("div", { className: "w-1/2" }),
      /* @__PURE__ */ jsxs8("div", { className: "w-1/2 border-l-[0.5pt] border-slate-900 flex flex-col", children: [
        /* @__PURE__ */ jsxs8("div", { className: "text-center p-1.5 text-[8.5pt] font-black uppercase", children: [
          "For, ",
          branding.registry.name
        ] }),
        /* @__PURE__ */ jsx8("div", { className: "flex-1 flex items-center justify-center p-3 relative", children: branding.stampSignature ? /* @__PURE__ */ jsx8("img", { src: branding.stampSignature, alt: "Official Stamp", className: "h-24 w-auto object-contain opacity-90 absolute" }) : /* @__PURE__ */ jsx8("div", { className: "border border-slate-200 p-2 rounded-lg rotate-[-3deg] opacity-20", children: /* @__PURE__ */ jsx8("p", { className: "font-mono text-[7pt] uppercase tracking-widest", children: "Verified Digitally" }) }) }),
        /* @__PURE__ */ jsx8("div", { className: "text-center border-t-[0.5pt] border-slate-900 p-1.5 text-[8.5pt] font-black bg-slate-100 uppercase tracking-widest", children: "Authorised Signatory" })
      ] })
    ] })
  ] }) });
};
var InvoicePreview_default = InvoicePreview;

// pages/InvoiceManagement.tsx
import { jsPDF as jsPDF2 } from "https://esm.sh/jspdf@2.5.1";
import { Fragment as Fragment3, jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
function numberToWords(num) {
  if (num === 0) return "Zero";
  const a = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";
  let str = "";
  str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore " : "";
  str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lakh " : "";
  str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "Thousand " : "";
  str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "Hundred " : "";
  str += Number(n[5]) !== 0 ? (str !== "" ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) : "";
  return str.trim() + " Only";
}
var InvoiceManagement = ({
  projects,
  clients,
  invoices,
  branding,
  onAddInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  onDuplicateInvoice
}) => {
  const { projectId } = useParams2();
  const navigate = useNavigate4();
  const [selectedId, setSelectedId] = useState6(null);
  const [localInvoice, setLocalInvoice] = useState6(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState6(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState6(false);
  const [dispatchStep, setDispatchStep] = useState6("choice");
  const [emailCompose, setEmailCompose] = useState6({ to: "", subject: "", body: "" });
  const [isSaving, setIsSaving] = useState6(false);
  const [isDownloading, setIsDownloading] = useState6(false);
  const [isSendingEmail, setIsSendingEmail] = useState6(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState6(false);
  const [saveStatus, setSaveStatus] = useState6("idle");
  const [notifications, setNotifications] = useState6([]);
  const project = projects.find((p) => p.id === projectId);
  const client = clients.find((c) => c.id === project?.clientId);
  const projectInvoices = invoices.filter((i) => i.projectId === projectId).sort((a, b) => b.version - a.version);
  useEffect3(() => {
    if (projectInvoices.length > 0 && !selectedId) {
      setSelectedId(projectInvoices[0].id);
    }
  }, [projectInvoices, selectedId]);
  useEffect3(() => {
    const inv = invoices.find((i) => i.id === selectedId);
    if (inv) {
      setLocalInvoice(JSON.parse(JSON.stringify(inv)));
      setHasUnsavedChanges(false);
      setSaveStatus("idle");
    } else {
      setLocalInvoice(null);
    }
  }, [selectedId, invoices]);
  const calculateTotals = (invoiceToCalc) => {
    if (!invoiceToCalc) return { basic: 0, cgst: 0, sgst: 0, igst: 0, grand: 0, rounded: 0, diff: 0 };
    const basic = invoiceToCalc.items.reduce((sum, i) => sum + i.amount, 0);
    let cgst = 0, sgst = 0, igst = 0;
    if (invoiceToCalc.taxType === "Intra-State") {
      cgst = basic * 0.09;
      sgst = basic * 0.09;
    } else {
      igst = basic * 0.18;
    }
    const grandRaw = basic + cgst + sgst + igst;
    const rounded = Math.round(grandRaw);
    const diff = rounded - grandRaw;
    return { basic, cgst, sgst, igst, grand: grandRaw, rounded, diff };
  };
  const totals = calculateTotals(localInvoice);
  useEffect3(() => {
    if (localInvoice && totals.rounded > 0) {
      const words = numberToWords(totals.rounded);
      if (localInvoice.amountInWords !== words) {
        handleUpdate({ amountInWords: words });
      }
    }
  }, [totals.rounded]);
  const addNotification = (type, message) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { type, message, id }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4e3);
  };
  if (!project || !client) return null;
  const handleUpdate = (updates) => {
    if (localInvoice) {
      setLocalInvoice((prev) => prev ? { ...prev, ...updates } : null);
      setHasUnsavedChanges(true);
      setSaveStatus("idle");
    }
  };
  const updateItem = (itemId, updates) => {
    if (!localInvoice) return;
    const newItems = localInvoice.items.map((item) => {
      if (item.id === itemId) {
        const updatedItem = { ...item, ...updates };
        const qty = updatedItem.qty || 0;
        const ratePerKgValue = parseFloat(updatedItem.ratePerKg) || 0;
        const percentageValue = parseFloat(updatedItem.percentage) || 0;
        updatedItem.amount = qty * ratePerKgValue * (percentageValue / 100);
        return updatedItem;
      }
      return item;
    });
    handleUpdate({ items: newItems });
  };
  const addItem = () => {
    if (!localInvoice) return;
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: "PEB",
      hsnCode: "-",
      qty: 1,
      uom: "LS",
      ratePerKg: "60000",
      percentage: "100",
      rate: 6e4,
      amount: 6e4
    };
    handleUpdate({ items: [...localInvoice.items, newItem] });
  };
  const removeItem = (id) => {
    if (!localInvoice) return;
    handleUpdate({ items: localInvoice.items.filter((i) => i.id !== id) });
  };
  const handleSave = async () => {
    if (!localInvoice) return;
    setIsSaving(true);
    try {
      await onUpdateInvoice(localInvoice.id, localInvoice);
      setHasUnsavedChanges(false);
      setSaveStatus("success");
      addNotification("success", "PI synchronized with cloud storage.");
      setTimeout(() => setSaveStatus("idle"), 3e3);
    } catch (e) {
      setSaveStatus("error");
      addNotification("error", "Critical sync failure.");
    } finally {
      setIsSaving(false);
    }
  };
  const executeEmailSend = async () => {
    if (!localInvoice || !emailCompose.to) return;
    setIsSendingEmail(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      addNotification("success", "PI Transmission Success");
      setIsDispatchOpen(false);
      setDispatchStep("choice");
    } catch (e) {
      addNotification("error", "Failed to dispatch email");
    } finally {
      setIsSendingEmail(false);
    }
  };
  const handleDownloadPDF = async () => {
    if (!localInvoice) return;
    setIsDownloading(true);
    try {
      if (hasUnsavedChanges) await handleSave();
      const doc = new jsPDF2({ orientation: "p", unit: "mm", format: "a4" });
      const margin = 10;
      const pageWidth = 210;
      const pageHeight = 297;
      const contentWidth = pageWidth - margin * 2;
      const brandBlue = [46, 49, 145];
      doc.setDrawColor(0).setLineWidth(0.3).rect(margin, margin, contentWidth, 277);
      doc.setFillColor(240, 240, 240).rect(margin, margin, contentWidth, 8, "F");
      doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(0).text("PROFORMA INVOICE", 105, margin + 5.5, { align: "center" });
      doc.line(margin, margin + 8, margin + contentWidth, margin + 8);
      const headH = 29.23;
      let y = margin + 8;
      if (branding.headerImage) {
        try {
          doc.addImage(branding.headerImage, "PNG", margin, y, contentWidth, headH, void 0, "FAST");
        } catch (e) {
          doc.setFontSize(16).setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]).text(branding.registry.name, margin + 50, y + 12);
        }
      } else {
        if (branding.logo) {
          try {
            doc.addImage(branding.logo, "PNG", margin + 5, y + 5, 35, 15);
          } catch (e) {
          }
        }
        doc.setFontSize(16).setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]).text(branding.registry.name, margin + 50, y + 12);
      }
      y += headH;
      doc.line(margin, y, margin + contentWidth, y);
      doc.setFontSize(8).setTextColor(0).setFont("helvetica", "normal");
      doc.text(`CIN:`, margin + 2, y + 5);
      doc.setFont("helvetica", "bold").text(branding.registry.cin, margin + 12, y + 5);
      doc.setFont("helvetica", "normal").text(`Company GSTIN:`, margin + 60, y + 5);
      doc.setFont("helvetica", "bold").text(branding.registry.gstin, margin + 84, y + 5);
      doc.setFont("helvetica", "normal").text(`PI No:`, margin + 125, y + 5);
      doc.setFont("helvetica", "bold").text(localInvoice.piNo, margin + 136, y + 5);
      y += 8;
      doc.line(margin, y, margin + contentWidth, y);
      doc.setFont("helvetica", "normal").text(`Email:`, margin + 2, y + 5);
      doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]).text(branding.registry.email, margin + 12, y + 5);
      doc.setTextColor(0).text(`Date:`, margin + 125, y + 5);
      doc.setFont("helvetica", "bold").text(localInvoice.date, margin + 136, y + 5);
      y += 8;
      doc.line(margin, y, margin + contentWidth, y);
      doc.setFillColor(240, 240, 240).rect(margin, y, contentWidth, 6, "F");
      doc.setFont("helvetica", "bold").setTextColor(0).text("Client Details:", margin + 2, y + 4.5);
      y += 6;
      doc.line(margin, y, margin + contentWidth, y);
      const drawRow = (label, value, rowY, h = 7) => {
        doc.setFillColor(250, 250, 250).rect(margin, rowY, 40, h, "F");
        doc.setFont("helvetica", "normal").text(label, margin + 2, rowY + h / 2 + 1);
        doc.line(margin + 40, rowY, margin + 40, rowY + h);
        doc.setFont("helvetica", "bold").text(value, margin + 42, rowY + h / 2 + 1, { maxWidth: 145 });
        return rowY + h;
      };
      y = drawRow("Organisation Name:", `M/s ${localInvoice.clientName}`, y);
      doc.line(margin, y, margin + contentWidth, y);
      y = drawRow("Registered Address:", localInvoice.registeredAddress, y);
      doc.line(margin, y, margin + contentWidth, y);
      y = drawRow("Consignee Address:", localInvoice.consigneeAddress, y, 10);
      doc.line(margin, y, margin + contentWidth, y);
      y = drawRow("GSTIN:", localInvoice.gstin, y);
      doc.line(margin, y, margin + contentWidth, y);
      doc.setFillColor(250, 250, 250).rect(margin, y, 40, 7, "F");
      doc.setFont("helvetica", "normal").text("W.O.No.:", margin + 2, y + 4.5);
      doc.line(margin + 40, y, margin + 40, y + 7);
      doc.setFont("helvetica", "bold").text(localInvoice.woNo, margin + 42, y + 4.5);
      doc.line(margin + 95, y, margin + 95, y + 7);
      doc.setFillColor(250, 250, 250).rect(margin + 95, y, 30, 7, "F");
      doc.setFont("helvetica", "normal").text("Dispatch Details:", margin + 97, y + 4.5);
      doc.line(margin + 125, y, margin + 125, y + 7);
      doc.setFont("helvetica", "bold").text(localInvoice.dispatchDetails, margin + 127, y + 4.5);
      y += 7;
      doc.line(margin, y, margin + contentWidth, y);
      const colWidths = [10, 80, 20, 15, 15, 20, 30];
      const headers = ["Sr.\nNo.", "Description", "HSN Code", "Qty.\n(LS)", "Rate per\nKG", "Percentage", "Basic Amount\n(INR)"];
      doc.setFontSize(7).setFont("helvetica", "bold");
      let currentX = margin;
      doc.setFillColor(240, 240, 240).rect(margin, y, contentWidth, 10, "F");
      headers.forEach((h, i) => {
        doc.text(h, currentX + colWidths[i] / 2, y + 4, { align: "center" });
        currentX += colWidths[i];
      });
      currentX = margin;
      colWidths.forEach((w) => {
        doc.line(currentX, y, currentX, y + 10);
        currentX += w;
      });
      doc.line(margin + contentWidth, y, margin + contentWidth, y + 10);
      y += 10;
      doc.line(margin, y, margin + contentWidth, y);
      let tableYStart = y;
      localInvoice.items.forEach((item, idx) => {
        const descLines = doc.splitTextToSize(item.description, colWidths[1] - 4);
        const rowHeight = Math.max(descLines.length * 4, 8);
        if (idx % 2 !== 0) doc.setFillColor(252, 252, 252).rect(margin, y, contentWidth, rowHeight, "F");
        let cellX = margin;
        doc.setFont("helvetica", "normal").text((idx + 1).toString(), cellX + colWidths[0] / 2, y + 5, { align: "center" });
        cellX += colWidths[0];
        doc.setFont("helvetica", "bold").text(descLines, cellX + 2, y + 5);
        cellX += colWidths[1];
        doc.setFont("helvetica", "normal").text(item.hsnCode, cellX + colWidths[2] / 2, y + 5, { align: "center" });
        cellX += colWidths[2];
        doc.text(Math.round(item.qty).toString(), cellX + colWidths[3] / 2, y + 5, { align: "center" });
        cellX += colWidths[3];
        doc.text(item.ratePerKg || "-", cellX + colWidths[4] / 2, y + 5, { align: "center" });
        cellX += colWidths[4];
        doc.text(item.percentage + "%", cellX + colWidths[5] / 2, y + 5, { align: "center" });
        cellX += colWidths[5];
        doc.setFont("helvetica", "bold").text(item.amount.toLocaleString(), margin + contentWidth - 2, y + 5, { align: "right" });
        y += rowHeight;
        doc.line(margin, y, margin + contentWidth, y);
      });
      y += 8;
      doc.line(margin, y, margin + contentWidth, y);
      currentX = margin;
      colWidths.forEach((w) => {
        doc.line(currentX, tableYStart, currentX, y);
        currentX += w;
      });
      doc.line(margin + contentWidth, tableYStart, margin + contentWidth, y);
      doc.setFontSize(8).setFont("helvetica", "normal").text("Total Amount (INR)", margin + 110, y + 5);
      doc.setFont("helvetica", "bold").text(totals.basic.toLocaleString(), margin + contentWidth - 2, y + 5, { align: "right" });
      y += 8;
      doc.line(margin, y, margin + contentWidth, y);
      const summaryYStart = y;
      doc.setFont("helvetica", "normal").setFontSize(7).text(`Total Amount In Words:`, margin + 2, y + 5);
      doc.setFont("helvetica", "bold").setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]).text(localInvoice.amountInWords || "", margin + 2, y + 10, { maxWidth: 100 });
      doc.setTextColor(0);
      let sy = summaryYStart;
      const rows = [
        ["Total Amount before Tax", totals.basic.toLocaleString()],
        [`(1) Add: CGST 9%`, totals.cgst.toLocaleString()],
        [`(2) Add: SGST 9%`, totals.sgst.toLocaleString()],
        [`(3) Add: IGST 18%`, totals.igst.toLocaleString()],
        [`Total GST (1+2+3)`, (totals.cgst + totals.sgst + totals.igst).toLocaleString()],
        [`Grand Total`, totals.rounded.toLocaleString()],
        [`Round Off`, totals.diff.toFixed(2)]
      ];
      rows.forEach((r, i) => {
        if (i === 5) doc.setFontSize(10).setFont("helvetica", "bold");
        else doc.setFontSize(8).setFont("helvetica", i === 4 ? "bold" : "normal");
        doc.text(r[0], margin + 110, sy + 5);
        doc.text(r[1], margin + contentWidth - 2, sy + 5, { align: "right" });
        sy += i === 5 ? 8 : 7;
        if (i < 6) doc.line(margin + 105, sy, margin + contentWidth, sy);
      });
      doc.line(margin + 105, summaryYStart, margin + 105, sy);
      let bankY = summaryYStart + 22;
      doc.setFont("helvetica", "bold").setFontSize(8).text("Bank Details:", margin + 2, bankY);
      doc.setFont("helvetica", "normal");
      doc.text(`Account Name: ${localInvoice.bankDetails.accountName}`, margin + 2, bankY + 5);
      doc.text(`Address: ${localInvoice.bankDetails.address}`, margin + 2, bankY + 10);
      doc.text(`Account Number: ${localInvoice.bankDetails.accountNumber}`, margin + 2, bankY + 15);
      doc.text(`IFSC Code: ${localInvoice.bankDetails.ifscCode}`, margin + 2, bankY + 20);
      y = Math.max(sy, bankY + 25);
      doc.line(margin, y, margin + contentWidth, y);
      y += 5;
      doc.setFont("helvetica", "bold").text(`For, ${branding.registry.name}`, margin + contentWidth - 10, y, { align: "right" });
      if (branding.stampSignature) {
        try {
          doc.addImage(branding.stampSignature, "PNG", margin + 130, y + 2, 35, 35, void 0, "FAST");
        } catch (e) {
        }
      }
      y += 40;
      doc.setFontSize(9).setTextColor(0).text("Authorised Signatory", margin + 150, y, { align: "center" });
      const fileName = `${localInvoice.piNo.replace(/\//g, "_")}_${project.name.replace(/\s+/g, "_")}.pdf`;
      doc.save(fileName);
      addNotification("success", "Professional PDF Dispatched.");
    } catch (e) {
      addNotification("error", `PDF Error: ${e.message}`);
    } finally {
      setIsDownloading(false);
    }
  };
  return /* @__PURE__ */ jsxs9("div", { className: "space-y-6 pb-24 animate-fade-in bg-slate-50/20 relative min-h-full", children: [
    /* @__PURE__ */ jsx9("div", { className: "fixed top-20 right-4 z-[120] space-y-3 pointer-events-none w-80", children: notifications.map((n) => /* @__PURE__ */ jsxs9("div", { className: `pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-start gap-3 animate-slide-in-right ${n.type === "success" ? "bg-[#2E3191] text-white border-white/10" : n.type === "error" ? "bg-[#EC1C24] text-white border-white/10" : "bg-blue-50 text-blue-800 border-blue-100"}`, children: [
      n.type === "success" && /* @__PURE__ */ jsx9(CheckCircle2, { size: 16, className: "shrink-0 mt-0.5" }),
      n.type === "error" && /* @__PURE__ */ jsx9(AlertCircle, { size: 16, className: "shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsx9("p", { className: "text-[10px] font-black uppercase tracking-widest", children: n.message })
    ] }, n.id)) }),
    /* @__PURE__ */ jsxs9("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm", children: [
      /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx9("button", { onClick: () => navigate("/projects"), className: "p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-[#2E3191] transition-all", children: /* @__PURE__ */ jsx9(ArrowLeft2, { size: 20 }) }),
        /* @__PURE__ */ jsxs9("div", { children: [
          /* @__PURE__ */ jsx9("h1", { className: "text-xl lg:text-2xl font-black text-[#2E3191] uppercase tracking-tight", children: "Billing Orchestrator" }),
          /* @__PURE__ */ jsxs9("p", { className: "text-[10px] lg:text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2", children: [
            /* @__PURE__ */ jsx9(Building2, { size: 12, className: "text-[#EC1C24]" }),
            " ",
            project.name
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx9("button", { onClick: () => onAddInvoice(project.id), className: "px-6 py-4 bg-[#2E3191] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#2E3191]/20 active:scale-95 transition-all", children: "+ New Invoice" })
    ] }),
    localInvoice ? /* @__PURE__ */ jsxs9("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs9("div", { className: "bg-[#2E3191] p-4 lg:p-6 rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-4 z-40 border border-white/10", children: [
        /* @__PURE__ */ jsx9("div", { className: "flex items-center gap-3 overflow-x-auto no-scrollbar max-w-full", children: projectInvoices.slice().reverse().map((inv) => /* @__PURE__ */ jsx9(
          "button",
          {
            onClick: () => setSelectedId(inv.id),
            className: `w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 font-black text-xs ${selectedId === inv.id ? "bg-[#EC1C24] text-white shadow-lg scale-110" : "bg-white/10 text-white/40 hover:bg-white/20"}`,
            children: inv.version
          },
          inv.id
        )) }),
        /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-2 lg:gap-3", children: [
          /* @__PURE__ */ jsx9("button", { onClick: () => setIsPreviewOpen(true), className: "p-3 bg-white/10 text-white rounded-xl hover:bg-white/20", title: "Full Render", children: /* @__PURE__ */ jsx9(Eye2, { size: 20 }) }),
          /* @__PURE__ */ jsx9("button", { onClick: handleDownloadPDF, disabled: isDownloading, className: "p-3 bg-emerald-500 text-white rounded-xl shadow-lg", title: "Export PDF", children: isDownloading ? /* @__PURE__ */ jsx9(Loader23, { size: 20, className: "animate-spin" }) : /* @__PURE__ */ jsx9(Download2, { size: 20 }) }),
          /* @__PURE__ */ jsx9("button", { onClick: () => setIsDispatchOpen(true), className: "p-3 bg-[#EC1C24] text-white rounded-xl shadow-lg", title: "Dispatch", children: /* @__PURE__ */ jsx9(Send, { size: 20 }) }),
          /* @__PURE__ */ jsx9("button", { onClick: () => onDuplicateInvoice(localInvoice.id), className: "p-3 bg-white/10 text-white rounded-xl hover:bg-white/20", title: "Clone", children: /* @__PURE__ */ jsx9(Copy2, { size: 20 }) }),
          /* @__PURE__ */ jsx9("button", { onClick: () => {
            onDeleteInvoice(localInvoice.id);
            setSelectedId(null);
          }, className: "p-3 bg-white/10 text-white/40 hover:text-red-400 rounded-xl", title: "Purge", children: /* @__PURE__ */ jsx9(Trash24, { size: 20 }) }),
          /* @__PURE__ */ jsx9("div", { className: "w-px h-6 bg-white/10 mx-1 hidden xs:block" }),
          /* @__PURE__ */ jsxs9("button", { onClick: handleSave, disabled: !hasUnsavedChanges || isSaving, className: `flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${hasUnsavedChanges ? "bg-white text-[#2E3191]" : "bg-white/10 text-white/30 cursor-not-allowed"}`, children: [
            isSaving ? /* @__PURE__ */ jsx9(Loader23, { className: "animate-spin", size: 16 }) : /* @__PURE__ */ jsx9(Save2, { size: 16 }),
            saveStatus === "success" ? "Synchronized" : "Save Changes"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs9("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxs9("div", { className: "lg:col-span-2 space-y-6", children: [
          /* @__PURE__ */ jsxs9("div", { className: "bg-white p-6 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8", children: [
            /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-3 border-b border-slate-50 pb-4", children: [
              /* @__PURE__ */ jsx9(ReceiptText, { size: 20, className: "text-[#EC1C24]" }),
              /* @__PURE__ */ jsx9("h3", { className: "text-lg font-black text-[#2E3191] uppercase tracking-tight", children: "Identity & Header Info" })
            ] }),
            /* @__PURE__ */ jsxs9("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsxs9("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx9("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "PI Reference No." }),
                /* @__PURE__ */ jsx9("input", { className: "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs focus:ring-4 focus:ring-[#2E3191]/5 outline-none transition-all", value: localInvoice.piNo, onChange: (e) => handleUpdate({ piNo: e.target.value }) })
              ] }),
              /* @__PURE__ */ jsxs9("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx9("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "Document Date" }),
                /* @__PURE__ */ jsx9("input", { className: "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs focus:ring-4 focus:ring-[#2E3191]/5 outline-none transition-all", value: localInvoice.date, onChange: (e) => handleUpdate({ date: e.target.value }) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs9("div", { className: "bg-white p-6 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8", children: [
            /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-3 border-b border-slate-50 pb-4", children: [
              /* @__PURE__ */ jsx9(Building2, { size: 20, className: "text-[#2E3191]" }),
              /* @__PURE__ */ jsx9("h3", { className: "text-lg font-black text-[#2E3191] uppercase tracking-tight", children: "Client & Consignee Details" })
            ] }),
            /* @__PURE__ */ jsxs9("div", { className: "space-y-6", children: [
              /* @__PURE__ */ jsxs9("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx9("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "Organisation Name" }),
                /* @__PURE__ */ jsx9("input", { className: "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs uppercase", value: localInvoice.clientName, onChange: (e) => handleUpdate({ clientName: e.target.value }) })
              ] }),
              /* @__PURE__ */ jsxs9("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
                /* @__PURE__ */ jsxs9("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx9("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "Registered Address" }),
                  /* @__PURE__ */ jsx9("textarea", { className: "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs h-24", value: localInvoice.registeredAddress, onChange: (e) => handleUpdate({ registeredAddress: e.target.value }) })
                ] }),
                /* @__PURE__ */ jsxs9("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx9("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "Consignee Address" }),
                  /* @__PURE__ */ jsx9("textarea", { className: "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs h-24", value: localInvoice.consigneeAddress, onChange: (e) => handleUpdate({ consigneeAddress: e.target.value }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs9("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
                /* @__PURE__ */ jsxs9("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx9("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "Client GSTIN" }),
                  /* @__PURE__ */ jsx9("input", { className: "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono font-black text-xs", value: localInvoice.gstin, onChange: (e) => handleUpdate({ gstin: e.target.value }) })
                ] }),
                /* @__PURE__ */ jsxs9("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx9("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "Work Order (W.O. No)" }),
                  /* @__PURE__ */ jsx9("input", { className: "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs", value: localInvoice.woNo, onChange: (e) => handleUpdate({ woNo: e.target.value }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs9("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx9("label", { className: "text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1", children: "Dispatch Details" }),
                /* @__PURE__ */ jsx9("input", { className: "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs", value: localInvoice.dispatchDetails, onChange: (e) => handleUpdate({ dispatchDetails: e.target.value }) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs9("div", { className: "bg-white p-6 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6", children: [
            /* @__PURE__ */ jsxs9("div", { className: "flex items-center justify-between border-b border-slate-50 pb-4", children: [
              /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx9(Grid3X32, { size: 20, className: "text-[#2E3191]" }),
                /* @__PURE__ */ jsx9("h3", { className: "text-lg font-black text-[#2E3191] uppercase tracking-tight", children: "Line Item Grid" })
              ] }),
              /* @__PURE__ */ jsx9("button", { onClick: addItem, className: "px-4 py-2 bg-[#2E3191]/5 text-[#2E3191] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#2E3191] hover:text-white transition-all", children: "+ Add Asset" })
            ] }),
            /* @__PURE__ */ jsx9("div", { className: "space-y-4", children: localInvoice.items.map((item, idx) => /* @__PURE__ */ jsxs9("div", { className: "p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-4 relative group hover:border-[#2E3191]/20 transition-all", children: [
              /* @__PURE__ */ jsx9("button", { onClick: () => removeItem(item.id), className: "absolute top-4 right-4 text-slate-200 hover:text-[#EC1C24] transition-colors", children: /* @__PURE__ */ jsx9(X5, { size: 18 }) }),
              /* @__PURE__ */ jsxs9("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
                /* @__PURE__ */ jsxs9("div", { className: "md:col-span-3 space-y-1.5", children: [
                  /* @__PURE__ */ jsx9("label", { className: "text-[8px] font-black uppercase text-slate-400 tracking-widest", children: "Description" }),
                  /* @__PURE__ */ jsx9("input", { className: "w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold", value: item.description, onChange: (e) => updateItem(item.id, { description: e.target.value }) })
                ] }),
                /* @__PURE__ */ jsxs9("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx9("label", { className: "text-[8px] font-black uppercase text-slate-400 tracking-widest", children: "HSN Code" }),
                  /* @__PURE__ */ jsx9("input", { className: "w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-mono", value: item.hsnCode, onChange: (e) => updateItem(item.id, { hsnCode: e.target.value }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs9("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
                /* @__PURE__ */ jsxs9("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx9("label", { className: "text-[8px] font-black uppercase text-slate-400 tracking-widest", children: "Qty (LS)" }),
                  /* @__PURE__ */ jsx9("input", { type: "number", step: "1", className: "w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold", value: item.qty, onChange: (e) => updateItem(item.id, { qty: parseFloat(e.target.value) || 0 }) })
                ] }),
                /* @__PURE__ */ jsxs9("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx9("label", { className: "text-[8px] font-black uppercase text-slate-400 tracking-widest", children: "Rate per KG" }),
                  /* @__PURE__ */ jsx9("input", { className: "w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold", value: item.ratePerKg, onChange: (e) => updateItem(item.id, { ratePerKg: e.target.value }) })
                ] }),
                /* @__PURE__ */ jsxs9("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx9("label", { className: "text-[8px] font-black uppercase text-slate-400 tracking-widest", children: "Percentage (%)" }),
                  /* @__PURE__ */ jsx9("input", { className: "w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold", value: item.percentage, onChange: (e) => updateItem(item.id, { percentage: e.target.value }) })
                ] }),
                /* @__PURE__ */ jsxs9("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx9("label", { className: "text-[8px] font-black uppercase text-slate-400 tracking-widest", children: "Basic Amount (Calculated)" }),
                  /* @__PURE__ */ jsx9("input", { type: "text", readOnly: true, className: "w-full px-4 py-3 bg-slate-100 border border-slate-100 rounded-xl text-xs font-black text-[#2E3191]", value: item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 }) })
                ] })
              ] })
            ] }, item.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs9("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs9("div", { className: "bg-[#2E3191] p-8 rounded-[2.5rem] shadow-2xl text-white space-y-6 relative overflow-hidden group", children: [
            /* @__PURE__ */ jsx9("div", { className: "absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000", children: /* @__PURE__ */ jsx9(Calculator, { size: 120 }) }),
            /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-3 border-b border-white/10 pb-4", children: [
              /* @__PURE__ */ jsx9(Calculator, { size: 20, className: "text-[#EC1C24]" }),
              /* @__PURE__ */ jsx9("h3", { className: "text-sm font-black uppercase tracking-widest", children: "Financial Summary" })
            ] }),
            /* @__PURE__ */ jsxs9("div", { className: "space-y-4 text-xs font-bold relative z-10", children: [
              /* @__PURE__ */ jsxs9("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx9("span", { className: "opacity-40 uppercase tracking-widest", children: "Basic Value" }),
                /* @__PURE__ */ jsxs9("span", { children: [
                  "\u20B9 ",
                  totals.basic.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                ] })
              ] }),
              /* @__PURE__ */ jsxs9("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx9("label", { className: "text-[8px] font-black uppercase text-white/30 tracking-widest", children: "Tax Configuration" }),
                /* @__PURE__ */ jsxs9("select", { className: "w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-black uppercase text-white outline-none cursor-pointer", value: localInvoice.taxType, onChange: (e) => handleUpdate({ taxType: e.target.value }), children: [
                  /* @__PURE__ */ jsx9("option", { value: "Intra-State", className: "bg-[#2E3191]", children: "Intra-State (9+9)" }),
                  /* @__PURE__ */ jsx9("option", { value: "Inter-State", className: "bg-[#2E3191]", children: "Inter-State (18)" })
                ] })
              ] }),
              localInvoice.taxType === "Intra-State" ? /* @__PURE__ */ jsxs9(Fragment3, { children: [
                /* @__PURE__ */ jsxs9("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx9("span", { className: "opacity-40 uppercase tracking-widest", children: "Add: CGST (9%)" }),
                  /* @__PURE__ */ jsxs9("span", { children: [
                    "\u20B9 ",
                    totals.cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs9("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx9("span", { className: "opacity-40 uppercase tracking-widest", children: "Add: SGST (9%)" }),
                  /* @__PURE__ */ jsxs9("span", { children: [
                    "\u20B9 ",
                    totals.sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                  ] })
                ] })
              ] }) : /* @__PURE__ */ jsxs9("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx9("span", { className: "opacity-40 uppercase tracking-widest", children: "Add: IGST (18%)" }),
                /* @__PURE__ */ jsxs9("span", { children: [
                  "\u20B9 ",
                  totals.igst.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                ] })
              ] }),
              /* @__PURE__ */ jsxs9("div", { className: "pt-6 border-t border-white/10 flex justify-between items-end", children: [
                /* @__PURE__ */ jsxs9("div", { children: [
                  /* @__PURE__ */ jsx9("p", { className: "text-[9px] opacity-40 uppercase tracking-widest mb-1", children: "Grand Total (R.O.)" }),
                  /* @__PURE__ */ jsxs9("p", { className: "text-2xl font-black text-white", children: [
                    "\u20B9 ",
                    totals.rounded.toLocaleString("en-IN")
                  ] })
                ] }),
                /* @__PURE__ */ jsxs9("span", { className: "text-[9px] bg-[#EC1C24] px-2 py-1 rounded font-black tracking-widest", children: [
                  "RO: ",
                  totals.diff.toFixed(2)
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs9("div", { className: "bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4", children: [
            /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-3 border-b border-slate-50 pb-4", children: [
              /* @__PURE__ */ jsx9(PenTool2, { size: 20, className: "text-[#2E3191]" }),
              /* @__PURE__ */ jsx9("h3", { className: "text-xs font-black text-[#2E3191] uppercase tracking-widest", children: "Amount in Words" })
            ] }),
            /* @__PURE__ */ jsx9("textarea", { className: "w-full bg-slate-50 p-4 rounded-xl text-[10px] font-bold outline-none border border-transparent focus:border-[#2E3191] transition-all h-20", placeholder: "Grand total in words...", value: localInvoice.amountInWords, readOnly: true }),
            /* @__PURE__ */ jsx9("p", { className: "text-[8px] text-slate-400 uppercase font-black tracking-widest ml-1 italic", children: "* Auto-generated from Grand Total" })
          ] }),
          /* @__PURE__ */ jsxs9("div", { className: "bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6", children: [
            /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-3 border-b border-slate-50 pb-4", children: [
              /* @__PURE__ */ jsx9(Building2, { size: 20, className: "text-[#2E3191]" }),
              /* @__PURE__ */ jsx9("h3", { className: "text-xs font-black text-[#2E3191] uppercase tracking-widest", children: "Remittance Path" })
            ] }),
            /* @__PURE__ */ jsxs9("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs9("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx9("label", { className: "text-[8px] font-black uppercase text-slate-300 tracking-widest ml-1", children: "Account Name" }),
                /* @__PURE__ */ jsx9("input", { className: "w-full bg-slate-50 p-4 rounded-xl text-[10px] font-bold outline-none border border-transparent focus:border-[#2E3191] transition-all", value: localInvoice.bankDetails.accountName, onChange: (e) => handleUpdate({ bankDetails: { ...localInvoice.bankDetails, accountName: e.target.value } }) })
              ] }),
              /* @__PURE__ */ jsxs9("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx9("label", { className: "text-[8px] font-black uppercase text-slate-300 tracking-widest ml-1", children: "Bank Address" }),
                /* @__PURE__ */ jsx9("input", { className: "w-full bg-slate-50 p-4 rounded-xl text-[10px] font-bold outline-none border border-transparent focus:border-[#2E3191] transition-all", value: localInvoice.bankDetails.address, onChange: (e) => handleUpdate({ bankDetails: { ...localInvoice.bankDetails, address: e.target.value } }) })
              ] }),
              /* @__PURE__ */ jsxs9("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx9("label", { className: "text-[8px] font-black uppercase text-slate-300 tracking-widest ml-1", children: "Account No." }),
                /* @__PURE__ */ jsx9("input", { className: "w-full bg-slate-50 p-4 rounded-xl text-[10px] font-mono font-black text-[#2E3191] outline-none border border-transparent focus:border-[#2E3191] transition-all", value: localInvoice.bankDetails.accountNumber, onChange: (e) => handleUpdate({ bankDetails: { ...localInvoice.bankDetails, accountNumber: e.target.value } }) })
              ] }),
              /* @__PURE__ */ jsxs9("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx9("label", { className: "text-[8px] font-black uppercase text-slate-300 tracking-widest ml-1", children: "IFSC Code" }),
                /* @__PURE__ */ jsx9("input", { className: "w-full bg-slate-50 p-4 rounded-xl text-[10px] font-mono font-black text-[#EC1C24] outline-none border border-transparent focus:border-[#2E3191] transition-all", value: localInvoice.bankDetails.ifscCode, onChange: (e) => handleUpdate({ bankDetails: { ...localInvoice.bankDetails, ifscCode: e.target.value } }) })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxs9("div", { className: "h-64 flex flex-col items-center justify-center text-slate-300", children: [
      /* @__PURE__ */ jsx9(ReceiptText, { size: 48, className: "mb-4 opacity-10 animate-pulse" }),
      /* @__PURE__ */ jsx9("p", { className: "font-black uppercase tracking-widest text-[10px]", children: "Select PI Master Version" })
    ] }),
    isDispatchOpen && localInvoice && /* @__PURE__ */ jsx9("div", { className: "fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4", children: /* @__PURE__ */ jsxs9("div", { className: "bg-white rounded-t-3xl sm:rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in border border-slate-100", children: [
      /* @__PURE__ */ jsxs9("div", { className: "p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx9("h2", { className: "text-lg lg:text-2xl font-black text-[#2E3191] uppercase tracking-tight", children: "PI Dispatch Command" }),
        /* @__PURE__ */ jsx9("button", { onClick: () => setIsDispatchOpen(false), className: "text-slate-300 hover:text-[#EC1C24] transition-colors", children: /* @__PURE__ */ jsx9(X5, { size: 28 }) })
      ] }),
      /* @__PURE__ */ jsx9("div", { className: "p-6 lg:p-10 space-y-4", children: dispatchStep === "choice" ? /* @__PURE__ */ jsxs9("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs9("button", { onClick: () => window.open(`https://wa.me/${client.phone.replace(/\D/g, "")}`, "_blank"), className: "w-full flex items-center gap-4 p-5 bg-white border-2 border-slate-50 rounded-2xl hover:border-emerald-500 transition-all text-left", children: [
          /* @__PURE__ */ jsx9("div", { className: "w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx9(MessageCircle, { size: 24, className: "text-emerald-500" }) }),
          /* @__PURE__ */ jsx9("span", { className: "font-black text-[#2E3191] uppercase text-xs tracking-widest", children: "WhatsApp Direct" })
        ] }),
        /* @__PURE__ */ jsxs9("button", { onClick: () => setDispatchStep("email"), className: "w-full flex items-center gap-4 p-5 bg-white border-2 border-slate-50 rounded-2xl hover:border-[#2E3191] transition-all text-left", children: [
          /* @__PURE__ */ jsx9("div", { className: "w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx9(MailIcon, { size: 24, className: "text-[#2E3191]" }) }),
          /* @__PURE__ */ jsx9("span", { className: "font-black text-[#2E3191] uppercase text-xs tracking-widest", children: "SMTP Email Relay" })
        ] })
      ] }) : /* @__PURE__ */ jsxs9("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx9("input", { className: "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 text-xs", value: emailCompose.to, onChange: (e) => setEmailCompose({ ...emailCompose, to: e.target.value }) }),
        /* @__PURE__ */ jsx9("textarea", { className: "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-600 h-32 text-xs leading-relaxed", value: emailCompose.body, onChange: (e) => setEmailCompose({ ...emailCompose, body: e.target.value }) }),
        /* @__PURE__ */ jsx9("button", { onClick: executeEmailSend, disabled: isSendingEmail, className: "w-full py-5 bg-[#2E3191] text-white rounded-2xl font-black text-[10px] uppercase shadow-xl disabled:opacity-50 tracking-widest", children: isSendingEmail ? "Transmitting..." : "Dispatch Payload" })
      ] }) })
    ] }) }),
    isPreviewOpen && localInvoice && /* @__PURE__ */ jsxs9("div", { className: "fixed inset-0 z-[110] bg-white overflow-y-auto animate-fade-in p-4 lg:p-10 flex flex-col items-center", children: [
      /* @__PURE__ */ jsxs9("div", { className: "w-full max-w-5xl flex items-center justify-between mb-8 sticky top-0 bg-[#2E3191] p-4 lg:p-6 rounded-2xl shadow-2xl z-50 border border-white/10", children: [
        /* @__PURE__ */ jsx9("h2", { className: "text-white font-black uppercase tracking-widest text-[10px] lg:text-xs", children: "PI Rendering Engine" }),
        /* @__PURE__ */ jsxs9("div", { className: "flex gap-4", children: [
          /* @__PURE__ */ jsx9("button", { onClick: handleDownloadPDF, className: "px-6 py-3 bg-[#EC1C24] text-white font-black text-[10px] rounded-xl uppercase shadow-xl tracking-widest active:scale-95 transition-all", children: "Download PDF" }),
          /* @__PURE__ */ jsx9("button", { onClick: () => setIsPreviewOpen(false), className: "p-3 text-white/50 hover:text-white transition-colors", children: /* @__PURE__ */ jsx9(X5, { size: 24 }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx9(InvoicePreview_default, { invoice: localInvoice, branding, client, project })
    ] }),
    /* @__PURE__ */ jsx9("style", { children: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` })
  ] });
};
var InvoiceManagement_default = InvoiceManagement;

// pages/Branding.tsx
import { useState as useState7, useRef as useRef2 } from "react";
import { Save as Save3, RefreshCw as RefreshCw2, Palette, Building2 as Building22, Globe, Mail as Mail3, MapPin as MapPin5, Upload, Image as ImageIcon, Trash2 as Trash25, Link as LinkIcon, FileSignature } from "lucide-react";
import { Fragment as Fragment4, jsx as jsx10, jsxs as jsxs10 } from "react/jsx-runtime";
var BrandingPage = ({ branding, onUpdateBranding }) => {
  const [formData, setFormData] = useState7(branding);
  const [isSaving, setIsSaving] = useState7(false);
  const fileInputRef = useRef2(null);
  const headerInputRef = useRef2(null);
  const footerInputRef = useRef2(null);
  const stampInputRef = useRef2(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdateBranding(formData);
      setIsSaving(false);
    }, 800);
  };
  const handleFileUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRegistryChange = (field, value) => {
    setFormData({
      ...formData,
      registry: {
        ...formData.registry,
        [field]: value
      }
    });
  };
  const clearImage = (field) => {
    setFormData((prev) => ({ ...prev, [field]: field === "logo" ? "" : void 0 }));
  };
  const useDefaultAssets = () => {
    setFormData((prev) => ({
      ...prev,
      headerImage: "https://reviranexgen.com/assets/header.jpg",
      footerImage: "https://reviranexgen.com/assets/footer.jpg",
      stampSignature: "https://reviranexgen.com/assets/stamp.png"
    }));
  };
  return /* @__PURE__ */ jsxs10("div", { className: "space-y-8 max-w-6xl mx-auto animate-fade-in bg-white", children: [
    /* @__PURE__ */ jsxs10("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs10("div", { children: [
        /* @__PURE__ */ jsx10("h1", { className: "text-3xl font-black text-[#2E3191] tracking-tight uppercase", children: "Branding & Theme" }),
        /* @__PURE__ */ jsx10("p", { className: "text-slate-400 font-bold text-xs uppercase tracking-widest", children: "Design your corporate identity across the ERP ecosystem." })
      ] }),
      /* @__PURE__ */ jsxs10("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsxs10(
          "button",
          {
            type: "button",
            onClick: useDefaultAssets,
            className: "text-[#2E3191] border-2 border-[#2E3191] px-6 py-4 rounded-2xl flex items-center gap-2 hover:bg-[#2E3191]/5 transition-all font-black text-xs uppercase tracking-widest active:scale-95",
            children: [
              /* @__PURE__ */ jsx10(RefreshCw2, { size: 20 }),
              "Apply Defaults"
            ]
          }
        ),
        /* @__PURE__ */ jsxs10(
          "button",
          {
            onClick: handleSubmit,
            disabled: isSaving,
            className: "text-white px-10 py-4 rounded-2xl flex items-center gap-3 hover:scale-105 transition-all shadow-2xl disabled:opacity-50 font-black text-xs uppercase tracking-widest active:scale-95",
            style: { backgroundColor: formData.brandColor, boxShadow: `0 20px 30px -10px ${formData.brandColor}66` },
            children: [
              isSaving ? /* @__PURE__ */ jsx10(RefreshCw2, { className: "animate-spin", size: 20 }) : /* @__PURE__ */ jsx10(Save3, { size: 20 }),
              isSaving ? "Synchronizing..." : "Save Theme"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs10("form", { onSubmit: handleSubmit, className: "grid grid-cols-1 lg:grid-cols-3 gap-10", children: [
      /* @__PURE__ */ jsx10("div", { className: "space-y-8", children: /* @__PURE__ */ jsxs10("div", { className: "bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 hover:shadow-2xl transition-all", children: [
        /* @__PURE__ */ jsxs10("h3", { className: "font-black text-[#2E3191] flex items-center gap-3 uppercase tracking-widest text-[10px]", children: [
          /* @__PURE__ */ jsx10(Palette, { size: 20, style: { color: formData.brandColor } }),
          "Theme Engine"
        ] }),
        /* @__PURE__ */ jsxs10("div", { className: "space-y-8", children: [
          /* @__PURE__ */ jsxs10("div", { className: "bg-slate-50/50 p-6 rounded-3xl border border-slate-50", children: [
            /* @__PURE__ */ jsx10("label", { className: "block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-4", children: "Primary Theme Color" }),
            /* @__PURE__ */ jsxs10("div", { className: "flex gap-5 items-center", children: [
              /* @__PURE__ */ jsx10(
                "div",
                {
                  className: "w-20 h-20 rounded-3xl border-4 border-white shadow-2xl cursor-pointer transition-transform hover:scale-110",
                  style: { backgroundColor: formData.brandColor },
                  children: /* @__PURE__ */ jsx10(
                    "input",
                    {
                      type: "color",
                      className: "w-full h-full opacity-0 cursor-pointer",
                      value: formData.brandColor,
                      onChange: (e) => setFormData({ ...formData, brandColor: e.target.value })
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxs10("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx10(
                  "input",
                  {
                    type: "text",
                    className: "w-full px-4 py-3 text-sm border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-mono font-black text-[#2E3191]",
                    value: formData.brandColor,
                    onChange: (e) => setFormData({ ...formData, brandColor: e.target.value })
                  }
                ),
                /* @__PURE__ */ jsx10("p", { className: "text-[8px] text-slate-300 mt-2 uppercase font-black tracking-widest", children: "Hex Color Descriptor" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs10("div", { className: "bg-slate-50/50 p-6 rounded-3xl border border-slate-50", children: [
            /* @__PURE__ */ jsx10("label", { className: "block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-4", children: "Logo Backdrop Color" }),
            /* @__PURE__ */ jsxs10("div", { className: "flex gap-5 items-center", children: [
              /* @__PURE__ */ jsx10(
                "div",
                {
                  className: "w-20 h-20 rounded-3xl border-4 border-white shadow-2xl cursor-pointer transition-transform hover:scale-110",
                  style: { backgroundColor: formData.logoBackgroundColor },
                  children: /* @__PURE__ */ jsx10(
                    "input",
                    {
                      type: "color",
                      className: "w-full h-full opacity-0 cursor-pointer",
                      value: formData.logoBackgroundColor,
                      onChange: (e) => setFormData({ ...formData, logoBackgroundColor: e.target.value })
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxs10("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx10(
                  "input",
                  {
                    type: "text",
                    className: "w-full px-4 py-3 text-sm border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-mono font-black text-[#2E3191]",
                    value: formData.logoBackgroundColor,
                    onChange: (e) => setFormData({ ...formData, logoBackgroundColor: e.target.value })
                  }
                ),
                /* @__PURE__ */ jsx10("p", { className: "text-[8px] text-slate-300 mt-2 uppercase font-black tracking-widest", children: "Logo Background Hex" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs10("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx10("label", { className: "block text-[9px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "Company Seal (Logo)" }),
            /* @__PURE__ */ jsxs10(
              "div",
              {
                className: "group relative h-56 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center p-8 overflow-hidden transition-all hover:border-[#2E3191] shadow-inner",
                style: { backgroundColor: formData.logoBackgroundColor },
                children: [
                  formData.logo ? /* @__PURE__ */ jsxs10(Fragment4, { children: [
                    /* @__PURE__ */ jsx10("img", { src: formData.logo, alt: "Logo", className: "max-h-full max-w-full object-contain animate-fade-in" }),
                    /* @__PURE__ */ jsxs10("div", { className: "absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]", children: [
                      /* @__PURE__ */ jsx10("button", { type: "button", onClick: () => fileInputRef.current?.click(), className: "p-3 bg-white rounded-xl text-[#2E3191] hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx10(Upload, { size: 22 }) }),
                      /* @__PURE__ */ jsx10("button", { type: "button", onClick: () => clearImage("logo"), className: "p-3 bg-white rounded-xl text-[#EC1C24] hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx10(Trash25, { size: 22 }) })
                    ] })
                  ] }) : /* @__PURE__ */ jsxs10("button", { type: "button", onClick: () => fileInputRef.current?.click(), className: "flex flex-col items-center gap-3 text-slate-400 group-hover:text-[#2E3191] transition-colors", children: [
                    /* @__PURE__ */ jsx10(ImageIcon, { size: 40 }),
                    /* @__PURE__ */ jsx10("span", { className: "text-[10px] font-black uppercase tracking-widest", children: "Upload Master Seal" })
                  ] }),
                  /* @__PURE__ */ jsx10("input", { type: "file", ref: fileInputRef, className: "hidden", accept: "image/*", onChange: (e) => handleFileUpload(e, "logo") })
                ]
              }
            )
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs10("div", { className: "lg:col-span-2 space-y-10", children: [
        /* @__PURE__ */ jsxs10("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
          /* @__PURE__ */ jsxs10("div", { className: "bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-2xl transition-all", children: [
            /* @__PURE__ */ jsxs10("h3", { className: "font-black text-[#2E3191] uppercase tracking-widest text-[10px] flex items-center gap-3", children: [
              /* @__PURE__ */ jsx10(Upload, { size: 16, className: "text-[#EC1C24]" }),
              " Document Header Strip"
            ] }),
            /* @__PURE__ */ jsxs10("div", { className: "group relative h-40 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center p-6 transition-all hover:bg-white hover:border-[#2E3191]", children: [
              formData.headerImage ? /* @__PURE__ */ jsxs10(Fragment4, { children: [
                /* @__PURE__ */ jsx10("img", { src: formData.headerImage, alt: "Header", className: "max-h-full max-w-full object-contain rounded-xl" }),
                /* @__PURE__ */ jsxs10("div", { className: "absolute inset-0 bg-white/90 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity", children: [
                  /* @__PURE__ */ jsx10("button", { type: "button", onClick: () => headerInputRef.current?.click(), className: "p-3 bg-[#2E3191] text-white rounded-xl shadow-xl", children: /* @__PURE__ */ jsx10(Upload, { size: 20 }) }),
                  /* @__PURE__ */ jsx10("button", { type: "button", onClick: () => clearImage("headerImage"), className: "p-3 bg-[#EC1C24] text-white rounded-xl shadow-xl", children: /* @__PURE__ */ jsx10(Trash25, { size: 20 }) })
                ] })
              ] }) : /* @__PURE__ */ jsxs10("button", { type: "button", onClick: () => headerInputRef.current?.click(), className: "text-slate-300 flex flex-col items-center gap-2 hover:text-[#2E3191] transition-colors", children: [
                /* @__PURE__ */ jsx10(ImageIcon, { size: 32 }),
                /* @__PURE__ */ jsx10("span", { className: "text-[9px] font-black uppercase tracking-widest", children: "Select Header Media" })
              ] }),
              /* @__PURE__ */ jsx10("input", { type: "file", ref: headerInputRef, className: "hidden", accept: "image/*", onChange: (e) => handleFileUpload(e, "headerImage") })
            ] }),
            /* @__PURE__ */ jsxs10("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx10("label", { className: "block text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1", children: "Or Header Asset URL" }),
              /* @__PURE__ */ jsxs10("div", { className: "relative", children: [
                /* @__PURE__ */ jsx10(LinkIcon, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-300", size: 14 }),
                /* @__PURE__ */ jsx10(
                  "input",
                  {
                    type: "text",
                    className: "w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-700 text-[10px] transition-all",
                    placeholder: "https://example.com/header.jpg",
                    value: formData.headerImage || "",
                    onChange: (e) => setFormData({ ...formData, headerImage: e.target.value })
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs10("div", { className: "bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-2xl transition-all", children: [
            /* @__PURE__ */ jsxs10("h3", { className: "font-black text-[#2E3191] uppercase tracking-widest text-[10px] flex items-center gap-3", children: [
              /* @__PURE__ */ jsx10(Upload, { size: 16, className: "text-[#EC1C24]" }),
              " Document Footer Strip"
            ] }),
            /* @__PURE__ */ jsxs10("div", { className: "group relative h-40 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center p-6 transition-all hover:bg-white hover:border-[#2E3191]", children: [
              formData.footerImage ? /* @__PURE__ */ jsxs10(Fragment4, { children: [
                /* @__PURE__ */ jsx10("img", { src: formData.footerImage, alt: "Footer", className: "max-h-full max-w-full object-contain rounded-xl" }),
                /* @__PURE__ */ jsxs10("div", { className: "absolute inset-0 bg-white/90 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity", children: [
                  /* @__PURE__ */ jsx10("button", { type: "button", onClick: () => footerInputRef.current?.click(), className: "p-3 bg-[#2E3191] text-white rounded-xl shadow-xl", children: /* @__PURE__ */ jsx10(Upload, { size: 20 }) }),
                  /* @__PURE__ */ jsx10("button", { type: "button", onClick: () => clearImage("footerImage"), className: "p-3 bg-[#EC1C24] text-white rounded-xl shadow-xl", children: /* @__PURE__ */ jsx10(Trash25, { size: 20 }) })
                ] })
              ] }) : /* @__PURE__ */ jsxs10("button", { type: "button", onClick: () => footerInputRef.current?.click(), className: "text-slate-300 flex flex-col items-center gap-2 hover:text-[#2E3191] transition-colors", children: [
                /* @__PURE__ */ jsx10(ImageIcon, { size: 32 }),
                /* @__PURE__ */ jsx10("span", { className: "text-[9px] font-black uppercase tracking-widest", children: "Select Footer Media" })
              ] }),
              /* @__PURE__ */ jsx10("input", { type: "file", ref: footerInputRef, className: "hidden", accept: "image/*", onChange: (e) => handleFileUpload(e, "footerImage") })
            ] }),
            /* @__PURE__ */ jsxs10("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx10("label", { className: "block text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1", children: "Or Footer Asset URL" }),
              /* @__PURE__ */ jsxs10("div", { className: "relative", children: [
                /* @__PURE__ */ jsx10(LinkIcon, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-300", size: 14 }),
                /* @__PURE__ */ jsx10(
                  "input",
                  {
                    type: "text",
                    className: "w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-700 text-[10px] transition-all",
                    placeholder: "https://example.com/footer.jpg",
                    value: formData.footerImage || "",
                    onChange: (e) => setFormData({ ...formData, footerImage: e.target.value })
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs10("div", { className: "bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-2xl transition-all", children: [
            /* @__PURE__ */ jsxs10("h3", { className: "font-black text-[#2E3191] uppercase tracking-widest text-[10px] flex items-center gap-3", children: [
              /* @__PURE__ */ jsx10(FileSignature, { size: 16, className: "text-[#EC1C24]" }),
              " Stamp & Signature"
            ] }),
            /* @__PURE__ */ jsxs10("div", { className: "group relative h-40 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center p-6 transition-all hover:bg-white hover:border-[#2E3191]", children: [
              formData.stampSignature ? /* @__PURE__ */ jsxs10(Fragment4, { children: [
                /* @__PURE__ */ jsx10("img", { src: formData.stampSignature, alt: "Stamp", className: "max-h-full max-w-full object-contain rounded-xl" }),
                /* @__PURE__ */ jsxs10("div", { className: "absolute inset-0 bg-white/90 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity", children: [
                  /* @__PURE__ */ jsx10("button", { type: "button", onClick: () => stampInputRef.current?.click(), className: "p-3 bg-[#2E3191] text-white rounded-xl shadow-xl", children: /* @__PURE__ */ jsx10(Upload, { size: 20 }) }),
                  /* @__PURE__ */ jsx10("button", { type: "button", onClick: () => clearImage("stampSignature"), className: "p-3 bg-[#EC1C24] text-white rounded-xl shadow-xl", children: /* @__PURE__ */ jsx10(Trash25, { size: 20 }) })
                ] })
              ] }) : /* @__PURE__ */ jsxs10("button", { type: "button", onClick: () => stampInputRef.current?.click(), className: "text-slate-300 flex flex-col items-center gap-2 hover:text-[#2E3191] transition-colors", children: [
                /* @__PURE__ */ jsx10(FileSignature, { size: 32 }),
                /* @__PURE__ */ jsx10("span", { className: "text-[9px] font-black uppercase tracking-widest", children: "Select Stamp Media" })
              ] }),
              /* @__PURE__ */ jsx10("input", { type: "file", ref: stampInputRef, className: "hidden", accept: "image/*", onChange: (e) => handleFileUpload(e, "stampSignature") })
            ] }),
            /* @__PURE__ */ jsxs10("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx10("label", { className: "block text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1", children: "Or Stamp Asset URL" }),
              /* @__PURE__ */ jsxs10("div", { className: "relative", children: [
                /* @__PURE__ */ jsx10(LinkIcon, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-300", size: 14 }),
                /* @__PURE__ */ jsx10(
                  "input",
                  {
                    type: "text",
                    className: "w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-700 text-[10px] transition-all",
                    placeholder: "https://reviranexgen.com/assets/stamp.png",
                    value: formData.stampSignature || "",
                    onChange: (e) => setFormData({ ...formData, stampSignature: e.target.value })
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs10("div", { className: "bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group", children: [
          /* @__PURE__ */ jsx10("div", { className: "absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-1000", children: /* @__PURE__ */ jsx10(Building22, { size: 200 }) }),
          /* @__PURE__ */ jsxs10("h3", { className: "text-3xl font-black text-[#2E3191] mb-12 flex items-center gap-5 uppercase tracking-tighter", children: [
            /* @__PURE__ */ jsx10(Building22, { size: 40, className: "text-[#EC1C24]" }),
            "Registry Data Core"
          ] }),
          /* @__PURE__ */ jsxs10("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8", children: [
            /* @__PURE__ */ jsxs10("div", { className: "space-y-6", children: [
              /* @__PURE__ */ jsxs10("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx10("label", { className: "block text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1", children: "Entity Registered Identity" }),
                /* @__PURE__ */ jsx10(
                  "input",
                  {
                    type: "text",
                    className: "w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-black text-[#2E3191] uppercase tracking-tight transition-all",
                    value: formData.registry.name,
                    onChange: (e) => handleRegistryChange("name", e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs10("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx10("label", { className: "block text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1", children: "Universal Digital Hub (Website)" }),
                /* @__PURE__ */ jsxs10("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx10(Globe, { className: "absolute left-5 top-1/2 -translate-y-1/2 text-slate-300", size: 18 }),
                  /* @__PURE__ */ jsx10(
                    "input",
                    {
                      type: "text",
                      className: "w-full pl-14 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-700 transition-all",
                      value: formData.registry.website,
                      onChange: (e) => handleRegistryChange("website", e.target.value)
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs10("div", { className: "space-y-6", children: [
              /* @__PURE__ */ jsxs10("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx10("label", { className: "block text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1", children: "Corporate Registration (CIN)" }),
                /* @__PURE__ */ jsx10(
                  "input",
                  {
                    type: "text",
                    className: "w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-mono font-black text-[#EC1C24] transition-all",
                    value: formData.registry.cin,
                    onChange: (e) => handleRegistryChange("cin", e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs10("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx10("label", { className: "block text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1", children: "Master Digital Channel (Email)" }),
                /* @__PURE__ */ jsxs10("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx10(Mail3, { className: "absolute left-5 top-1/2 -translate-y-1/2 text-slate-300", size: 18 }),
                  /* @__PURE__ */ jsx10(
                    "input",
                    {
                      type: "email",
                      className: "w-full pl-14 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-700 transition-all",
                      value: formData.registry.email,
                      onChange: (e) => handleRegistryChange("email", e.target.value)
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs10("div", { className: "sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-6", children: [
              /* @__PURE__ */ jsxs10("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs10("label", { className: "block text-[9px] font-black text-[#2E3191] uppercase tracking-[0.2em] flex items-center gap-2 mb-2", children: [
                  /* @__PURE__ */ jsx10(MapPin5, { size: 14, className: "text-[#EC1C24]" }),
                  " Nagpur Regional Hub"
                ] }),
                /* @__PURE__ */ jsx10(
                  "textarea",
                  {
                    className: "w-full px-6 py-5 bg-slate-50/50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none h-32 text-xs font-bold leading-relaxed transition-all",
                    value: formData.registry.nagpurOffice,
                    onChange: (e) => handleRegistryChange("nagpurOffice", e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs10("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs10("label", { className: "block text-[9px] font-black text-[#2E3191] uppercase tracking-[0.2em] flex items-center gap-2 mb-2", children: [
                  /* @__PURE__ */ jsx10(MapPin5, { size: 14, className: "text-[#EC1C24]" }),
                  " Delhi Strategic H.O."
                ] }),
                /* @__PURE__ */ jsx10(
                  "textarea",
                  {
                    className: "w-full px-6 py-5 bg-slate-50/50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none h-32 text-xs font-bold leading-relaxed transition-all",
                    value: formData.registry.delhiOffice,
                    onChange: (e) => handleRegistryChange("delhiOffice", e.target.value)
                  }
                )
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
};
var Branding_default = BrandingPage;

// pages/Users.tsx
import { useState as useState8 } from "react";
import {
  Search as Search3,
  Mail as Mail4,
  Shield,
  Trash2 as Trash26,
  Edit as Edit3,
  UserPlus as UserPlus2,
  UserCog as UserCog2,
  Check,
  X as X6,
  ChevronDown as ChevronDown3,
  KeyRound as KeyRound2,
  Building as Building3
} from "lucide-react";
import { jsx as jsx11, jsxs as jsxs11 } from "react/jsx-runtime";
var UsersPage = ({
  users,
  clients,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [showModal, setShowModal] = useState8(false);
  const [search, setSearch] = useState8("");
  const [editingUser, setEditingUser] = useState8(null);
  const [newUser, setNewUser] = useState8({
    name: "",
    email: "",
    role: "Standard",
    password: "",
    assignedClientIds: []
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser(editingUser.id, newUser);
    } else {
      onAddUser(newUser);
    }
    closeModal();
  };
  const openEditModal = (user) => {
    setEditingUser(user);
    setNewUser({ ...user });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setNewUser({
      name: "",
      email: "",
      role: "Standard",
      password: "",
      assignedClientIds: []
    });
  };
  const filteredUsers = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );
  const toggleClientAssignment = (clientId) => {
    const current = newUser.assignedClientIds || [];
    if (current.includes(clientId)) {
      setNewUser({
        ...newUser,
        assignedClientIds: current.filter((id) => id !== clientId)
      });
    } else {
      setNewUser({ ...newUser, assignedClientIds: [...current, clientId] });
    }
  };
  return /* @__PURE__ */ jsxs11("div", { className: "space-y-6 bg-white animate-fade-in relative min-h-full", children: [
    /* @__PURE__ */ jsxs11("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs11("div", { children: [
        /* @__PURE__ */ jsx11("h1", { className: "text-3xl font-black text-[#2E3191] tracking-tight uppercase", children: "Staff Management" }),
        /* @__PURE__ */ jsx11("p", { className: "text-slate-400 font-bold text-xs uppercase tracking-widest", children: "Manage corporate identities and system access levels." })
      ] }),
      /* @__PURE__ */ jsxs11(
        "button",
        {
          onClick: () => setShowModal(true),
          className: "bg-[#2E3191] text-white px-8 py-3.5 rounded-2xl flex items-center gap-2 hover:bg-[#1e206b] transition-all shadow-xl shadow-[#2E3191]/20 active:scale-95 font-black text-xs uppercase tracking-widest",
          children: [
            /* @__PURE__ */ jsx11(UserPlus2, { size: 20 }),
            "Provision New User"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx11("div", { className: "bg-white p-6 rounded-2xl border border-slate-100 shadow-sm", children: /* @__PURE__ */ jsxs11("div", { className: "relative", children: [
      /* @__PURE__ */ jsx11(
        Search3,
        {
          className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-300",
          size: 20
        }
      ),
      /* @__PURE__ */ jsx11(
        "input",
        {
          type: "text",
          placeholder: "Search by name or email address...",
          className: "w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2E3191] focus:bg-white font-bold text-sm transition-all",
          value: search,
          onChange: (e) => setSearch(e.target.value)
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx11("div", { className: "bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden", children: /* @__PURE__ */ jsxs11("div", { className: "overflow-x-auto", children: [
      /* @__PURE__ */ jsxs11("table", { className: "w-full text-left border-collapse", children: [
        /* @__PURE__ */ jsx11("thead", { children: /* @__PURE__ */ jsxs11("tr", { className: "bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50", children: [
          /* @__PURE__ */ jsx11("th", { className: "px-8 py-5", children: "Personnel" }),
          /* @__PURE__ */ jsx11("th", { className: "px-8 py-5", children: "Access Level" }),
          /* @__PURE__ */ jsx11("th", { className: "px-8 py-5", children: "Status" }),
          /* @__PURE__ */ jsx11("th", { className: "px-8 py-5 text-right", children: "Administrative Actions" })
        ] }) }),
        /* @__PURE__ */ jsx11("tbody", { className: "divide-y divide-slate-50", children: filteredUsers.map((user) => /* @__PURE__ */ jsxs11(
          "tr",
          {
            className: "group hover:bg-[#2E3191]/5 transition-colors",
            children: [
              /* @__PURE__ */ jsx11("td", { className: "px-8 py-6", children: /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-5", children: [
                /* @__PURE__ */ jsx11("div", { className: "w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#2E3191] font-black text-xl border-2 border-slate-50 shadow-sm group-hover:scale-110 group-hover:bg-[#2E3191] group-hover:text-white transition-all overflow-hidden", children: user.avatar ? /* @__PURE__ */ jsx11(
                  "img",
                  {
                    src: user.avatar,
                    alt: user.name,
                    className: "w-full h-full object-cover"
                  }
                ) : user.name.charAt(0) }),
                /* @__PURE__ */ jsxs11("div", { children: [
                  /* @__PURE__ */ jsx11("p", { className: "font-black text-[#2E3191] uppercase tracking-tight text-sm", children: user.name }),
                  /* @__PURE__ */ jsxs11("p", { className: "text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-1 uppercase tracking-wider", children: [
                    /* @__PURE__ */ jsx11(Mail4, { size: 12, className: "text-[#EC1C24]" }),
                    " ",
                    user.email
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsx11("td", { className: "px-8 py-6", children: /* @__PURE__ */ jsxs11(
                "div",
                {
                  className: `inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] ${user.role === "Administrator" ? "bg-red-50 text-[#EC1C24] border-red-100" : "bg-blue-50 text-[#2E3191] border-blue-100"}`,
                  children: [
                    /* @__PURE__ */ jsx11(Shield, { size: 12 }),
                    user.role
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx11("td", { className: "px-8 py-6", children: /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx11("div", { className: "w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30" }),
                /* @__PURE__ */ jsx11("span", { className: "text-[10px] font-black uppercase tracking-widest text-slate-400", children: "Active" })
              ] }) }),
              /* @__PURE__ */ jsx11("td", { className: "px-8 py-6 text-right", children: /* @__PURE__ */ jsxs11("div", { className: "flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity", children: [
                /* @__PURE__ */ jsx11(
                  "button",
                  {
                    onClick: () => openEditModal(user),
                    className: "p-3 text-slate-300 hover:text-[#2E3191] hover:bg-[#2E3191]/5 rounded-xl transition-all",
                    title: "Edit Permissions",
                    children: /* @__PURE__ */ jsx11(Edit3, { size: 20 })
                  }
                ),
                /* @__PURE__ */ jsx11(
                  "button",
                  {
                    onClick: () => onDeleteUser(user.id),
                    className: "p-3 text-slate-300 hover:text-[#EC1C24] hover:bg-[#EC1C24]/5 rounded-xl transition-all",
                    title: "Delete User",
                    children: /* @__PURE__ */ jsx11(Trash26, { size: 20 })
                  }
                )
              ] }) })
            ]
          },
          user.id
        )) })
      ] }),
      filteredUsers.length === 0 && /* @__PURE__ */ jsxs11("div", { className: "p-32 text-center text-slate-200", children: [
        /* @__PURE__ */ jsx11(UserCog2, { size: 80, className: "mx-auto mb-6 opacity-5" }),
        /* @__PURE__ */ jsx11("p", { className: "font-black uppercase text-xs tracking-[0.3em]", children: "No staff members match criteria" })
      ] })
    ] }) }),
    showModal && /* @__PURE__ */ jsxs11("div", { className: "fixed inset-0 z-[1000] flex items-center justify-center p-4", children: [
      /* @__PURE__ */ jsx11(
        "div",
        {
          className: "absolute inset-0 bg-slate-900/40 backdrop-blur-[4px] transition-opacity",
          onClick: closeModal
        }
      ),
      /* @__PURE__ */ jsxs11("div", { className: "relative bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl border border-slate-100 animate-fade-in overflow-hidden max-h-[90vh] flex flex-col", children: [
        /* @__PURE__ */ jsxs11("div", { className: "p-8 sm:p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 shrink-0", children: [
          /* @__PURE__ */ jsxs11("div", { className: "flex items-center gap-5", children: [
            /* @__PURE__ */ jsx11("div", { className: "w-14 h-14 rounded-[1.5rem] bg-[#2E3191] text-white flex items-center justify-center shadow-2xl shadow-[#2E3191]/20", children: editingUser ? /* @__PURE__ */ jsx11(UserCog2, { size: 28 }) : /* @__PURE__ */ jsx11(UserPlus2, { size: 28 }) }),
            /* @__PURE__ */ jsxs11("div", { children: [
              /* @__PURE__ */ jsx11("h2", { className: "text-2xl font-black text-[#2E3191] tracking-tight uppercase", children: editingUser ? "Update" : "Provision" }),
              /* @__PURE__ */ jsx11("p", { className: "text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1", children: "Personnel Authorization" })
            ] })
          ] }),
          /* @__PURE__ */ jsx11(
            "button",
            {
              onClick: closeModal,
              className: "p-2 text-slate-300 hover:text-[#EC1C24] transition-all rounded-xl hover:bg-slate-100",
              children: /* @__PURE__ */ jsx11(X6, { size: 28 })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs11(
          "form",
          {
            onSubmit: handleSubmit,
            className: "p-8 sm:p-10 space-y-8 overflow-y-auto flex-1",
            children: [
              /* @__PURE__ */ jsxs11("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
                /* @__PURE__ */ jsxs11("div", { className: "space-y-6", children: [
                  /* @__PURE__ */ jsxs11("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsx11("label", { className: "block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "Legal Name" }),
                    /* @__PURE__ */ jsx11(
                      "input",
                      {
                        required: true,
                        type: "text",
                        className: "w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300 text-sm",
                        value: newUser.name,
                        onChange: (e) => setNewUser({ ...newUser, name: e.target.value }),
                        placeholder: "Personnel name..."
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs11("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsx11("label", { className: "block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "Corporate Email" }),
                    /* @__PURE__ */ jsx11(
                      "input",
                      {
                        required: true,
                        type: "email",
                        className: "w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300 text-sm",
                        value: newUser.email,
                        onChange: (e) => setNewUser({ ...newUser, email: e.target.value }),
                        placeholder: "name@reviranexgen.com"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs11("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsx11("label", { className: "block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "System Password" }),
                    /* @__PURE__ */ jsxs11("div", { className: "relative", children: [
                      /* @__PURE__ */ jsx11(
                        KeyRound2,
                        {
                          className: "absolute left-5 top-1/2 -translate-y-1/2 text-slate-300",
                          size: 18
                        }
                      ),
                      /* @__PURE__ */ jsx11(
                        "input",
                        {
                          required: !editingUser,
                          type: "password",
                          className: "w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300 text-sm",
                          value: newUser.password,
                          onChange: (e) => setNewUser({ ...newUser, password: e.target.value }),
                          placeholder: editingUser ? "Leave blank to keep same" : "Secure password..."
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs11("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsx11("label", { className: "block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "Authorization Role" }),
                    /* @__PURE__ */ jsxs11("div", { className: "relative group/select", children: [
                      /* @__PURE__ */ jsxs11(
                        "select",
                        {
                          className: "w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/10 focus:border-[#2E3191] outline-none font-black text-slate-800 transition-all appearance-none cursor-pointer hover:border-[#2E3191]/30 hover:shadow-lg hover:shadow-[#2E3191]/5 text-sm",
                          value: newUser.role,
                          onChange: (e) => setNewUser({
                            ...newUser,
                            role: e.target.value
                          }),
                          children: [
                            /* @__PURE__ */ jsx11("option", { value: "Standard", children: "Standard" }),
                            /* @__PURE__ */ jsx11("option", { value: "Administrator", children: "Administrator" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsx11("div", { className: "absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover/select:text-[#2E3191] group-hover/select:scale-110 transition-all duration-300", children: /* @__PURE__ */ jsx11(ChevronDown3, { size: 20 }) })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs11("div", { className: "space-y-4", children: [
                  /* @__PURE__ */ jsxs11("div", { className: "flex items-center justify-between border-b border-slate-100 pb-2", children: [
                    /* @__PURE__ */ jsx11("label", { className: "block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1", children: "Client Authorization" }),
                    /* @__PURE__ */ jsx11(Building3, { size: 16, className: "text-[#EC1C24]" })
                  ] }),
                  newUser.role === "Administrator" ? /* @__PURE__ */ jsxs11("div", { className: "bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-3", children: [
                    /* @__PURE__ */ jsx11(Shield, { size: 32, className: "text-emerald-500" }),
                    /* @__PURE__ */ jsx11("p", { className: "text-[10px] font-black text-emerald-700 uppercase tracking-widest", children: "Full System Access Granted" }),
                    /* @__PURE__ */ jsx11("p", { className: "text-[9px] text-emerald-600 leading-relaxed italic", children: "Administrators bypass client constraints and view all records." })
                  ] }) : /* @__PURE__ */ jsx11("div", { className: "space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar", children: clients.length > 0 ? clients.map((client) => /* @__PURE__ */ jsxs11(
                    "div",
                    {
                      onClick: () => toggleClientAssignment(client.id),
                      className: `p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group/client ${newUser.assignedClientIds?.includes(client.id) ? "bg-blue-50 border-[#2E3191] shadow-md shadow-blue-500/5" : "bg-white border-slate-50 hover:border-slate-200"}`,
                      children: [
                        /* @__PURE__ */ jsxs11("div", { className: "overflow-hidden", children: [
                          /* @__PURE__ */ jsx11(
                            "p",
                            {
                              className: `text-[11px] font-black uppercase tracking-tight truncate ${newUser.assignedClientIds?.includes(client.id) ? "text-[#2E3191]" : "text-slate-500"}`,
                              children: client.name
                            }
                          ),
                          /* @__PURE__ */ jsx11("p", { className: "text-[8px] font-bold text-slate-300 uppercase tracking-widest", children: client.gstin })
                        ] }),
                        /* @__PURE__ */ jsx11(
                          "div",
                          {
                            className: `w-6 h-6 rounded-lg flex items-center justify-center transition-all ${newUser.assignedClientIds?.includes(client.id) ? "bg-[#2E3191] text-white scale-110" : "bg-slate-50 text-transparent group-hover/client:bg-slate-100"}`,
                            children: /* @__PURE__ */ jsx11(Check, { size: 14 })
                          }
                        )
                      ]
                    },
                    client.id
                  )) : /* @__PURE__ */ jsx11("p", { className: "text-[10px] text-slate-300 text-center py-10 uppercase font-black italic tracking-widest", children: "No clients registered in ecosystem" }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs11("div", { className: "flex gap-4 pt-4 shrink-0", children: [
                /* @__PURE__ */ jsx11(
                  "button",
                  {
                    type: "button",
                    onClick: closeModal,
                    className: "flex-1 px-4 py-4 border-2 border-slate-50 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest",
                    children: "Abort"
                  }
                ),
                /* @__PURE__ */ jsx11(
                  "button",
                  {
                    type: "submit",
                    className: "flex-1 px-4 py-4 bg-[#EC1C24] text-white font-black rounded-2xl hover:bg-[#d11920] transition-all shadow-2xl shadow-[#EC1C24]/30 uppercase text-[10px] tracking-widest active:scale-95",
                    children: editingUser ? "Sync Identity" : "Provision Protocol"
                  }
                )
              ] })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx11("style", { children: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      ` })
  ] });
};
var Users_default = UsersPage;

// pages/DatabasePortal.tsx
import { useState as useState9 } from "react";
import {
  Database as Database2,
  Terminal,
  RefreshCw as RefreshCw3,
  Activity as Activity2,
  ShieldCheck as ShieldCheck3,
  Cpu,
  Zap,
  Monitor
} from "lucide-react";
import { jsx as jsx12, jsxs as jsxs12 } from "react/jsx-runtime";
var DatabasePortal = ({ config, onUpdateConfig, stats, state }) => {
  const [isTesting, setIsTesting] = useState9(false);
  const [tempUri, setTempUri] = useState9(config.uri);
  const [logs, setLogs] = useState9([
    { msg: "NestJS Microservice Initialized. Runtime: local-v1.4.2", time: (/* @__PURE__ */ new Date()).toLocaleTimeString(), type: "info" },
    { msg: "MongoDB Compass Pool: 5 local connections established.", time: (/* @__PURE__ */ new Date()).toLocaleTimeString(), type: "success" },
    { msg: "Local DB Proxy: Port 27017 listening.", time: (/* @__PURE__ */ new Date()).toLocaleTimeString(), type: "info" }
  ]);
  const handleTestConnection = async () => {
    setIsTesting(true);
    setLogs((prev) => [{ msg: `Pinging Local MongoDB @ ${config.uri}...`, time: (/* @__PURE__ */ new Date()).toLocaleTimeString(), type: "info" }, ...prev]);
    await new Promise((r) => setTimeout(r, 1200));
    setLogs((prev) => [{ msg: "Compass Status: Operational. Response: 1ms.", time: (/* @__PURE__ */ new Date()).toLocaleTimeString(), type: "success" }, ...prev]);
    onUpdateConfig({ status: "Connected", lastSync: (/* @__PURE__ */ new Date()).toISOString() });
    setIsTesting(false);
  };
  return /* @__PURE__ */ jsxs12("div", { className: "space-y-8 animate-fade-in bg-white max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxs12("div", { className: "flex items-center justify-between border-b border-slate-50 pb-8", children: [
      /* @__PURE__ */ jsxs12("div", { className: "flex items-center gap-6", children: [
        /* @__PURE__ */ jsx12("div", { className: "w-16 h-16 rounded-[2rem] bg-[#2E3191] text-white flex items-center justify-center shadow-2xl shadow-[#2E3191]/20", children: /* @__PURE__ */ jsx12(Monitor, { size: 32 }) }),
        /* @__PURE__ */ jsxs12("div", { children: [
          /* @__PURE__ */ jsx12("h1", { className: "text-3xl font-black text-[#2E3191] tracking-tight uppercase", children: "Local Infrastructure" }),
          /* @__PURE__ */ jsxs12("p", { className: "text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2", children: [
            /* @__PURE__ */ jsx12(Zap, { size: 14, className: "text-[#EC1C24]" }),
            " NestJS Runtime & MongoDB Compass Local Instance"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs12("div", { className: `px-6 py-3 rounded-2xl flex items-center gap-3 border-2 transition-all ${config.status === "Connected" ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600"}`, children: [
        /* @__PURE__ */ jsx12("div", { className: `w-2 h-2 rounded-full ${config.status === "Connected" ? "bg-emerald-500 animate-pulse" : "bg-red-50"}` }),
        /* @__PURE__ */ jsx12("span", { className: "text-xs font-black uppercase tracking-widest", children: "Environment: Localhost" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs12("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-10", children: [
      /* @__PURE__ */ jsxs12("div", { className: "lg:col-span-2 space-y-10", children: [
        /* @__PURE__ */ jsxs12("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
          /* @__PURE__ */ jsxs12("div", { className: "bg-slate-900 p-8 rounded-[3rem] shadow-2xl border border-slate-800 space-y-6 group", children: [
            /* @__PURE__ */ jsxs12("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx12("div", { className: "w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx12(Cpu, { size: 24 }) }),
              /* @__PURE__ */ jsxs12("div", { className: "text-right", children: [
                /* @__PURE__ */ jsx12("p", { className: "text-[10px] font-black text-slate-500 uppercase", children: "System Uptime" }),
                /* @__PURE__ */ jsx12("p", { className: "text-xl font-black text-white", children: "99.9% Local" })
              ] })
            ] }),
            /* @__PURE__ */ jsx12("div", { className: "h-1.5 w-full bg-slate-800 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx12("div", { className: "h-full bg-blue-500 w-[100%]" }) }),
            /* @__PURE__ */ jsx12("p", { className: "text-[9px] font-mono text-slate-500 uppercase", children: "Instance: localhost:3000" })
          ] }),
          /* @__PURE__ */ jsxs12("div", { className: "bg-slate-900 p-8 rounded-[3rem] shadow-2xl border border-slate-800 space-y-6 group", children: [
            /* @__PURE__ */ jsxs12("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx12("div", { className: "w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx12(Database2, { size: 24 }) }),
              /* @__PURE__ */ jsxs12("div", { className: "text-right", children: [
                /* @__PURE__ */ jsx12("p", { className: "text-[10px] font-black text-slate-500 uppercase", children: "Compass Health" }),
                /* @__PURE__ */ jsx12("p", { className: "text-xl font-black text-white", children: "Port 27017 [Ready]" })
              ] })
            ] }),
            /* @__PURE__ */ jsx12("div", { className: "flex gap-1.5 h-1.5 items-center", children: [...Array(12)].map((_, i) => /* @__PURE__ */ jsx12("div", { className: `flex-1 h-full rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]` }, i)) }),
            /* @__PURE__ */ jsxs12("p", { className: "text-[9px] font-mono text-slate-500 uppercase", children: [
              "Database: ",
              config.dbName,
              " \u2022 Latency: 1ms"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx12("div", { className: "bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 relative overflow-hidden group", children: /* @__PURE__ */ jsxs12("div", { className: "relative z-10 space-y-8", children: [
          /* @__PURE__ */ jsxs12("h3", { className: "text-xl font-black text-[#2E3191] uppercase tracking-tight flex items-center gap-3", children: [
            /* @__PURE__ */ jsx12(Monitor, { size: 24, className: "text-[#EC1C24]" }),
            "Compass Orchestrator"
          ] }),
          /* @__PURE__ */ jsxs12("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs12("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx12("label", { className: "block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1", children: "Local NestJS Backend Proxy" }),
              /* @__PURE__ */ jsx12(
                "input",
                {
                  type: "text",
                  className: "w-full px-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-mono text-xs transition-all",
                  value: config.apiEndpoint
                }
              )
            ] }),
            /* @__PURE__ */ jsxs12("div", { className: "grid grid-cols-2 gap-8", children: [
              /* @__PURE__ */ jsxs12("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx12("label", { className: "block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1", children: "Compass Connection String" }),
                /* @__PURE__ */ jsx12(
                  "input",
                  {
                    disabled: true,
                    type: "text",
                    className: "w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl font-bold text-slate-400 outline-none",
                    value: tempUri
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs12("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx12("label", { className: "block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1", children: "Access Protocol" }),
                /* @__PURE__ */ jsxs12("div", { className: "w-full px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-between border border-emerald-100", children: [
                  /* @__PURE__ */ jsx12("span", { className: "text-[10px] font-black uppercase tracking-widest", children: "Local-Only" }),
                  /* @__PURE__ */ jsx12(ShieldCheck3, { size: 18 })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs12(
              "button",
              {
                onClick: handleTestConnection,
                disabled: isTesting,
                className: "w-full bg-[#2E3191] text-white py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-[#1e206b] transition-all flex items-center justify-center gap-3 disabled:opacity-50",
                children: [
                  isTesting ? /* @__PURE__ */ jsx12(RefreshCw3, { className: "animate-spin", size: 20 }) : /* @__PURE__ */ jsx12(RefreshCw3, { size: 20 }),
                  "Refresh Local Compass Handshake"
                ]
              }
            )
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx12("div", { className: "space-y-8", children: /* @__PURE__ */ jsxs12("div", { className: "bg-slate-900 rounded-[2.5rem] p-8 h-[640px] flex flex-col border border-slate-800 shadow-2xl relative overflow-hidden", children: [
        /* @__PURE__ */ jsx12("div", { className: "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2E3191] via-[#EC1C24] to-[#2E3191]" }),
        /* @__PURE__ */ jsxs12("div", { className: "flex items-center justify-between mb-8", children: [
          /* @__PURE__ */ jsxs12("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx12(Terminal, { size: 18, className: "text-[#EC1C24]" }),
            /* @__PURE__ */ jsx12("h3", { className: "text-xs font-black text-white uppercase tracking-widest", children: "Compass Console" })
          ] }),
          /* @__PURE__ */ jsx12(Activity2, { size: 14, className: "text-blue-400 animate-pulse" })
        ] }),
        /* @__PURE__ */ jsx12("div", { className: "flex-1 overflow-y-auto space-y-5 custom-scrollbar-dark pr-2", children: logs.map((log, i) => /* @__PURE__ */ jsxs12("div", { className: "space-y-1.5 border-l-2 border-slate-800 pl-4 group hover:border-blue-500 transition-colors", children: [
          /* @__PURE__ */ jsxs12("div", { className: "flex justify-between items-center text-[7px] font-mono text-slate-500", children: [
            /* @__PURE__ */ jsx12("span", { children: "PROCESS: LOCALHOST-DB" }),
            /* @__PURE__ */ jsx12("span", { children: log.time })
          ] }),
          /* @__PURE__ */ jsxs12("p", { className: `text-[10px] font-mono leading-relaxed break-words ${log.type === "success" ? "text-emerald-400" : log.type === "error" ? "text-red-400" : "text-blue-300"}`, children: [
            /* @__PURE__ */ jsx12("span", { className: "opacity-40 mr-2", children: "_" }),
            log.msg
          ] })
        ] }, i)) }),
        /* @__PURE__ */ jsxs12("div", { className: "mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest", children: [
          /* @__PURE__ */ jsx12("span", { children: "Socket: localhost:27017" }),
          /* @__PURE__ */ jsx12("span", { className: "text-white", children: "Active Node" })
        ] })
      ] }) })
    ] })
  ] });
};
var DatabasePortal_default = DatabasePortal;

// App.tsx
import { jsx as jsx13, jsxs as jsxs13 } from "react/jsx-runtime";
var App = () => {
  const [state, setState] = useState10(null);
  const [isSyncing, setIsSyncing] = useState10(false);
  const [isInitialLoad, setIsInitialLoad] = useState10(true);
  const [confirm, setConfirm] = useState10({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {
    },
    type: "danger"
  });
  useEffect5(() => {
    const init = async () => {
      try {
        const data = await loadState();
        setState(data);
      } finally {
        setIsInitialLoad(false);
      }
    };
    init();
  }, []);
  const handleLogin = async (email, password) => {
    try {
      const { user, token } = await NestApiService.login(email, password);
      NestApiService.setToken(token);
      const data = await loadState();
      setState({ ...data, currentUser: user, token });
      return true;
    } catch (e) {
      console.error("Login Error:", e);
      return false;
    }
  };
  const handleLogout = () => {
    NestApiService.setToken(null);
    setState((prev) => prev ? { ...prev, currentUser: null, token: null } : null);
  };
  const triggerConfirm = (title, message, onConfirm, type = "danger") => {
    setConfirm({ isOpen: true, title, message, onConfirm, type });
  };
  const generateUniquePiNo = (invoices) => {
    const monthYear = getMonthYearStr();
    let serial = 1;
    let piNo = `RNS/PI/${monthYear}/RNS-${String(serial).padStart(3, "0")}`;
    while (invoices.some((inv) => inv.piNo === piNo)) {
      serial++;
      piNo = `RNS/PI/${monthYear}/RNS-${String(serial).padStart(3, "0")}`;
    }
    return piNo;
  };
  const handleAddUser = async (userData) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.saveUser(userData);
      setState((prev) => prev ? { ...prev, users: [...prev.users, saved] } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };
  const handleUpdateUser = async (id, updates) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.updateUser(id, updates);
      setState((prev) => prev ? { ...prev, users: prev.users.map((u) => u.id === id ? saved : u) } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };
  const handleDeleteUser = async (id) => {
    const user = state?.users.find((u) => u.id === id);
    triggerConfirm("Purge User Access", `Revoke access for ${user?.name}?`, async () => {
      setIsSyncing(true);
      try {
        await NestApiService.deleteUser(id);
        setState((prev) => prev ? { ...prev, users: prev.users.filter((u) => u.id !== id) } : null);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSyncing(false);
      }
    });
  };
  const handleAddClient = async (clientData) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.saveClient(clientData);
      setState((prev) => prev ? { ...prev, clients: [...prev.clients, saved] } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };
  const handleUpdateClient = async (id, updates) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.updateClient(id, updates);
      setState((prev) => prev ? { ...prev, clients: prev.clients.map((c) => c.id === id ? saved : c) } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };
  const handleDeleteClient = async (id) => {
    const client = state?.clients.find((c) => c.id === id);
    triggerConfirm("Remove Client Ledger", `Delete ${client?.name}?`, async () => {
      setIsSyncing(true);
      try {
        await NestApiService.deleteClient(id);
        setState((prev) => prev ? { ...prev, clients: prev.clients.filter((c) => c.id !== id) } : null);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSyncing(false);
      }
    });
  };
  const handleAddProject = async (projectData) => {
    setIsSyncing(true);
    try {
      const newProject = { ...projectData, assignedUserId: state?.currentUser?.id || "", createdAt: (/* @__PURE__ */ new Date()).toISOString(), status: "Planning" };
      const saved = await NestApiService.saveProject(newProject);
      setState((prev) => prev ? { ...prev, projects: [...prev.projects, saved] } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };
  const handleUpdateProject = async (id, updates) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.updateProject(id, updates);
      setState((prev) => prev ? { ...prev, projects: prev.projects.map((p) => p.id === id ? saved : p) } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };
  const handleDeleteProject = async (id) => {
    triggerConfirm("Terminate Project", `WARNING: This will purge all quotations and invoices.`, async () => {
      setIsSyncing(true);
      try {
        await NestApiService.deleteProject(id);
        setState((prev) => prev ? {
          ...prev,
          projects: prev.projects.filter((p) => p.id !== id),
          quotations: prev.quotations.filter((q) => q.projectId !== id),
          invoices: prev.invoices.filter((i) => i.projectId !== id)
        } : null);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSyncing(false);
      }
    });
  };
  const handleAddQuotation = async (projectId, workflow) => {
    if (!state) return;
    setIsSyncing(true);
    try {
      const project = state.projects.find((p) => p.id === projectId);
      if (!project) return;
      const client = state.clients.find((c) => c.id === project.clientId);
      const clientName = client?.name || "Client";
      const existing = state.quotations.filter((q) => q.projectId === projectId);
      const nextVer = existing.length + 1;
      const typeToUse = workflow || project.workflow;
      const projectLocation = project.location || "";
      let newQuote;
      if (typeToUse === "Structural Fabrication" /* STRUCTURAL_FABRICATION */) {
        newQuote = createStructuralFabricationTemplate(projectId, nextVer, clientName, projectLocation);
      } else if (typeToUse === "Job Work" /* JOB_WORK */) {
        newQuote = createJobWorkTemplate(projectId, nextVer, clientName, projectLocation);
      } else {
        newQuote = createSupplyAndFabricationTemplate(projectId, nextVer, clientName, projectLocation);
      }
      const saved = await NestApiService.saveQuotation(newQuote);
      setState((prev) => prev ? { ...prev, quotations: [...prev.quotations, saved] } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };
  const handleUpdateQuotation = async (id, updates) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.updateQuotation(id, updates);
      setState((prev) => prev ? { ...prev, quotations: prev.quotations.map((q) => q.id === id ? saved : q) } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };
  const handleDeleteQuotation = async (id) => {
    setIsSyncing(true);
    try {
      await NestApiService.deleteQuotation(id);
      setState((prev) => prev ? { ...prev, quotations: prev.quotations.filter((q) => q.id !== id) } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };
  const handleAddInvoice = async (projectId) => {
    if (!state) return;
    setIsSyncing(true);
    try {
      const project = state.projects.find((p) => p.id === projectId);
      const client = state.clients.find((c) => c.id === project?.clientId);
      if (!project || !client) return;
      const existingInProject = state.invoices.filter((i) => i.projectId === projectId);
      const nextVer = existingInProject.length + 1;
      const piNo = generateUniquePiNo(state.invoices);
      const newInv = createInvoiceTemplate(projectId, nextVer, client, piNo);
      const saved = await NestApiService.saveInvoice(newInv);
      setState((prev) => prev ? { ...prev, invoices: [...prev.invoices, saved] } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };
  const handleUpdateInvoice = async (id, updates) => {
    setIsSyncing(true);
    try {
      const saved = await NestApiService.updateInvoice(id, updates);
      setState((prev) => prev ? { ...prev, invoices: prev.invoices.map((i) => i.id === id ? saved : i) } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };
  const handleDeleteInvoice = async (id) => {
    setIsSyncing(true);
    try {
      await NestApiService.deleteInvoice(id);
      setState((prev) => prev ? { ...prev, invoices: prev.invoices.filter((i) => i.id !== id) } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };
  const handleUpdateBranding = async (b) => {
    setIsSyncing(true);
    try {
      const updated = await NestApiService.updateBranding(b);
      setState((prev) => prev ? { ...prev, branding: updated } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };
  if (isInitialLoad || !state) {
    return /* @__PURE__ */ jsxs13("div", { className: "h-screen flex flex-col items-center justify-center bg-white space-y-6", children: [
      /* @__PURE__ */ jsxs13("div", { className: "relative", children: [
        /* @__PURE__ */ jsx13("div", { className: "w-24 h-24 rounded-[2rem] bg-[#2E3191]/5 flex items-center justify-center", children: /* @__PURE__ */ jsx13("img", { src: "https://reviranexgen.com/assets/logo-with-name.png", alt: "Loading", className: "h-10 animate-pulse-soft grayscale opacity-30" }) }),
        /* @__PURE__ */ jsx13("div", { className: "absolute inset-0 border-4 border-[#2E3191]/10 border-t-[#EC1C24] rounded-[2rem] animate-spin" })
      ] }),
      /* @__PURE__ */ jsx13("p", { className: "text-[10px] font-black text-[#2E3191] uppercase tracking-[0.4em] animate-pulse", children: "Initializing Database Cluster" })
    ] });
  }
  const isAdmin = state.currentUser?.role === "Administrator";
  const filteredClients = isAdmin ? state.clients : state.clients.filter((c) => state.currentUser?.assignedClientIds?.includes(c.id));
  const filteredProjects = isAdmin ? state.projects : state.projects.filter((p) => state.currentUser?.assignedClientIds?.includes(p.clientId));
  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (!state.currentUser) return /* @__PURE__ */ jsx13(Navigate, { to: "/login", replace: true });
    if (adminOnly && state.currentUser.role !== "Administrator") return /* @__PURE__ */ jsx13(Navigate, { to: "/", replace: true });
    return /* @__PURE__ */ jsx13(Layout_default, { user: state.currentUser, onLogout: handleLogout, brandColor: state.branding.brandColor, logo: state.branding.logo, logoBackgroundColor: state.branding.logoBackgroundColor, isSyncing, dbStatus: state.dbConfig.status, children });
  };
  return /* @__PURE__ */ jsxs13(HashRouter, { children: [
    /* @__PURE__ */ jsxs13(Routes, { children: [
      /* @__PURE__ */ jsx13(Route, { path: "/login", element: /* @__PURE__ */ jsx13(Login_default, { onLogin: handleLogin }) }),
      /* @__PURE__ */ jsx13(Route, { path: "/", element: /* @__PURE__ */ jsx13(ProtectedRoute, { children: /* @__PURE__ */ jsx13(Dashboard_default, { clients: filteredClients, projects: filteredProjects, users: state.users }) }) }),
      /* @__PURE__ */ jsx13(Route, { path: "/clients", element: /* @__PURE__ */ jsx13(ProtectedRoute, { children: /* @__PURE__ */ jsx13(Clients_default, { clients: filteredClients, onAddClient: handleAddClient, onUpdateClient: handleUpdateClient, onDeleteClient: handleDeleteClient }) }) }),
      /* @__PURE__ */ jsx13(Route, { path: "/projects", element: /* @__PURE__ */ jsx13(ProtectedRoute, { children: /* @__PURE__ */ jsx13(Projects_default, { projects: filteredProjects, clients: filteredClients, onAddProject: handleAddProject, onUpdateProject: handleUpdateProject, onDeleteProject: handleDeleteProject }) }) }),
      /* @__PURE__ */ jsx13(Route, { path: "/projects/:projectId", element: /* @__PURE__ */ jsx13(ProtectedRoute, { children: /* @__PURE__ */ jsx13(ProjectDetails_default, { projects: filteredProjects, clients: filteredClients, quotations: state.quotations, branding: state.branding, onAddQuotation: handleAddQuotation, onUpdateQuotation: handleUpdateQuotation, onDeleteQuotation: handleDeleteQuotation, onDuplicateQuotation: (id) => {
        const source = state.quotations.find((q) => q.id === id);
        if (source) handleAddQuotation(source.projectId, source.workflow);
      } }) }) }),
      /* @__PURE__ */ jsx13(Route, { path: "/projects/:projectId/invoices", element: /* @__PURE__ */ jsx13(ProtectedRoute, { children: /* @__PURE__ */ jsx13(InvoiceManagement_default, { projects: filteredProjects, clients: filteredClients, invoices: state.invoices, branding: state.branding, onAddInvoice: handleAddInvoice, onUpdateInvoice: handleUpdateInvoice, onDeleteInvoice: handleDeleteInvoice, onDuplicateInvoice: (id) => {
        const source = state.invoices.find((i) => i.id === id);
        if (source) handleAddInvoice(source.projectId);
      } }) }) }),
      /* @__PURE__ */ jsx13(Route, { path: "/users", element: /* @__PURE__ */ jsx13(ProtectedRoute, { adminOnly: true, children: /* @__PURE__ */ jsx13(Users_default, { users: state.users, clients: state.clients, onAddUser: handleAddUser, onUpdateUser: handleUpdateUser, onDeleteUser: handleDeleteUser }) }) }),
      /* @__PURE__ */ jsx13(Route, { path: "/branding", element: /* @__PURE__ */ jsx13(ProtectedRoute, { children: /* @__PURE__ */ jsx13(Branding_default, { branding: state.branding, onUpdateBranding: handleUpdateBranding }) }) }),
      /* @__PURE__ */ jsx13(Route, { path: "/database", element: /* @__PURE__ */ jsx13(ProtectedRoute, { adminOnly: true, children: /* @__PURE__ */ jsx13(DatabasePortal_default, { config: state.dbConfig, onUpdateConfig: (c) => setState((prev) => prev ? { ...prev, dbConfig: { ...prev.dbConfig, ...c } } : null), stats: { clients: state.clients.length, projects: state.projects.length, quotations: state.quotations.length }, state }) }) }),
      /* @__PURE__ */ jsx13(Route, { path: "*", element: /* @__PURE__ */ jsx13(Navigate, { to: "/", replace: true }) })
    ] }),
    confirm.isOpen && /* @__PURE__ */ jsxs13("div", { className: "fixed inset-0 z-[2000] flex items-center justify-center p-4", children: [
      /* @__PURE__ */ jsx13("div", { className: "absolute inset-0 bg-slate-900/60 backdrop-blur-md", onClick: () => setConfirm((prev) => ({ ...prev, isOpen: false })) }),
      /* @__PURE__ */ jsxs13("div", { className: "relative bg-white rounded-[3rem] w-full max-w-md shadow-2xl border border-slate-100 animate-fade-in p-8 space-y-8", children: [
        /* @__PURE__ */ jsxs13("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx13("h2", { className: "text-xl font-black text-[#2E3191] tracking-tight uppercase", children: confirm.title }),
          /* @__PURE__ */ jsx13("button", { onClick: () => setConfirm((prev) => ({ ...prev, isOpen: false })), className: "p-2 text-slate-300", children: /* @__PURE__ */ jsx13(X7, { size: 24 }) })
        ] }),
        /* @__PURE__ */ jsx13("p", { className: "text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-tight", children: confirm.message }),
        /* @__PURE__ */ jsxs13("div", { className: "flex gap-4", children: [
          /* @__PURE__ */ jsx13("button", { onClick: () => setConfirm((prev) => ({ ...prev, isOpen: false })), className: "flex-1 px-4 py-4 border-2 border-slate-50 text-slate-400 font-black rounded-2xl uppercase text-[10px] tracking-widest", children: "Abort" }),
          /* @__PURE__ */ jsx13("button", { onClick: () => {
            confirm.onConfirm();
            setConfirm((prev) => ({ ...prev, isOpen: false }));
          }, className: `flex-1 px-4 py-4 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest active:scale-95 ${confirm.type === "danger" ? "bg-[#EC1C24]" : "bg-amber-500"}`, children: "Confirm" })
        ] })
      ] })
    ] })
  ] });
};
var App_default = App;

// index.tsx
import { jsx as jsx14 } from "react/jsx-runtime";
var rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
var root = ReactDOM.createRoot(rootElement);
root.render(
  /* @__PURE__ */ jsx14(React13.StrictMode, { children: /* @__PURE__ */ jsx14(App_default, {}) })
);
