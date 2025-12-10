const express = require('express');
const router = express.Router();
const { Movement, Product, sequelize } = require('../models');
const { verifyToken } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get Sales Report (Movements OUT)
router.get('/sales', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { type: 'OUT' };

    if (startDate && endDate) {
      where.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const sales = await Movement.findAll({
      where,
      include: [{ model: Product, attributes: ['name', 'price_usd'] }],
      order: [['date', 'DESC']],
    });

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Dashboard Stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const totalProducts = await Product.count();
    const lowStock = await Product.count({ where: { stock: { [Op.lt]: 10 } } });
    
    // Calculate total sales (approximate, assuming price at time of sale is current price - ideally should store price in movement)
    // For MVP, we'll just count number of sales transactions
    const totalSalesCount = await Movement.count({ where: { type: 'OUT' } });

    res.json({
      totalProducts,
      lowStock,
      totalSalesCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
