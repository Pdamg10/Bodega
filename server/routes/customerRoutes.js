const express = require("express");
const router = express.Router();
let { customers, save } = require("../data/store");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || null;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || null;
const hasSupabase = !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const supabase = hasSupabase
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Customers CRUD

// GET /api/customers
router.get("/", async (req, res) => {
  if (!hasSupabase) {
    return res.json(customers);
  }
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Supabase error (customers):", error);
      return res
        .status(500)
        .json({ message: "Error cargando clientes", detail: error.message });
    }
    res.json(data || []);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error interno del servidor", detail: err.message });
  }
});

// POST /api/customers
router.post("/", async (req, res) => {
  const { firstName, lastName, cedula, phone, debt, specialOrder } = req.body;

  if (!firstName || !lastName) {
    return res
      .status(400)
      .json({ message: "Nombre y apellido son requeridos" });
  }

  const newCustomerObj = {
    firstName,
    lastName,
    cedula: cedula || "",
    phone: phone || "",
    debt: debt || { enabled: false },
    specialOrder: specialOrder || { enabled: false },
    createdAt: new Date().toISOString(),
  };

  if (!hasSupabase) {
    const newCustomer = {
      id: customers.length ? Math.max(...customers.map((c) => c.id)) + 1 : 1,
      ...newCustomerObj,
    };
    customers.push(newCustomer);
    save(); // Persist changes
    return res.status(201).json(newCustomer);
  }

  try {
    const { data, error } = await supabase
      .from("customers")
      .insert([newCustomerObj])
      .select()
      .single();

    if (error) {
      return res
        .status(500)
        .json({ message: "Error creando cliente", detail: error.message });
    }
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: "Error interno", detail: err.message });
  }
});

// PUT /api/customers/:id
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;

  if (!hasSupabase) {
    const idx = customers.findIndex((c) => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    customers[idx] = { ...customers[idx], ...updates, id };
    // Deep merge for nested objects if needed, but simplistic replacement is often okay for full updates
    // The frontend sends the full object structure usually.
    save(); // Persist changes
    return res.json(customers[idx]);
  }

  try {
    // Exclude id from updates if present
    const { id: _, ...safeUpdates } = updates;

    const { data, error } = await supabase
      .from("customers")
      .update(safeUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res
        .status(500)
        .json({ message: "Error actualizando cliente", detail: error.message });
    }
    if (!data) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error interno", detail: err.message });
  }
});

// DELETE /api/customers/:id
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  if (!hasSupabase) {
    const idx = customers.findIndex((c) => c.id === id);
    if (idx !== -1) {
      customers.splice(idx, 1);
      save(); // Persist changes
    } else return res.status(404).json({ message: "Cliente no encontrado" });
    return res.json({ message: "Cliente eliminado" });
  }

  try {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) {
      return res
        .status(500)
        .json({ message: "Error eliminando cliente", detail: error.message });
    }
    res.json({ message: "Cliente eliminado" });
  } catch (err) {
    res.status(500).json({ message: "Error interno", detail: err.message });
  }
});

module.exports = router;
