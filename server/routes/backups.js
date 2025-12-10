const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/auth");
const {
  createBackup,
  listBackups,
  restoreBackup,
  getBackupPath,
} = require("../utils/backup");

// List all backups (Admin only)
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const backups = await listBackups();
    res.json(backups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create manual backup (Admin only)
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const backup = await createBackup(req.user.username || "admin");
    res.status(201).json(backup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download backup (Admin only)
router.get("/download/:filename", verifyToken, isAdmin, async (req, res) => {
  try {
    const filePath = getBackupPath(req.params.filename);
    res.download(filePath);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Restore backup (Admin only)
router.post("/restore/:filename", verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await restoreBackup(req.params.filename);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
