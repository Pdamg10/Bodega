const express = require("express");
const router = express.Router();
let { users } = require("../data/store");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || null;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || null;
const hasSupabase = !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const supabase = hasSupabase
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Get All Users
router.get("/", async (req, res) => {
  if (!hasSupabase) {
    return res.json(users);
  }
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("id", { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", detail: err.message });
  }
});

// Update User (including password)
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;

  if (!hasSupabase) {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return res.status(404).json({ message: "User not found" });

    // Merge updates
    users[idx] = { ...users[idx], ...updates };
    return res.json(users[idx]);
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating user", detail: err.message });
  }
});

// Verify Email for Password Reset
router.post("/verify-email", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  if (!hasSupabase) {
    const user = users.find((u) => u.email === email);
    if (user) {
      return res.json({
        success: true,
        userId: user.id,
        message: "Email verificado",
      });
    }
    return res.status(404).json({ message: "Correo no encontrado" });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "Correo no encontrado" });
    }

    res.json({ success: true, userId: data.id, message: "Email verificado" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error verifying email", detail: err.message });
  }
});

module.exports = router;
