const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { users } = require("../data/store");

const SECRET_KEY = process.env.JWT_SECRET || "bodega_secret_key";

// Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (user) {
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: "24h" },
    );
    // Don't send password back
    const { password, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      access_token: token,
    });
  } else {
    res.status(401).json({ message: "Credenciales inválidas" });
  }
});

module.exports = router;
