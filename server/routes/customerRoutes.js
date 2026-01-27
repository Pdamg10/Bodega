const express = require("express");
const router = express.Router();
let { customers } = require("../data/store");

// Customers CRUD
router.get("/", (req, res) => {
  res.json(customers);
});

router.post("/", (req, res) => {
  const { firstName, lastName, cedula, phone, debt, specialOrder } = req.body;
  if (!firstName || !lastName) {
    return res
      .status(400)
      .json({ message: "Nombre y apellido son requeridos" });
  }
  const newCustomer = {
    id: customers.length ? Math.max(...customers.map((c) => c.id)) + 1 : 1,
    firstName,
    lastName,
    cedula: cedula || "",
    phone: phone || "",
    debt: {
      enabled: !!debt?.enabled,
      parts: Number(debt?.parts || 0),
      installmentAmount: Number(debt?.installmentAmount || 0),
      frequency: debt?.frequency || null,
    },
    specialOrder: {
      enabled: !!specialOrder?.enabled,
      product: specialOrder?.product || "",
      payInAdvance: !!specialOrder?.payInAdvance,
      advanceAmount: Number(specialOrder?.advanceAmount || 0),
      notes: specialOrder?.notes || "",
    },
    createdAt: new Date().toISOString(),
  };
  customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const idx = customers.findIndex((c) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ message: "Cliente no encontrado" });
  }
  const updates = req.body;
  customers[idx] = {
    ...customers[idx],
    ...updates,
    debt: {
      enabled: !!updates?.debt?.enabled,
      parts: Number(updates?.debt?.parts ?? customers[idx].debt.parts),
      installmentAmount: Number(
        updates?.debt?.installmentAmount ??
          customers[idx].debt.installmentAmount,
      ),
      frequency: updates?.debt?.frequency ?? customers[idx].debt.frequency,
    },
    specialOrder: {
      enabled: !!updates?.specialOrder?.enabled,
      product:
        updates?.specialOrder?.product ?? customers[idx].specialOrder.product,
      payInAdvance: !!(
        updates?.specialOrder?.payInAdvance ??
        customers[idx].specialOrder.payInAdvance
      ),
      advanceAmount: Number(
        updates?.specialOrder?.advanceAmount ??
          customers[idx].specialOrder.advanceAmount,
      ),
      notes: updates?.specialOrder?.notes ?? customers[idx].specialOrder.notes,
    },
  };
  res.json(customers[idx]);
});

router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const exists = customers.some((c) => c.id === id);
  if (!exists) {
    return res.status(404).json({ message: "Cliente no encontrado" });
  }
  // Use splice to mutate the exported array
  const idx = customers.findIndex((c) => c.id === id);
  if (idx !== -1) customers.splice(idx, 1);

  res.json({ message: "Cliente eliminado" });
});

module.exports = router;
