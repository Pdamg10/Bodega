const express = require('express');
const router = express.Router();
const { Payment, User } = require('../models');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get all payments (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{ model: User, attributes: ['username'] }],
      order: [['due_date', 'DESC']],
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my payments (User)
router.get('/my-payments', verifyToken, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { user_id: req.user.id },
      order: [['due_date', 'DESC']],
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Payment Record (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update Payment Status (Admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Pago no encontrado' });
    await payment.update(req.body);
    res.json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
