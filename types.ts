
export type Role = 'Administrator' | 'Standard';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
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
  type: 'table' | 'list' | 'text' | 'mixed';
  headers: string[];
  rows: string[][];
  items: string[];
  content: string;
  columnWidths?: (number | null)[];
}

export interface Quotation {
  id: string;
  projectId: string;
  version: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
  refNo: string;
  date: string;
  enquiryNo: string;
  location: string;
  subject: string;
  salutation: string;
  introText: string;
  introBody: string;
  closingBody: string;
  recipientName: string;
  recipientAddress: string;
  recipientContactPerson: string;
  recipientPhone: string;
  recipientEmail: string;
  priceNotes: string;
  bankDetails: string;
  sections: Section[];
  designMockups?: string[];
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
  logoBackgroundColor: string;
  headerImage?: string;
  footerImage?: string;
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

export interface DbConfig {
  uri: string;
  dbName: string;
  apiEndpoint: string;
  status: 'Connected' | 'Disconnected' | 'Connecting' | 'Error';
  lastSync: string | null;
}

export interface AppState {
  currentUser: User | null;
  token: string | null;
  users: User[];
  clients: Client[];
  projects: Project[];
  quotations: Quotation[];
  branding: Branding;
  dbConfig: DbConfig;
}
