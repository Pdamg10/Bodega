const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models");
const { verifyToken, isAdmin } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      // Log failed login attempt
      await logAudit({
        username,
        action: "LOGIN_FAILED",
        ip_address: req.ip,
        description: "Invalid password attempt",
      });
      return res.status(401).json({ message: "Invalid password" });
    }

    if (user.status !== "active")
      return res.status(403).json({ message: "User is inactive" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret_key",
      {
        expiresIn: "24h",
      }
    );

    // Log successful login
    await logAudit({
      user_id: user.id,
      username: user.username,
      action: "LOGIN",
      ip_address: req.ip,
      description: "User logged in successfully",
    });

    res.json({ token, role: user.role, username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create User (Admin only)
router.post("/register", verifyToken, isAdmin, async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password_hash: hashedPassword,
      role: role || "user",
    });

    // Log user creation
    await logAudit({
      user_id: req.user.id,
      username: req.user.username || "admin",
      action: "CREATE",
      table_name: "Users",
      row_id: newUser.id,
      after_value: { username: newUser.username, role: newUser.role },
      ip_address: req.ip,
      description: `Created user ${newUser.username} with role ${newUser.role}`,
    });

    res.status(201).json({ message: "User created", user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
