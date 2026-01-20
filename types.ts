
export type Role = 'Administrator' | 'Standard';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  gstin: string;
  contactPerson: string;
  email: string;
  phone: string;
  createdAt: string;
}

export enum WorkflowType {
  SUPPLY_AND_FABRICATION = 'Supply and Fabrication',
  STRUCTURAL_FABRICATION = 'Structural Fabrication',
  JOB_WORK = 'Job Work',
}

export interface Section {
  id: string;
  title: string;
  type: 'table' | 'list' | 'text' | 'mixed'; // Added 'mixed' for paragraph + list
  headers: string[]; // For tables
  rows: string[][];  // For tables (dynamic columns)
  items: string[];   // For lists
  content: string;   // For text/paragraph
  columnWidths?: (number | null)[]; // Custom column widths in mm for PDF/px for UI
}

export interface Quotation {
  id: string;
  projectId: string;
  version: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
  
  // Formal Header Fields
  refNo: string;
  date: string;
  enquiryNo: string;
  location: string;
  subject: string;
  salutation: string;
  introText: string; // Brief intro
  introBody: string; // Detailed multi-paragraph letter body
  closingBody: string; // Closing statement body
  
  // Recipient (Editable per quotation)
  recipientName: string;
  recipientAddress: string;
  recipientContactPerson: string;
  recipientPhone: string;
  recipientEmail: string;
  
  // Commercial Info
  priceNotes: string;
  bankDetails: string;
  
  // Flexible Sections
  sections: Section[];

  // Design Mockups (Images/PDF thumbnails as base64)
  designMockups?: string[];
  
  // Closing
  regardsName: string;
  regardsPhone: string;
  regardsEmail: string;
  
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  location: string;
  workflow: WorkflowType;
  status: 'Planning' | 'Ongoing' | 'Completed' | 'On Hold';
  createdAt: string;
  assignedUserId: string;
}

export interface Branding {
  logo: string;
  logoBackgroundColor: string; // Added field
  headerImage?: string; // Uploaded header image override
  footerImage?: string; // Uploaded footer image override
  headerText: string;
  footerText: string;
  brandColor: string;
  registry: {
    name: string;
    cin: string;
    email: string;
    website: string;
    regionalAddress: string;
    headOfficeAddress: string;
    nagpurOffice: string;
    delhiOffice: string;
    phone1: string;
    phone2: string;
  };
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  clients: Client[];
  projects: Project[];
  quotations: Quotation[];
  branding: Branding;
}
