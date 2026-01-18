const express = require("express");
const router = express.Router();
const { Movement, Product, User } = require("../models");
const { verifyToken } = require("../middleware/auth");
const { sequelize } = require("../models");
const { logAudit } = require("../utils/audit");

// Get all movements
router.get("/", verifyToken, async (req, res) => {
  try {
    const movements = await Movement.findAll({
      include: [
        { model: Product, attributes: ["name", "sku"] },
        { model: User, attributes: ["username"] },
      ],
      order: [["date", "DESC"]],
    });
    res.json(movements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Movement (IN/OUT/ADJUSTMENT)
router.post("/", verifyToken, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { product_id, type, quantity, reference_doc, note } = req.body;
    const user_id = req.user.id;

    const product = await Product.findByPk(product_id, { transaction: t });
    if (!product) {
      await t.rollback();
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const oldStock = product.stock;

    // Update stock
    if (type === "IN") {
      product.stock += quantity;
    } else if (type === "OUT") {
      if (product.stock < quantity) {
        await t.rollback();
        return res.status(400).json({ message: "Stock insuficiente" });
      }
      product.stock -= quantity;
    } else if (type === "ADJUSTMENT") {
      product.stock += quantity;
    }

    await product.save({ transaction: t });

    const movement = await Movement.create(
      {
        product_id,
        type,
        quantity,
        user_id,
        reference_doc,
        note,
      },
      { transaction: t }
    );

    // Log movement creation
    await logAudit({
      user_id: req.user.id,
      username: req.user.username || "unknown",
      action: "CREATE",
      table_name: "Movements",
      row_id: movement.id,
      after_value: {
        type,
        quantity,
        product: product.name,
        stock_before: oldStock,
        stock_after: product.stock,
      },
      ip_address: req.ip,
      description: `Movimiento ${type === "IN" ? "de entrada" : type === "OUT" ? "de salida" : "de ajuste"}: ${quantity} unidades de ${product.name}`,
    });

    await t.commit();
    res.status(201).json(movement);
  } catch (err) {
    await t.rollback();
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
