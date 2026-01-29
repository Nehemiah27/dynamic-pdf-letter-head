import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { createServer } from "http";
import { fileURLToPath } from "url";

dotenv.config();

// Fix for __dirname in ES modules as it is not defined by default in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = parseInt(process.env.PORT || "5000", 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MongoDB Connection
const MONGO_URI =
  process.env.MONGODB_URL || "mongodb://localhost:27017/revira_erp";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB via Mongoose"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// --- Schemas ---
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  role: String,
  password: { type: String, required: true },
  assignedClientIds: [String],
  avatar: String,
});
const ClientSchema = new mongoose.Schema({
  name: String,
  address: String,
  gstin: String,
  contactPerson: String,
  email: String,
  phone: String,
  createdAt: Date,
});
const ProjectSchema = new mongoose.Schema({
  clientId: String,
  name: String,
  location: String,
  workflow: String,
  status: String,
  createdAt: Date,
  assignedUserId: String,
});
const QuotationSchema = new mongoose.Schema({
  projectId: String,
  version: Number,
  status: String,
  refNo: String,
  date: String,
  enquiryNo: String,
  location: String,
  subject: String,
  salutation: String,
  introText: String,
  introBody: String,
  closingBody: String,
  recipientName: String,
  recipientAddress: String,
  recipientContactPerson: String,
  recipientPhone: String,
  recipientEmail: String,
  priceNotes: String,
  bankDetails: String,
  regardsName: String,
  regardsPhone: String,
  regardsEmail: String,
  sections: Array,
  createdAt: Date,
});
const InvoiceSchema = new mongoose.Schema({
  projectId: String,
  version: Number,
  status: String,
  piNo: String,
  date: String,
  clientName: String,
  registeredAddress: String,
  consigneeAddress: String,
  gstin: String,
  woNo: String,
  dispatchDetails: String,
  items: Array,
  taxType: String,
  bankDetails: Object,
  regardsName: String,
  amountInWords: String,
  createdAt: Date,
});
const BrandingSchema = new mongoose.Schema({
  logo: String,
  logoBackgroundColor: String,
  headerText: String,
  footerText: String,
  brandColor: String,
  registry: Object,
});

// --- Models ---
const UserModel = mongoose.model("User", UserSchema);
const ClientModel = mongoose.model("Client", ClientSchema);
const ProjectModel = mongoose.model("Project", ProjectSchema);
const QuotationModel = mongoose.model("Quotation", QuotationSchema);
const InvoiceModel = mongoose.model("Invoice", InvoiceSchema);
const BrandingModel = mongoose.model("Branding", BrandingSchema);

// --- API Endpoints (/api prefix) ---

// Health Check
app.get("/health", (req, res) =>
  res.json({ status: "Connected", timestamp: new Date() }),
);

// Auth
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (user && user.password === password) {
      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          assignedClientIds: user.assignedClientIds || [],
        },
        token: `revira-jwt-${user._id}`,
      });
    } else {
      if (email === "admin@reviranexgen.com" && password === "admin123") {
        res.json({
          user: {
            id: "master-admin",
            name: "Hareram Sharma",
            email: "admin@reviranexgen.com",
            role: "Administrator",
            assignedClientIds: [],
          },
          token: "revira-jwt-master-token",
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    }
  } catch (err) {
    res.status(500).json({ error: "Database access failure" });
  }
});

// Generic CRUD Generator for /api
const createCrud = (path, model) => {
  app.get(`/api${path}`, async (req, res) => res.json(await model.find()));
  app.post(`/api${path}`, async (req, res) =>
    res.json(await model.create(req.body)),
  );
  app.patch(`/api${path}/:id`, async (req, res) =>
    res.json(
      await model.findByIdAndUpdate(req.params.id, req.body, { new: true }),
    ),
  );
  app.delete(`/api${path}/:id`, async (req, res) =>
    res.json(await model.findByIdAndDelete(req.params.id)),
  );
};

createCrud("/users", UserModel);
createCrud("/clients", ClientModel);
createCrud("/projects", ProjectModel);
createCrud("/quotations", QuotationModel);
createCrud("/invoices", InvoiceModel);

// Branding Management
app.get("/api/branding", async (req, res) => {
  const b = await BrandingModel.findOne();
  res.json(b || {});
});
app.patch("/api/branding", async (req, res) => {
  const b = await BrandingModel.findOneAndUpdate({}, req.body, {
    upsert: true,
    new: true,
  });
  res.json(b);
});

// --- Serving Frontend Statically ---
// In a production environment, Vite build files are usually in 'dist'
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
} else {
  // Development mode fallback - redirecting API to root logic is handled by Vite proxy usually,
  // but for a unified server, we can serve a message or handle integration if needed.
  console.log("Runtime: Development Mode. API uplink established on /api.");
}

// Error Handling
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`REVIRA NEXGEN ERP Unified Server listening on port ${PORT}`);
});
