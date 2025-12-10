const express = require("express");
const router = express.Router();
const { AuditLog, sequelize } = require("../models");
const { verifyToken, isAdmin } = require("../middleware/auth");
const { Op } = require("sequelize");

// Get all audit logs (Admin only)
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { action, table_name, username, limit = 100 } = req.query;

    const where = {};
    if (action) where.action = action;
    if (table_name) where.table_name = table_name;
    if (username) where.username = { [Op.like]: `%${username}%` };

    const logs = await AuditLog.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get audit logs for a specific row (Admin only)
router.get("/row/:table/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { table, id } = req.params;

    const logs = await AuditLog.findAll({
      where: {
        table_name: table,
        row_id: id,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get audit log statistics (Admin only)
router.get("/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const totalLogs = await AuditLog.count();

    const actionCounts = await AuditLog.findAll({
      attributes: [
        "action",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["action"],
    });

    const recentActivity = await AuditLog.findAll({
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    res.json({
      totalLogs,
      actionCounts,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
