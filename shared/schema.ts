import { pgTable, text, serial, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoles = ["Standard", "Administrator"] as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull().default("Admin"),
  email: text("email"),
  mobile: text("mobile"),
  role: text("role").notNull().default("Standard"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userClientAssignments = pgTable("user_client_assignments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  clientId: integer("client_id").notNull().references(() => clients.id),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  gstNo: text("gst_no").notNull(),
  contactPerson: text("contact_person").notNull(),
  mobileNumber: text("mobile_number").notNull(),
  emailAddress: text("email_address").notNull(),
});

export const quotationTypes = ["Supply and Fabrication", "Structural Fabrication", "Job Work"] as const;

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  projectName: text("project_name").notNull(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  location: text("location").notNull(),
  quotationType: text("quotation_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quotations = pgTable("quotations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  quotationNumber: text("quotation_number").notNull(),
  revision: text("revision").notNull().default("R-000"),
  version: integer("version").notNull().default(1),
  parentQuotationId: integer("parent_quotation_id"),
  enquiryNumber: text("enquiry_number").notNull(),
  subject: text("subject").notNull(),
  contactName: text("contact_name").notNull(),
  contactMobile: text("contact_mobile").notNull(),
  contactEmail: text("contact_email").notNull(),
  // Building details for Supply and Fabrication
  buildingDescription: text("building_description"),
  buildingArea: text("building_area"),
  frameType: text("frame_type"),
  length: text("length"),
  width: text("width"),
  clearHeight: text("clear_height"),
  roofSlope: text("roof_slope"),
  // Payment terms
  paymentTerms: text("payment_terms"),
  notes: text("notes"),
  // Editable content sections stored as JSON
  contentSections: text("content_sections"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quotationItems = pgTable("quotation_items", {
  id: serial("id").primaryKey(),
  quotationId: integer("quotation_id").notNull().references(() => quotations.id),
  serialNo: integer("serial_no").notNull(),
  description: text("description").notNull(),
  unit: text("unit").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  rate: decimal("rate", { precision: 12, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  remarks: text("remarks"),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  invoiceNumber: text("invoice_number").notNull(),
  revision: text("revision").notNull().default("R-001"),
  version: integer("version").notNull().default(1),
  parentInvoiceId: integer("parent_invoice_id"),
  // Client details
  organisationName: text("organisation_name").notNull(),
  registeredAddress: text("registered_address").notNull(),
  consigneeAddress: text("consignee_address").notNull(),
  clientGstin: text("client_gstin"),
  workOrderNo: text("work_order_no"),
  dispatchDetails: text("dispatch_details"),
  // Tax details
  cgstRate: decimal("cgst_rate", { precision: 5, scale: 2 }).default("9"),
  sgstRate: decimal("sgst_rate", { precision: 5, scale: 2 }).default("9"),
  igstRate: decimal("igst_rate", { precision: 5, scale: 2 }).default("18"),
  appliedTaxType: text("applied_tax_type").default("igst"), // 'cgst_sgst' or 'igst'
  // Totals
  totalAmount: decimal("total_amount", { precision: 14, scale: 2 }).default("0"),
  totalTax: decimal("total_tax", { precision: 14, scale: 2 }).default("0"),
  grandTotal: decimal("grand_total", { precision: 14, scale: 2 }).default("0"),
  // Editable content sections stored as JSON
  contentSections: text("content_sections"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  serialNo: integer("serial_no").notNull(),
  description: text("description").notNull(),
  hsnCode: text("hsn_code"),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unit: text("unit").default("LS"),
  ratePerUnit: decimal("rate_per_unit", { precision: 12, scale: 2 }),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  remarks: text("remarks"),
});

export const branding = pgTable("branding", {
  id: serial("id").primaryKey(),
  logoUrl: text("logo_url").notNull().default("https://reviranexgen.com/assets/logo-with-name.png"),
  headerUrl: text("header_url").notNull().default("https://reviranexgen.com/assets/header.jpg"),
  footerUrl: text("footer_url").notNull().default("https://reviranexgen.com/assets/footer.jpg"),
  stampUrl: text("stamp_url").notNull().default("https://reviranexgen.com/assets/stamp.png"),
  primaryColor: text("primary_color").notNull().default("#da2032"),
  secondaryColor: text("secondary_color").notNull().default("#2f3591"),
  entityName: text("entity_name").notNull().default("Revira NexGen Structure Pvt. Ltd."),
  cin: text("cin").notNull().default("U16222DL2025PTC459465"),
  website: text("website").notNull().default("www.reviranexgen.com"),
  email: text("email").notNull().default("info@reviranexgen.com"),
  headOfficeAddress: text("head_office_address").notNull().default("28, E2 Block, Shivram Park Nangloi Delhi - 110041"),
  workshopAddress: text("workshop_address").notNull().default("Flat No. 302, 3rd Floor Rajat Residency, Subharambha Society Near Toll Naka, Dabha, Nagpur 440023"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertClientSchema = createInsertSchema(clients);
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertQuotationSchema = createInsertSchema(quotations).omit({ id: true, createdAt: true });
export const insertQuotationItemSchema = createInsertSchema(quotationItems).omit({ id: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({ id: true });
export const insertBrandingSchema = createInsertSchema(branding).omit({ id: true, updatedAt: true });
export const insertUserClientAssignmentSchema = createInsertSchema(userClientAssignments).omit({ id: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type QuotationItem = typeof quotationItems.$inferSelect;
export type InsertQuotationItem = z.infer<typeof insertQuotationItemSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type Branding = typeof branding.$inferSelect;
export type InsertBranding = z.infer<typeof insertBrandingSchema>;
export type UserClientAssignment = typeof userClientAssignments.$inferSelect;
export type InsertUserClientAssignment = z.infer<typeof insertUserClientAssignmentSchema>;
