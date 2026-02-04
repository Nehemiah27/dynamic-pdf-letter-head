import { z } from 'zod';
import { users, clients, projects, quotations, quotationItems, quotationTypes, invoices, invoiceItems, branding, userRoles, userClientAssignments } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string().email("Please enter a valid email address"),
        password: z.string().min(1, "Password is required")
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  clients: {
    list: {
      method: 'GET' as const,
      path: '/api/clients',
      responses: {
        200: z.array(z.custom<typeof clients.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/clients/:id',
      responses: {
        200: z.custom<typeof clients.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/clients',
      input: z.object({
        name: z.string().min(1, "Client name is required"),
        location: z.string().min(1, "Location is required"),
        gstNo: z.string().min(1, "GST No. is required"),
        contactPerson: z.string().min(1, "Contact person is required"),
        mobileNumber: z.string().min(10, "Valid mobile number is required"),
        emailAddress: z.string().email("Valid email is required"),
      }),
      responses: {
        201: z.custom<typeof clients.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/clients/:id',
      input: z.object({
        name: z.string().min(1).optional(),
        location: z.string().min(1).optional(),
        gstNo: z.string().min(1).optional(),
        contactPerson: z.string().min(1).optional(),
        mobileNumber: z.string().min(10).optional(),
        emailAddress: z.string().email().optional(),
      }),
      responses: {
        200: z.custom<typeof clients.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/clients/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  projects: {
    list: {
      method: 'GET' as const,
      path: '/api/projects',
      responses: {
        200: z.array(z.custom<typeof projects.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/projects/:id',
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects',
      input: z.object({
        projectName: z.string().min(1, "Project name is required"),
        clientId: z.number().min(1, "Client selection is required"),
        location: z.string().min(1, "Location is required"),
        quotationType: z.enum(quotationTypes, { errorMap: () => ({ message: "Quotation type is required" }) }),
      }),
      responses: {
        201: z.custom<typeof projects.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/projects/:id',
      input: z.object({
        projectName: z.string().min(1).optional(),
        clientId: z.number().min(1).optional(),
        location: z.string().min(1).optional(),
        quotationType: z.enum(quotationTypes).optional(),
      }),
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/projects/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  quotations: {
    list: {
      method: 'GET' as const,
      path: '/api/quotations',
      responses: {
        200: z.array(z.custom<typeof quotations.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/quotations/:id',
      responses: {
        200: z.custom<typeof quotations.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    getByProject: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/quotation',
      responses: {
        200: z.custom<typeof quotations.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/quotations',
      input: z.object({
        projectId: z.number().min(1),
        quotationNumber: z.string().min(1),
        revision: z.string().default("R-000"),
        enquiryNumber: z.string().min(1),
        subject: z.string().min(1),
        contactName: z.string().min(1),
        contactMobile: z.string().min(1),
        contactEmail: z.string().email(),
        buildingDescription: z.string().optional(),
        buildingArea: z.string().optional(),
        frameType: z.string().optional(),
        length: z.string().optional(),
        width: z.string().optional(),
        clearHeight: z.string().optional(),
        roofSlope: z.string().optional(),
        paymentTerms: z.string().optional(),
        notes: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof quotations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/quotations/:id',
      input: z.object({
        quotationNumber: z.string().min(1).optional(),
        revision: z.string().optional(),
        enquiryNumber: z.string().min(1).optional(),
        subject: z.string().min(1).optional(),
        contactName: z.string().min(1).optional(),
        contactMobile: z.string().min(1).optional(),
        contactEmail: z.string().email().optional(),
        buildingDescription: z.string().optional(),
        buildingArea: z.string().optional(),
        frameType: z.string().optional(),
        length: z.string().optional(),
        width: z.string().optional(),
        clearHeight: z.string().optional(),
        roofSlope: z.string().optional(),
        paymentTerms: z.string().optional(),
        notes: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof quotations.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/quotations/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  quotationItems: {
    list: {
      method: 'GET' as const,
      path: '/api/quotations/:quotationId/items',
      responses: {
        200: z.array(z.custom<typeof quotationItems.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/quotations/:quotationId/items',
      input: z.object({
        serialNo: z.number().min(1),
        description: z.string().min(1),
        unit: z.string().min(1),
        quantity: z.string(),
        rate: z.string(),
        amount: z.string(),
        remarks: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof quotationItems.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/quotation-items/:id',
      input: z.object({
        serialNo: z.number().min(1).optional(),
        description: z.string().min(1).optional(),
        unit: z.string().min(1).optional(),
        quantity: z.string().optional(),
        rate: z.string().optional(),
        amount: z.string().optional(),
        remarks: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof quotationItems.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/quotation-items/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  branding: {
    get: {
      method: 'GET' as const,
      path: '/api/branding',
      responses: {
        200: z.custom<typeof branding.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/branding',
      input: z.object({
        logoUrl: z.string().optional(),
        headerUrl: z.string().optional(),
        footerUrl: z.string().optional(),
        stampUrl: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        entityName: z.string().optional(),
        cin: z.string().optional(),
        website: z.string().optional(),
        email: z.string().optional(),
        headOfficeAddress: z.string().optional(),
        workshopAddress: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof branding.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  invoices: {
    list: {
      method: 'GET' as const,
      path: '/api/invoices',
      responses: {
        200: z.array(z.custom<typeof invoices.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/invoices/:id',
      responses: {
        200: z.custom<typeof invoices.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    getByProject: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/invoice',
      responses: {
        200: z.custom<typeof invoices.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/invoices',
      input: z.object({
        projectId: z.number().min(1),
        invoiceNumber: z.string().min(1),
        revision: z.string().default("R-001"),
        organisationName: z.string().min(1),
        registeredAddress: z.string().min(1),
        consigneeAddress: z.string().min(1),
        clientGstin: z.string().optional(),
        workOrderNo: z.string().optional(),
        dispatchDetails: z.string().optional(),
        cgstRate: z.string().optional(),
        sgstRate: z.string().optional(),
        igstRate: z.string().optional(),
        appliedTaxType: z.string().optional(),
        totalAmount: z.string().optional(),
        totalTax: z.string().optional(),
        grandTotal: z.string().optional(),
        contentSections: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof invoices.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/invoices/:id',
      input: z.object({
        invoiceNumber: z.string().min(1).optional(),
        revision: z.string().optional(),
        organisationName: z.string().min(1).optional(),
        registeredAddress: z.string().min(1).optional(),
        consigneeAddress: z.string().min(1).optional(),
        clientGstin: z.string().optional(),
        workOrderNo: z.string().optional(),
        dispatchDetails: z.string().optional(),
        cgstRate: z.string().optional(),
        sgstRate: z.string().optional(),
        igstRate: z.string().optional(),
        appliedTaxType: z.string().optional(),
        totalAmount: z.string().optional(),
        totalTax: z.string().optional(),
        grandTotal: z.string().optional(),
        contentSections: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof invoices.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/invoices/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  invoiceItems: {
    list: {
      method: 'GET' as const,
      path: '/api/invoices/:invoiceId/items',
      responses: {
        200: z.array(z.custom<typeof invoiceItems.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/invoices/:invoiceId/items',
      input: z.object({
        serialNo: z.number().min(1),
        description: z.string().min(1),
        hsnCode: z.string().optional(),
        quantity: z.string(),
        unit: z.string().optional(),
        ratePerUnit: z.string().optional(),
        percentage: z.string().optional(),
        amount: z.string(),
        remarks: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof invoiceItems.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/invoice-items/:id',
      input: z.object({
        serialNo: z.number().min(1).optional(),
        description: z.string().min(1).optional(),
        hsnCode: z.string().optional(),
        quantity: z.string().optional(),
        unit: z.string().optional(),
        ratePerUnit: z.string().optional(),
        percentage: z.string().optional(),
        amount: z.string().optional(),
        remarks: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof invoiceItems.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/invoice-items/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/users/:id',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/users',
      input: z.object({
        username: z.string().email("Please enter a valid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Please enter a valid email address").optional(),
        mobile: z.string().min(10, "Valid mobile number is required").optional(),
        role: z.enum(userRoles, { errorMap: () => ({ message: "Role is required" }) }),
        assignedClientIds: z.array(z.number()).optional(),
      }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/users/:id',
      input: z.object({
        username: z.string().email().optional(),
        password: z.string().min(6).optional(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        mobile: z.string().min(10).optional(),
        role: z.enum(userRoles).optional(),
        assignedClientIds: z.array(z.number()).optional(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
        403: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/users/:id',
      responses: {
        204: z.void(),
        403: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
    getClientAssignments: {
      method: 'GET' as const,
      path: '/api/users/:id/clients',
      responses: {
        200: z.array(z.number()),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
