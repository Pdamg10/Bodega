const express = require("express");
const router = express.Router();
let { users, save } = require("../data/store");
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
    // Exclude passwords from memory store
    const safeUsers = users.map(({ password, ...u }) => u);
    return res.json(safeUsers);
  }
  try {
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, username, role, firstName, lastName, email, cedula, phone, isActive, startDate",
      ) // Explicitly select safe fields
      .order("id", { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", detail: err.message });
  }
});

// Create User
router.post("/", async (req, res) => {
  const {
    username,
    password,
    role,
    firstName,
    lastName,
    email,
    cedula,
    phone,
  } = req.body;

  if (!username || !password || !firstName || !lastName || !email) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  // Check if user already exists
  if (users.some((u) => u.username === username || u.email === email)) {
    return res.status(400).json({ message: "Usuario o correo ya existe" });
  }

  const newUserObj = {
    username,
    password, // Should hash!
    role: role || "user",
    firstName,
    lastName,
    email,
    cedula: cedula || "",
    phone: phone || "",
    isActive: true,
    startDate: new Date().toISOString(),
    paymentMethod: "Efectivo",
    paymentAmount: 0,
    cutoffDate: "",
  };

  if (!hasSupabase) {
    const newUser = {
      id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
      ...newUserObj,
    };
    users.push(newUser);
    save(); // Persist changes
    const { password: _, ...safeUser } = newUser;
    return res.status(201).json(safeUser);
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    // Note: Supabase Auth is different from 'users' table usually, but sticking to existing pattern
    // If using 'users' table:
    const { data: userData, error: dbError } = await supabase
      .from("users")
      .insert([newUserObj])
      .select()
      .single();

    if (dbError) throw dbError;
    res.status(201).json(userData);
  } catch (err) {
    // Fallback if supabase fails or just save to memory/file if config implies mixed mode (unlikely)
    // For now, assume if hasSupabase, we rely on it.
    res
      .status(500)
      .json({ message: "Error creando usuario", detail: err.message });
  }
});

// Create User
router.post("/", async (req, res) => {
  const {
    username,
    password,
    role,
    firstName,
    lastName,
    email,
    cedula,
    phone,
  } = req.body;

  if (!username || !password || !firstName || !lastName || !email) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  // Check if user already exists
  if (users.some((u) => u.username === username || u.email === email)) {
    return res.status(400).json({ message: "Usuario o correo ya existe" });
  }

  const newUserObj = {
    username,
    password, // Should hash!
    role: role || "user",
    firstName,
    lastName,
    email,
    cedula: cedula || "",
    phone: phone || "",
    isActive: true,
    startDate: new Date().toISOString(),
    paymentMethod: "Efectivo",
    paymentAmount: 0,
    cutoffDate: "",
  };

  if (!hasSupabase) {
    const newUser = {
      id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
      ...newUserObj,
    };
    users.push(newUser);
    save(); // Persist changes
    const { password: _, ...safeUser } = newUser;
    return res.status(201).json(safeUser);
  }

  try {
    const { data: userData, error: dbError } = await supabase
      .from("users")
      .insert([newUserObj])
      .select()
      .single();

    if (dbError) throw dbError;
    res.status(201).json(userData);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creando usuario", detail: err.message });
  }
});

// Update User
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const {
    username,
    firstName,
    lastName,
    email,
    cedula,
    phone,
    isActive,
    password,
    role,
  } = req.body;

  // Validate generic fields if necessary

  const updates = {};
  if (username !== undefined) updates.username = username;
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (email !== undefined) updates.email = email;
  if (cedula !== undefined) updates.cedula = cedula;
  if (phone !== undefined) updates.phone = phone;
  if (isActive !== undefined) updates.isActive = isActive;
  // Role update should be protected (e.g. only admin can update role),
  // but for now we follow the existing logic but explicit assignment.
  if (role !== undefined) updates.role = role;
  if (password) updates.password = password; // Should hash this if not handled elsewhere

  if (!hasSupabase) {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return res.status(404).json({ message: "User not found" });

    // Merge updates
    users[idx] = { ...users[idx], ...updates };
    save(); // Persist changes
    const { password: _, ...safeUser } = users[idx];
    return res.json(safeUser);
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select(
        "id, username, role, firstName, lastName, email, cedula, phone, isActive, startDate",
      )
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

// Delete User
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  if (!hasSupabase) {
    const idx = users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      users.splice(idx, 1);
      save(); // Persist changes
    } else {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    return res.json({ message: "Usuario eliminado" });
  }

  try {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;
    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error eliminando usuario", detail: err.message });
  }
});

module.exports = router;
