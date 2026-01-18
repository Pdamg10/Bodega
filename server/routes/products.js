const express = require("express");
const router = express.Router();
const { Product, Category } = require("../models");
const { verifyToken, isAdmin } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");

// Get all products
router.get("/", verifyToken, async (req, res) => {
  try {
    const products = await Product.findAll({ include: Category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Product
router.post("/", verifyToken, async (req, res) => {
  try {
    const product = await Product.create(req.body);

    // Log product creation
    await logAudit({
      user_id: req.user.id,
      username: req.user.username || "unknown",
      action: "CREATE",
      table_name: "Products",
      row_id: product.id,
      after_value: {
        sku: product.sku,
        name: product.name,
        price_usd: product.price_usd,
      },
      ip_address: req.ip,
      description: `Producto creado: ${product.name}`,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update Product
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });

    const before = {
      sku: product.sku,
      name: product.name,
      price_usd: product.price_usd,
      stock: product.stock,
    };
    await product.update(req.body);
    const after = {
      sku: product.sku,
      name: product.name,
      price_usd: product.price_usd,
      stock: product.stock,
    };

    // Log product update
    await logAudit({
      user_id: req.user.id,
      username: req.user.username || "unknown",
      action: "UPDATE",
      table_name: "Products",
      row_id: product.id,
      before_value: before,
      after_value: after,
      ip_address: req.ip,
      description: `Producto actualizado: ${product.name}`,
    });

    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete Product (Admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Producto no encontrado" });

    const productInfo = {
      sku: product.sku,
      name: product.name,
      price_usd: product.price_usd,
    };
    await product.destroy();

    // Log product deletion
    await logAudit({
      user_id: req.user.id,
      username: req.user.username || "admin",
      action: "DELETE",
      table_name: "Products",
      row_id: req.params.id,
      before_value: productInfo,
      ip_address: req.ip,
      description: `Producto eliminado: ${productInfo.name}`,
    });

    res.json({ message: "Producto eliminado" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
