const express = require("express");
const router = express.Router();
const multer = require("multer");
const { verifyToken } = require("../middleware/auth");
const {
  exportProductsToExcel,
  importProductsFromExcel,
  generateImportTemplate,
} = require("../utils/excel");

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Export products to Excel
router.get("/export/products", verifyToken, async (req, res) => {
  try {
    const buffer = await exportProductsToExcel();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=products_${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download import template
router.get("/template/products", verifyToken, async (req, res) => {
  try {
    const buffer = generateImportTemplate();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=product_import_template.xlsx"
    );
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Import products from Excel
router.post(
  "/import/products",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se subió ningún archivo" });
      }

      const results = await importProductsFromExcel(req.file.buffer);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
