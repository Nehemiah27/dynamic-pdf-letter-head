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
} from "./types";

const API_BASE_URL = "http://localhost:5000/revira/api";
const AUTH_TOKEN_KEY = "revira_auth_token";
const LOCAL_STORAGE_KEY = "revira_erp_local_db";

// --- Quotation Template Engines ---
const getCurrentDateStr = () => {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  return `${d}-${m}-${y}`;
};

const getMonthYearStr = () => {
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

const getBaseSections = (): Section[] => [
  {
    id: "s1_brief",
    title: "1.0 - SCOPE OF SUPPLY: Brief Details",
    type: "table",
    headers: ["Sl. No.", "Description", "Details"],
    rows: [
      ["1", "Building Nos.", "01"],
      ["2", "Building Description", "PEB Shed"],
      ["3", "Building built-up Area", "15494 SQF"],
    ],
    items: [],
    content: "",
    columnWidths: [20, 80, 70],
  },
  {
    id: "s3_loads",
    title: "3.0 DESIGN LOADS",
    type: "table",
    headers: ["Sr. No.", "Description", "PEB SHED"],
    rows: [
      ["1", "Dead load", "0.15 KN/M2"],
      ["2", "Live load", "0.57 KN/M2"],
      ["3", "Crane Capacity", "-"],
    ],
    items: [],
    content: "",
    columnWidths: [20, 80, 70],
  },
];

export const createSupplyAndFabricationTemplate = (
  projectId: string,
  version: number,
  clientName: string,
): Quotation => {
  const dateStr = getCurrentDateStr();
  const verStr = formatVersion(version);

  return {
    id: `local_${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    version,
    status: "Draft",
    refNo: `RNS/${getMonthYearStr()}/${clientName.replace(/\s+/g, "_")}/RNS-${verStr}`,
    date: dateStr,
    enquiryNo: `RNS-PEB - RNS-${verStr}`,
    location: "Madgaon (Goa)",
    subject: "Supply & erection of Steel Structures for PEB Shed",
    salutation: "Dear Sir,",
    introText: "Techno-Commercial Offer",
    introBody:
      "We are pleased to submit our proposal for the supply & erection of steel Structure against your subject enquiry.\n\nOur area of expertise is in complete design, manufacture, installation & commissioning of Heavy Structural Fabrication & Pre-Engineered Building.\n\nWe trust you will find that our proposal is in line with your requirements.",
    closingBody:
      "We hope you’ll find our offer in line with your requirement & place your valued PO on us giving us an opportunity to serve you.\n\nHowever, please feel free to contact us for any sort of additional information that you may feel is required pertaining to this offer. We assure you our best support at all times.",
    recipientName: clientName,
    recipientAddress: "Madgaon (Goa)",
    recipientContactPerson: "Contact Person",
    recipientPhone: "8390491843",
    recipientEmail: "geeta@interior.com",
    priceNotes: `• Above mentioned rates are quoted on the basis of inputs received.\n• Including transportation and excluding GST @ 18%.\n• Weight variation ±5%`,
    bankDetails: `Account holder: REVIRA NEXGEN STRUCTURES PRIVATE LIMITED\nBank Name: YES Bank\nA/C No.: 073361900002657\nIFSC Code: YESB0000733`,
    regardsName: "Hareram R Sharma",
    regardsPhone: "8390491843",
    regardsEmail: "Hareram.sharma@divinenexgen.com",
    createdAt: new Date().toISOString(),
    sections: getBaseSections(),
  };
};

export const createStructuralFabricationTemplate = (
  projectId: string,
  version: number,
  clientName: string,
): Quotation => {
  return {
    ...createSupplyAndFabricationTemplate(projectId, version, clientName),
    enquiryNo: `RNS-SF- RNS-${formatVersion(version)}`,
  };
};

export const createJobWorkTemplate = (
  projectId: string,
  version: number,
  clientName: string,
): Quotation => {
  return {
    ...createSupplyAndFabricationTemplate(projectId, version, clientName),
    enquiryNo: `RNS-JW- RNS-${formatVersion(version)}`,
  };
};

// --- API Service with Local Fallback ---
export class NestApiService {
  private static token: string | null = localStorage.getItem(AUTH_TOKEN_KEY);
  private static isLocalMode: boolean = false;

  private static getHeaders() {
    return {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  static setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
    else localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  static getIsLocalMode() {
    return this.isLocalMode;
  }

  private static getLocalStorageData(): Partial<AppState> {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  private static saveLocalStorageData(updates: Partial<AppState>) {
    const current = this.getLocalStorageData();
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ ...current, ...updates }),
    );
  }

  static async login(
    email: string,
    pass: string,
  ): Promise<{ user: User; token: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pass }),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid email or password");
        throw new Error("Server error: Database cluster timeout");
      }

      this.isLocalMode = false;
      return await res.json();
    } catch (e: any) {
      if (
        e.message.includes("Failed to fetch") ||
        e.message.includes("reachable")
      ) {
        console.warn("Backend unreachable. Attempting demo mode login...");

        const local = this.getLocalStorageData();
        const localUsers = local.users || [];
        const user =
          localUsers.find((u) => u.email === email && u.password === pass) ||
          (email === "admin@reviranexgen.com" && pass === "admin@123"
            ? {
                id: "demo_admin",
                name: "Hareram Sharma (Demo)",
                email: "admin@reviranexgen.com",
                role: "Administrator" as any,
              }
            : null);

        if (user) {
          this.isLocalMode = true;
          return { user, token: "demo_token" };
        }
        throw new Error(
          "Communication failure: NestJS server is not reachable and demo credentials mismatch.",
        );
      }
      throw e;
    }
  }

  static async fetchAllData(): Promise<Partial<AppState>> {
    try {
      const res = await fetch(`${API_BASE_URL}/data`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error("API Sync Failed");
      this.isLocalMode = false;
      return await res.json();
    } catch (e) {
      console.warn("Using Local Edge Runtime for data hydration.");
      this.isLocalMode = true;
      const local = this.getLocalStorageData();
      return {
        users: local.users || [
          {
            id: "demo_admin",
            name: "Hareram Sharma (Demo)",
            email: "admin@reviranexgen.com",
            role: "Administrator",
          },
        ],
        clients: local.clients || [],
        projects: local.projects || [],
        quotations: local.quotations || [],
        branding: local.branding || getEmptyState().branding,
        dbConfig: { ...getEmptyState().dbConfig, status: "Disconnected" },
      };
    }
  }

  static async getProfile(): Promise<User> {
    if (this.isLocalMode) {
      return {
        id: "demo_admin",
        name: "Hareram Sharma (Demo)",
        email: "admin@reviranexgen.com",
        role: "Administrator",
      };
    }
    const res = await fetch(`${API_BASE_URL}/data`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    return data.users[0];
  }

  private static async request(
    method: string,
    path: string,
    body?: any,
    collection?: keyof AppState,
  ) {
    if (this.isLocalMode && collection) {
      const current = this.getLocalStorageData();
      const items = (current[collection] as any[]) || [];

      if (method === "POST") {
        const newItem = {
          ...body,
          id: `local_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        };
        this.saveLocalStorageData({ [collection]: [...items, newItem] });
        return newItem;
      }

      if (method === "PUT") {
        const id = path.split("/").pop();
        const updatedItems = items.map((item) =>
          item.id === id ? { ...item, ...body } : item,
        );
        this.saveLocalStorageData({ [collection]: updatedItems });
        return { ...body, id };
      }

      if (method === "DELETE") {
        const id = path.split("/").pop();
        const filteredItems = items.filter((item) => item.id !== id);
        this.saveLocalStorageData({ [collection]: filteredItems });
        return null;
      }
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: this.getHeaders(),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.status === 204 ? null : await res.json();
  }

  // Entities
  static async saveUser(user: User) {
    return this.request("POST", "/users", user, "users");
  }
  static async updateUser(id: string, updates: Partial<User>) {
    return this.request("PUT", `/users/${id}`, updates, "users");
  }
  static async deleteUser(id: string) {
    return this.request("DELETE", `/users/${id}`, undefined, "users");
  }

  static async saveClient(client: Client) {
    return this.request("POST", "/clients", client, "clients");
  }
  static async updateClient(id: string, updates: Partial<Client>) {
    return this.request("PUT", `/clients/${id}`, updates, "clients");
  }
  static async deleteClient(id: string) {
    return this.request("DELETE", `/clients/${id}`, undefined, "clients");
  }

  static async saveProject(project: Project) {
    return this.request("POST", "/projects", project, "projects");
  }
  static async updateProject(id: string, updates: Partial<Project>) {
    return this.request("PUT", `/projects/${id}`, updates, "projects");
  }
  static async deleteProject(id: string) {
    return this.request("DELETE", `/projects/${id}`, undefined, "projects");
  }

  static async saveQuotation(quotation: Quotation) {
    return this.request("POST", "/quotations", quotation, "quotations");
  }
  static async updateQuotation(id: string, updates: Partial<Quotation>) {
    return this.request("PUT", `/quotations/${id}`, updates, "quotations");
  }
  static async deleteQuotation(id: string) {
    return this.request("DELETE", `/quotations/${id}`, undefined, "quotations");
  }

  static async updateBranding(updates: Branding) {
    if (this.isLocalMode) {
      this.saveLocalStorageData({ branding: updates });
      return updates;
    }
    return this.request("PUT", "/branding", updates);
  }
}

export const loadState = async (): Promise<AppState> => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return getEmptyState();

  try {
    NestApiService.setToken(token);
    const data = await NestApiService.fetchAllData();
    const user = await NestApiService.getProfile();

    return {
      ...getEmptyState(),
      ...data,
      currentUser: user,
      token,
      dbConfig: {
        ...getEmptyState().dbConfig,
        status: NestApiService.getIsLocalMode() ? "Disconnected" : "Connected",
      },
    } as AppState;
  } catch (e) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return getEmptyState();
  }
};

const getEmptyState = (): AppState => ({
  currentUser: null,
  token: null,
  users: [],
  clients: [],
  projects: [],
  quotations: [],
  branding: {
    logo: "https://reviranexgen.com/assets/logo-with-name.png",
    logoBackgroundColor: "#ffffff",
    headerText: "Blueprint of Commitment.",
    footerText: "Computer Generated.",
    brandColor: "#2E3191",
    registry: {
      name: "Revira nexGen Structures",
      cin: "",
      email: "",
      website: "",
      regionalAddress: "",
      headOfficeAddress: "",
      nagpurOffice: "",
      delhiOffice: "",
      phone1: "",
      phone2: "",
    },
  },
  dbConfig: {
    uri: "",
    dbName: "",
    apiEndpoint: API_BASE_URL,
    status: "Disconnected",
    lastSync: null,
  },
});

export const saveState = async (state: AppState) => {};
