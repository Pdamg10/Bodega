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
      Nombre: p.name,
      Descripción: p.description || "",
      "Precio (USD)": p.price_usd,
      Stock: p.stock,
      Activo: p.active ? "Sí" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return buffer;
  } catch (error) {
    throw new Error(`Error al exportar productos: ${error.message}`);
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
        const nameValue = row.Name ?? row.Nombre;
        if (!row.SKU || !nameValue) {
          results.errors.push({
            line: lineNumber,
            error: "SKU y Nombre son obligatorios",
            data: row,
          });
          continue;
        }

        // Check if product exists (update) or create new
        const [product, created] = await Product.findOrCreate({
          where: { sku: row.SKU },
          defaults: {
            sku: row.SKU,
            name: nameValue,
            description: row.Description ?? row["Descripción"] ?? "",
            price_usd:
              parseFloat(row["Price (USD)"] ?? row["Precio (USD)"]) || 0,
            stock: parseInt(row.Stock) || 0,
            active:
              (row.Active ?? row.Activo)?.toString().toLowerCase() === "yes" ||
              (row.Active ?? row.Activo)?.toString().toLowerCase() === "sí",
          },
        });

        if (!created) {
          // Update existing product
          await product.update({
            name: nameValue,
            description: row.Description ?? row["Descripción"] ?? "",
            price_usd:
              parseFloat(row["Price (USD)"] ?? row["Precio (USD)"]) || 0,
            stock: parseInt(row.Stock) || 0,
            active:
              (row.Active ?? row.Activo)?.toString().toLowerCase() === "yes" ||
              (row.Active ?? row.Activo)?.toString().toLowerCase() === "sí",
          });
        }

        results.success.push({
          line: lineNumber,
          sku: row.SKU,
          action: created ? "creado" : "actualizado",
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
    throw new Error(`Error al importar productos: ${error.message}`);
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
      Nombre: "Producto de ejemplo",
      Descripción: "Descripción del producto",
      "Precio (USD)": 99.99,
      Stock: 100,
      Activo: "Sí",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

module.exports = {
  exportProductsToExcel,
  importProductsFromExcel,
  generateImportTemplate,
};
