const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (if needed later, e.g. uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Basic Route
// Import Models
const { sequelize } = require("./models");
const { startBackupScheduler } = require("./utils/scheduler");

// Sync Database
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synced");

    // Start automatic backups
    startBackupScheduler();
  })
  .catch((err) => {
    console.error("Failed to sync database:", err);
  });

// Basic Route
app.get("/", (req, res) => {
  res.json({ message: "Bodega API is running" });
});

// Import Routes (to be added)
// const authRoutes = require('./routes/auth');
// app.use('/api/auth', authRoutes);

// Import Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const movementRoutes = require("./routes/movements");
const paymentRoutes = require("./routes/payments");
const reportRoutes = require("./routes/reports");
const backupRoutes = require("./routes/backups");
const excelRoutes = require("./routes/excel");
const auditRoutes = require("./routes/audit");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/movements", movementRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/backups", backupRoutes);
app.use("/api/excel", excelRoutes);
app.use("/api/audit", auditRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
