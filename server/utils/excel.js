const XLSX = require("xlsx");
const { Product } = require("../models");

/**
 * Export products to Excel
 * @returns {Buffer} Excel file buffer
 */
async function exportProductsToExcel() {
  try {
    const products = await Product.findAll();

    const data = products.map((p) => ({
      SKU: p.sku,
      Name: p.name,
      Description: p.description || "",
      "Price (USD)": p.price_usd,
      Stock: p.stock,
      Active: p.active ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return buffer;
  } catch (error) {
    throw new Error(`Failed to export products: ${error.message}`);
  }
}

/**
 * Import products from Excel
 * @param {Buffer} fileBuffer - Excel file buffer
 * @returns {Promise<object>} Import results
 */
async function importProductsFromExcel(fileBuffer) {
  try {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const results = {
      success: [],
      errors: [],
      total: data.length,
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const lineNumber = i + 2; // Excel rows start at 1, + 1 for header

      try {
        // Validation
        if (!row.SKU || !row.Name) {
          results.errors.push({
            line: lineNumber,
            error: "SKU and Name are required",
            data: row,
          });
          continue;
        }

        // Check if product exists (update) or create new
        const [product, created] = await Product.findOrCreate({
          where: { sku: row.SKU },
          defaults: {
            sku: row.SKU,
            name: row.Name,
            description: row.Description || "",
            price_usd: parseFloat(row["Price (USD)"]) || 0,
            stock: parseInt(row.Stock) || 0,
            active: row.Active === "Yes",
          },
        });

        if (!created) {
          // Update existing product
          await product.update({
            name: row.Name,
            description: row.Description || "",
            price_usd: parseFloat(row["Price (USD)"]) || 0,
            stock: parseInt(row.Stock) || 0,
            active: row.Active === "Yes",
          });
        }

        results.success.push({
          line: lineNumber,
          sku: row.SKU,
          action: created ? "created" : "updated",
        });
      } catch (error) {
        results.errors.push({
          line: lineNumber,
          error: error.message,
          data: row,
        });
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to import products: ${error.message}`);
  }
}

/**
 * Generate an Excel template for product import
 * @returns {Buffer} Excel template buffer
 */
function generateImportTemplate() {
  const template = [
    {
      SKU: "PROD001",
      Name: "Sample Product",
      Description: "Product description",
      "Price (USD)": 99.99,
      Stock: 100,
      Active: "Yes",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

module.exports = {
  exportProductsToExcel,
  importProductsFromExcel,
  generateImportTemplate,
};
