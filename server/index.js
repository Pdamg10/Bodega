const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || null;
if (ALLOWED_ORIGIN) {
  app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
} else {
  app.use(cors());
}
app.use(express.json()); // Replaced bodyParser.json()

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/movements", require("./routes/movementRoutes"));
app.use("/api/backups", require("./routes/backupRoutes"));

// Misc API routes
let previewIsSelect = false;

app.get("/api", (req, res) => {
  res.send("Bodega API is running");
});

app.get("/api/getThemeColors", (req, res) => {
  res.json({
    primary: "#2563eb",
    secondary: "#10b981",
    backgroundLight: "#ffffff",
    backgroundDark: "#0f172a",
    textLight: "#0f172a",
    textDark: "#ffffff",
    borderLight: "#e2e8f0",
    borderDark: "#334155",
  });
});

app.get("/api/getLanguageText", (req, res) => {
  const lang = (req.query.lang || "es").toLowerCase();
  const dict = {
    es: { ok: "OK", cancel: "Cancelar", theme: "Tema", language: "Idioma" },
    en: { ok: "OK", cancel: "Cancel", theme: "Theme", language: "Language" },
  };
  res.json(dict[lang] || dict.es);
});

app.get("/api/getWorkspacePath", (req, res) => {
  res.json({ path: process.cwd() });
});

app.post("/api/setIsSelect", (req, res) => {
  const { isSelect } = req.body || {};
  previewIsSelect = !!isSelect;
  res.json({ isSelect: previewIsSelect });
});

// Sales Batch specific route (needs access to movements and products)
// This is a bit complex as it was inline.
// I'll extract it to movementRoutes as well, but map it correctly there
// OR keep it here if it doesn't fit the resource model precisely.
// Given it's "sales", let's move it to movementRoutes.js under /sales which I handled in previous step (hopefully).
// checking movementRoutes.js content...
// I missed /api/sales/batch and /api/sales/single in movementRoutes!
// I need to add them. They were under /api/sales in the original but I didn't see a separate sales route group.
// Wait, the original code had:
// app.post('/api/sales/single', ...)
// app.post('/api/sales/batch', ...)
// My movementRoutes.js only implemented CRUD for /api/movements.
// I should add a specific salesRoutes.js or append to movementRoutes.js.
// Let's create a NEW `salesRoutes.js` for clarity as they are conceptually 'Sales'.

app.use("/api/sales", require("./routes/salesRoutes"));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
