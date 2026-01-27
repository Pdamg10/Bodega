const express = require("express");
const router = express.Router();
let { movements, products } = require("../data/store");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || null;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || null;
const hasSupabase = !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const supabase = hasSupabase
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Single Sale
router.post("/single", async (req, res) => {
  const { productId, quantity, userId } = req.body;
  const q = parseInt(quantity);
  const pid = parseInt(productId);

  if (!pid || !q || q <= 0) {
    return res.status(400).json({ message: "Parámetros inválidos" });
  }

  if (!hasSupabase) {
    const product = products.find((p) => p.id === pid);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    if (product.stock < q) {
      return res
        .status(400)
        .json({ message: "Stock insuficiente", available: product.stock });
    }
    product.stock -= q;
    const newMovement = {
      id: movements.length ? Math.max(...movements.map((m) => m.id)) + 1 : 1,
      type: "OUT",
      productId: product.id,
      productName: product.name,
      quantity: q,
      date: new Date().toISOString(),
      userId: userId || null,
    };
    movements.push(newMovement);
    return res.status(201).json({ movement: newMovement, product });
  }
  try {
    const { data: product, error: pErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", pid)
      .single();
    if (pErr) {
      return res
        .status(404)
        .json({ message: "Producto no encontrado", detail: pErr.message });
    }
    if (!product || product.stock < q) {
      return res
        .status(400)
        .json({
          message: "Stock insuficiente",
          available: product?.stock ?? 0,
        });
    }
    const { data: updatedProduct, error: uErr } = await supabase
      .from("products")
      .update({ stock: product.stock - q })
      .eq("id", pid)
      .select()
      .single();
    if (uErr) {
      return res
        .status(500)
        .json({ message: "Error actualizando stock", detail: uErr.message });
    }
    const movementRow = {
      type: "OUT",
      productId: pid,
      productName: product.name,
      quantity: q,
      date: new Date().toISOString(),
      userId: userId || null,
    };
    const { data: mv, error: mErr } = await supabase
      .from("movements")
      .insert([movementRow])
      .select()
      .single();
    if (mErr) {
      return res
        .status(500)
        .json({
          message: "Error registrando movimiento",
          detail: mErr.message,
        });
    }
    res.status(201).json({ movement: mv, product: updatedProduct });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Error en servidor (venta individual)",
        detail: err.message,
      });
  }
});

// Batch Sales
router.post("/batch", async (req, res) => {
  const { items, userId } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Lista de items inválida" });
  }

  if (!hasSupabase) {
    for (const item of items) {
      const pid = parseInt(item.productId);
      const q = parseInt(item.quantity);
      const product = products.find((p) => p.id === pid);
      if (!pid || !q || q <= 0) {
        return res.status(400).json({ message: "Item inválido", item });
      }
      if (!product) {
        return res
          .status(404)
          .json({ message: "Producto no encontrado", productId: pid });
      }
      if (product.stock < q) {
        return res
          .status(400)
          .json({
            message: "Stock insuficiente",
            productId: pid,
            available: product.stock,
          });
      }
    }
    const created = [];
    for (const item of items) {
      const pid = parseInt(item.productId);
      const q = parseInt(item.quantity);
      const product = products.find((p) => p.id === pid);
      product.stock -= q;
      const mv = {
        id: movements.length
          ? Math.max(...movements.map((m) => m.id)) + 1 + created.length
          : 1 + created.length,
        type: "OUT",
        productId: product.id,
        productName: product.name,
        quantity: q,
        date: new Date().toISOString(),
        userId: userId || null,
      };
      created.push(mv);
    }
    movements.push(...created);
    return res.status(201).json({ movements: created });
  }
  try {
    // Validación previa
    for (const item of items) {
      const pid = parseInt(item.productId);
      const q = parseInt(item.quantity);
      const { data: product, error } = await supabase
        .from("products")
        .select("id, stock")
        .eq("id", pid)
        .single();
      if (error || !product) {
        return res
          .status(404)
          .json({ message: "Producto no encontrado", productId: pid });
      }
      if (product.stock < q) {
        return res
          .status(400)
          .json({
            message: "Stock insuficiente",
            productId: pid,
            available: product.stock,
          });
      }
    }
    const created = [];
    for (const item of items) {
      const pid = parseInt(item.productId);
      const q = parseInt(item.quantity);
      const { data: productRow } = await supabase
        .from("products")
        .select("name, stock")
        .eq("id", pid)
        .single();
      await supabase
        .from("products")
        .update({ stock: (productRow?.stock ?? 0) - q })
        .eq("id", pid);
      const { data: mv } = await supabase
        .from("movements")
        .insert([
          {
            type: "OUT",
            productId: pid,
            productName: productRow?.name || "",
            quantity: q,
            date: new Date().toISOString(),
            userId: userId || null,
          },
        ])
        .select()
        .single();
      created.push(mv);
    }
    res.status(201).json({ movements: created });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Error en servidor (ventas múltiples)",
        detail: err.message,
      });
  }
});

module.exports = router;
