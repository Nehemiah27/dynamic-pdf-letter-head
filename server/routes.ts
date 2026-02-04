import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, hashPassword } from "./auth";
import { User } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // Client routes
  app.get(api.clients.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const clients = await storage.getClients();
    res.json(clients);
  });

  app.get(api.clients.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const client = await storage.getClient(Number(req.params.id));
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(client);
  });

  app.post(api.clients.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.clients.create.input.parse(req.body);
      const client = await storage.createClient(input);
      res.status(201).json(client);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.put(api.clients.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.clients.update.input.parse(req.body);
      const client = await storage.updateClient(Number(req.params.id), input);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.delete(api.clients.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const deleted = await storage.deleteClient(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(204).send();
  });

  // Project routes
  app.get(api.projects.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.get(api.projects.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const project = await storage.getProject(Number(req.params.id));
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  });

  app.post(api.projects.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.projects.create.input.parse(req.body);
      const project = await storage.createProject(input);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.put(api.projects.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.projects.update.input.parse(req.body);
      const project = await storage.updateProject(Number(req.params.id), input);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.delete(api.projects.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const deleted = await storage.deleteProject(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(204).send();
  });

  // Quotation routes
  app.get(api.quotations.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const quotations = await storage.getQuotations();
    res.json(quotations);
  });

  app.get(api.quotations.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const quotation = await storage.getQuotation(Number(req.params.id));
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }
    res.json(quotation);
  });

  app.get(api.quotations.getByProject.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const quotation = await storage.getQuotationByProjectId(Number(req.params.projectId));
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found for this project" });
    }
    res.json(quotation);
  });

  app.post(api.quotations.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.quotations.create.input.parse(req.body);
      const quotation = await storage.createQuotation(input);
      res.status(201).json(quotation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.put(api.quotations.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.quotations.update.input.parse(req.body);
      const quotation = await storage.updateQuotation(Number(req.params.id), input);
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      res.json(quotation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.delete(api.quotations.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // First delete all items associated with this quotation
    await storage.deleteQuotationItemsByQuotationId(Number(req.params.id));
    const deleted = await storage.deleteQuotation(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Quotation not found" });
    }
    res.status(204).send();
  });

  // Duplicate quotation
  app.post("/api/quotations/:id/duplicate", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const originalQuotation = await storage.getQuotation(Number(req.params.id));
      if (!originalQuotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }

      // Get all versions of this quotation to determine next version number
      const allVersions = await storage.getQuotationVersions(originalQuotation.projectId);
      const nextVersion = allVersions.length + 1;
      const nextRevision = `R-${String(nextVersion).padStart(3, '0')}`;
      
      // Set enquiry number to match revision (R-002 = 002, R-003 = 003)
      let nextEnquiryNumber = originalQuotation.enquiryNumber;
      if (nextEnquiryNumber) {
        const match = nextEnquiryNumber.match(/^(.*)(\d{3})$/);
        if (match) {
          const prefix = match[1];
          nextEnquiryNumber = `${prefix}${String(nextVersion).padStart(3, '0')}`;
        }
      }

      // Create new quotation as duplicate
      const newQuotation = await storage.createQuotation({
        projectId: originalQuotation.projectId,
        quotationNumber: originalQuotation.quotationNumber,
        revision: nextRevision,
        version: nextVersion,
        parentQuotationId: originalQuotation.id,
        enquiryNumber: nextEnquiryNumber,
        subject: originalQuotation.subject,
        contactName: originalQuotation.contactName,
        contactMobile: originalQuotation.contactMobile,
        contactEmail: originalQuotation.contactEmail,
        buildingDescription: originalQuotation.buildingDescription,
        buildingArea: originalQuotation.buildingArea,
        frameType: originalQuotation.frameType,
        length: originalQuotation.length,
        width: originalQuotation.width,
        clearHeight: originalQuotation.clearHeight,
        roofSlope: originalQuotation.roofSlope,
        paymentTerms: originalQuotation.paymentTerms,
        notes: originalQuotation.notes,
        contentSections: originalQuotation.contentSections,
      });

      // Duplicate all items
      const originalItems = await storage.getQuotationItems(originalQuotation.id);
      for (const item of originalItems) {
        await storage.createQuotationItem({
          quotationId: newQuotation.id,
          serialNo: item.serialNo,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          remarks: item.remarks,
        });
      }

      res.status(201).json(newQuotation);
    } catch (err) {
      console.error("Duplicate error:", err);
      res.status(500).json({ message: "Failed to duplicate quotation" });
    }
  });

  // Get quotation versions
  app.get("/api/projects/:projectId/quotation-versions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const versions = await storage.getQuotationVersions(Number(req.params.projectId));
    res.json(versions);
  });

  // Quotation Items routes
  app.get(api.quotationItems.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const items = await storage.getQuotationItems(Number(req.params.quotationId));
    res.json(items);
  });

  app.post(api.quotationItems.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.quotationItems.create.input.parse(req.body);
      const item = await storage.createQuotationItem({
        ...input,
        quotationId: Number(req.params.quotationId),
      });
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.put(api.quotationItems.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.quotationItems.update.input.parse(req.body);
      const item = await storage.updateQuotationItem(Number(req.params.id), input);
      if (!item) {
        return res.status(404).json({ message: "Quotation item not found" });
      }
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.delete(api.quotationItems.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const deleted = await storage.deleteQuotationItem(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Quotation item not found" });
    }
    res.status(204).send();
  });

  // Public branding endpoint (for login page)
  app.get("/api/branding/public", async (req, res) => {
    let brandingData = await storage.getBranding();
    if (!brandingData) {
      return res.json({ logoUrl: null, entityName: null });
    }
    res.json({ 
      logoUrl: brandingData.logoUrl, 
      entityName: brandingData.entityName 
    });
  });

  // Branding routes
  app.get(api.branding.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    let brandingData = await storage.getBranding();
    if (!brandingData) {
      // Create default branding if it doesn't exist
      brandingData = await storage.createBranding({
        logoUrl: "https://reviranexgen.com/assets/logo-with-name.png",
        headerUrl: "https://reviranexgen.com/assets/header.jpg",
        footerUrl: "https://reviranexgen.com/assets/footer.jpg",
        stampUrl: "https://reviranexgen.com/assets/stamp.png",
        primaryColor: "#da2032",
        secondaryColor: "#2f3591",
        entityName: "Revira NexGen Structure Pvt. Ltd.",
        cin: "U16222DL2025PTC459465",
        website: "www.reviranexgen.com",
        email: "info@reviranexgen.com",
        headOfficeAddress: "28, E2 Block, Shivram Park Nangloi Delhi - 110041",
        workshopAddress: "Flat No. 302, 3rd Floor Rajat Residency, Subharambha Society Near Toll Naka, Dabha, Nagpur 440023",
      });
    }
    res.json(brandingData);
  });

  app.put(api.branding.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.branding.update.input.parse(req.body);
      let brandingData = await storage.getBranding();
      if (!brandingData) {
        // Create branding if it doesn't exist
        brandingData = await storage.createBranding({
          logoUrl: input.logoUrl || "https://reviranexgen.com/assets/logo-with-name.png",
          headerUrl: input.headerUrl || "https://reviranexgen.com/assets/header.jpg",
          footerUrl: input.footerUrl || "https://reviranexgen.com/assets/footer.jpg",
          stampUrl: input.stampUrl || "https://reviranexgen.com/assets/stamp.png",
          primaryColor: input.primaryColor || "#da2032",
          secondaryColor: input.secondaryColor || "#2f3591",
          entityName: input.entityName || "Revira NexGen Structure Pvt. Ltd.",
          cin: input.cin || "U16222DL2025PTC459465",
          website: input.website || "www.reviranexgen.com",
          email: input.email || "info@reviranexgen.com",
          headOfficeAddress: input.headOfficeAddress || "28, E2 Block, Shivram Park Nangloi Delhi - 110041",
          workshopAddress: input.workshopAddress || "Flat No. 302, 3rd Floor Rajat Residency, Subharambha Society Near Toll Naka, Dabha, Nagpur 440023",
        });
        return res.json(brandingData);
      }
      const updated = await storage.updateBranding(brandingData.id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  // Invoice routes
  app.get(api.invoices.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const invoicesList = await storage.getInvoices();
    res.json(invoicesList);
  });

  app.get(api.invoices.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const invoice = await storage.getInvoice(Number(req.params.id));
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json(invoice);
  });

  app.get(api.invoices.getByProject.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const invoice = await storage.getInvoiceByProjectId(Number(req.params.projectId));
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found for this project" });
    }
    res.json(invoice);
  });

  app.post(api.invoices.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.invoices.create.input.parse(req.body);
      const invoice = await storage.createInvoice(input);
      res.status(201).json(invoice);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.put(api.invoices.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.invoices.update.input.parse(req.body);
      const invoice = await storage.updateInvoice(Number(req.params.id), input);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.delete(api.invoices.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    await storage.deleteInvoiceItemsByInvoiceId(Number(req.params.id));
    const deleted = await storage.deleteInvoice(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(204).send();
  });

  // Duplicate invoice
  app.post("/api/invoices/:id/duplicate", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const originalInvoice = await storage.getInvoice(Number(req.params.id));
      if (!originalInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const allVersions = await storage.getInvoiceVersions(originalInvoice.projectId);
      const nextVersion = allVersions.length + 1;
      const nextRevision = `R-${String(nextVersion).padStart(3, '0')}`;

      const newInvoice = await storage.createInvoice({
        projectId: originalInvoice.projectId,
        invoiceNumber: originalInvoice.invoiceNumber,
        revision: nextRevision,
        version: nextVersion,
        parentInvoiceId: originalInvoice.id,
        organisationName: originalInvoice.organisationName,
        registeredAddress: originalInvoice.registeredAddress,
        consigneeAddress: originalInvoice.consigneeAddress,
        clientGstin: originalInvoice.clientGstin,
        workOrderNo: originalInvoice.workOrderNo,
        dispatchDetails: originalInvoice.dispatchDetails,
        cgstRate: originalInvoice.cgstRate,
        sgstRate: originalInvoice.sgstRate,
        igstRate: originalInvoice.igstRate,
        appliedTaxType: originalInvoice.appliedTaxType,
        totalAmount: originalInvoice.totalAmount,
        totalTax: originalInvoice.totalTax,
        grandTotal: originalInvoice.grandTotal,
        contentSections: originalInvoice.contentSections,
      });

      const originalItems = await storage.getInvoiceItems(originalInvoice.id);
      for (const item of originalItems) {
        await storage.createInvoiceItem({
          invoiceId: newInvoice.id,
          serialNo: item.serialNo,
          description: item.description,
          hsnCode: item.hsnCode,
          quantity: item.quantity,
          unit: item.unit,
          ratePerUnit: item.ratePerUnit,
          percentage: item.percentage,
          amount: item.amount,
          remarks: item.remarks,
        });
      }

      res.status(201).json(newInvoice);
    } catch (err) {
      console.error("Duplicate invoice error:", err);
      res.status(500).json({ message: "Failed to duplicate invoice" });
    }
  });

  // Get invoice versions
  app.get("/api/projects/:projectId/invoice-versions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const versions = await storage.getInvoiceVersions(Number(req.params.projectId));
    res.json(versions);
  });

  // Invoice Items routes
  app.get(api.invoiceItems.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const items = await storage.getInvoiceItems(Number(req.params.invoiceId));
    res.json(items);
  });

  app.post(api.invoiceItems.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.invoiceItems.create.input.parse(req.body);
      const item = await storage.createInvoiceItem({
        ...input,
        invoiceId: Number(req.params.invoiceId),
      });
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.put(api.invoiceItems.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.invoiceItems.update.input.parse(req.body);
      const item = await storage.updateInvoiceItem(Number(req.params.id), input);
      if (!item) {
        return res.status(404).json({ message: "Invoice item not found" });
      }
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.delete(api.invoiceItems.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const deleted = await storage.deleteInvoiceItem(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Invoice item not found" });
    }
    res.status(204).send();
  });

  // User management routes
  app.get(api.users.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const users = await storage.getUsers();
    // Remove passwords from response
    const sanitizedUsers = users.map(u => ({ ...u, password: undefined }));
    res.json(sanitizedUsers);
  });

  app.get(api.users.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = await storage.getUser(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Remove password from response
    const { password, ...sanitizedUser } = user;
    res.json(sanitizedUser);
  });

  app.post(api.users.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    // Check if current user is Administrator
    const currentUser = req.user as User;
    if (currentUser.role !== "Administrator") {
      return res.status(403).json({ message: "Only administrators can create users" });
    }
    
    try {
      const { assignedClientIds, ...input } = api.users.create.input.parse(req.body);
      
      // Hash the password
      const hashedPassword = await hashPassword(input.password);
      
      // Create user with email same as username if not provided
      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
        email: input.email || input.username,
      });
      
      // Set client assignments for Standard users
      if (input.role === "Standard" && assignedClientIds && assignedClientIds.length > 0) {
        await storage.setUserClientAssignments(user.id, assignedClientIds);
      }
      
      const { password, ...sanitizedUser } = user;
      res.status(201).json(sanitizedUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.put(api.users.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    // Check if current user is Administrator
    const currentUser = req.user as User;
    if (currentUser.role !== "Administrator") {
      return res.status(403).json({ message: "Only administrators can update users" });
    }
    
    try {
      const { assignedClientIds, ...input } = api.users.update.input.parse(req.body);
      
      // Hash password if provided
      const updates: any = { ...input };
      if (input.password) {
        updates.password = await hashPassword(input.password);
      }
      
      const user = await storage.updateUser(Number(req.params.id), updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update client assignments if provided
      if (assignedClientIds !== undefined) {
        await storage.setUserClientAssignments(user.id, assignedClientIds);
      }
      
      const { password, ...sanitizedUser } = user;
      res.json(sanitizedUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.delete(api.users.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    // Check if current user is Administrator
    const currentUser = req.user as User;
    if (currentUser.role !== "Administrator") {
      return res.status(403).json({ message: "Only administrators can delete users" });
    }
    
    // Prevent deleting yourself
    const userId = Number(req.params.id);
    if (userId === currentUser.id) {
      return res.status(403).json({ message: "Cannot delete your own account" });
    }
    
    const deleted = await storage.deleteUser(userId);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(204).send();
  });

  app.get(api.users.getClientAssignments.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const assignments = await storage.getUserClientAssignments(Number(req.params.id));
    const clientIds = assignments.map(a => a.clientId);
    res.json(clientIds);
  });

  return httpServer;
}
