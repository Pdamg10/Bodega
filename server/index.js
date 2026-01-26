const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const SECRET_KEY = 'bodega_secret_key'; // In production, use env var

app.use(cors());
app.use(bodyParser.json());

// In-memory data store
let users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123', // In production, hash this!
    role: 'admin',
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@bodega.com',
    cedula: '0000000000',
    phone: '555-5555',
    paymentMethod: 'Efectivo',
    paymentAmount: 0,
    startDate: new Date().toISOString(),
    cutoffDate: '',
    isActive: true
  }
];

// In-memory inventory
let products = [
  { id: 1, name: 'Arroz 1kg', category: 'Granos', stock: 45, minStock: 20, price: 1.20, expirationDate: '2025-12-31' },
  { id: 2, name: 'Aceite 1L', category: 'Aceites', stock: 8, minStock: 10, price: 2.50, expirationDate: '2026-06-30' },
  { id: 3, name: 'Leche 1L', category: 'Lácteos', stock: 5, minStock: 15, price: 0.90, expirationDate: '2024-02-15' },
  { id: 4, name: 'Atún en lata', category: 'Conservas', stock: 100, minStock: 20, price: 1.50, expirationDate: '2027-01-01' },
  { id: 5, name: 'Yogurt Fresa', category: 'Lácteos', stock: 12, minStock: 10, price: 0.80, expirationDate: '2024-02-01' },
];

let movements = [
  { id: 1, type: 'IN', productId: 1, productName: 'Arroz 1kg', quantity: 50, date: new Date(Date.now() - 86400000).toISOString(), userId: 1 },
  { id: 2, type: 'OUT', productId: 2, productName: 'Aceite 1L', quantity: 2, date: new Date().toISOString(), userId: 2 },
];

// Routes
app.get('/api', (req, res) => {
  res.send('Bodega API is running');
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    // Don't send password back
    const { password, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      access_token: token
    });
  } else {
    res.status(401).json({ message: 'Credenciales inválidas' });
  }
});

// Get Users
app.get('/api/users', (req, res) => {
  // In a real app, verify token here
  const safeUsers = users.map(u => {
    const { password, ...rest } = u;
    return rest;
  });
  res.json(safeUsers);
});

// Get Products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get Movements
app.get('/api/movements', (req, res) => {
  res.json(movements.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

// Create Movement (Sale or Restock)
app.post('/api/movements', (req, res) => {
  const { items, type, userId } = req.body; // items: [{ productId, quantity }]
  
  const newMovements = [];
  const errors = [];

  items.forEach(item => {
    const productIndex = products.findIndex(p => p.id === item.productId);
    if (productIndex === -1) {
      errors.push(`Product ID ${item.productId} not found`);
      return;
    }

    const product = products[productIndex];

    if (type === 'OUT' && product.stock < item.quantity) {
      errors.push(`Insufficient stock for ${product.name}`);
      return;
    }

    // Update stock
    if (type === 'IN') {
      products[productIndex].stock += item.quantity;
    } else {
      products[productIndex].stock -= item.quantity;
    }

    // Create movement record
    const movement = {
      id: movements.length + 1 + newMovements.length,
      type,
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      price: product.price,
      total: product.price * item.quantity,
      date: new Date().toISOString(),
      userId: userId || 1 // Default to admin if not provided
    };
    
    newMovements.push(movement);
  });

  if (newMovements.length > 0) {
    movements.push(...newMovements);
    res.status(201).json({ 
      message: 'Movements registered successfully', 
      movements: newMovements,
      errors: errors.length > 0 ? errors : undefined
    });
  } else {
    res.status(400).json({ message: 'Failed to register movements', errors });
  }
});

// Update Movement
app.put('/api/movements/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { quantity, type } = req.body;
  const movementIndex = movements.findIndex(m => m.id === id);

  if (movementIndex === -1) {
    return res.status(404).json({ message: 'Movement not found' });
  }

  const movement = movements[movementIndex];
  const productIndex = products.findIndex(p => p.id === movement.productId);

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product associated with movement not found' });
  }

  // Revert old stock change
  if (movement.type === 'IN') {
    products[productIndex].stock -= movement.quantity;
  } else {
    products[productIndex].stock += movement.quantity;
  }

  // Apply new stock change (checking availability if OUT)
  if (type === 'OUT' && products[productIndex].stock < quantity) {
    // Revert revert (rollback)
    if (movement.type === 'IN') {
      products[productIndex].stock += movement.quantity;
    } else {
      products[productIndex].stock -= movement.quantity;
    }
    return res.status(400).json({ message: `Insufficient stock to update movement for ${products[productIndex].name}` });
  }

  if (type === 'IN') {
    products[productIndex].stock += quantity;
  } else {
    products[productIndex].stock -= quantity;
  }

  // Update movement
  movements[movementIndex] = {
    ...movement,
    quantity,
    type,
    total: products[productIndex].price * quantity,
    date: new Date().toISOString() // Update date to edit time? Or keep original? Let's update.
  };

  res.json(movements[movementIndex]);
});

// Delete Movement
app.delete('/api/movements/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const movementIndex = movements.findIndex(m => m.id === id);

  if (movementIndex === -1) {
    return res.status(404).json({ message: 'Movement not found' });
  }

  const movement = movements[movementIndex];
  const productIndex = products.findIndex(p => p.id === movement.productId);

  if (productIndex !== -1) {
    // Revert stock
    if (movement.type === 'IN') {
      products[productIndex].stock -= movement.quantity;
    } else {
      products[productIndex].stock += movement.quantity;
    }
  }

  movements = movements.filter(m => m.id !== id);
  res.json({ message: 'Movement deleted and stock reverted' });
});

// Create User
app.post('/api/users', (req, res) => {
  const newUser = {
    id: users.length + 1,
    ...req.body,
    isActive: true,
    startDate: new Date().toISOString()
  };
  users.push(newUser);
  const { password, ...rest } = newUser;
  res.status(201).json(rest);
});

// Update User
app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...req.body };
    const { password, ...rest } = users[userIndex];
    res.json(rest);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Delete User
app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  users = users.filter(u => u.id !== id);
  res.json({ message: 'User deleted successfully' });
});

// Backup
app.get('/api/backup', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=backup.json');
  res.json(users);
});

// Restore
app.post('/api/restore', (req, res) => {
  const newUsers = req.body;
  if (Array.isArray(newUsers)) {
    users = newUsers;
    res.json({ message: 'Backup restored successfully' });
  } else {
    res.status(400).json({ message: 'Invalid backup format' });
  }
});

// Update Profile (for Admin)
app.put('/api/auth/profile', (req, res) => {
  // In a real app, get user ID from token
  const { id, ...updates } = req.body;
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex !== -1) {
    // Check if updating password
    if (updates.newPassword) {
       users[userIndex].password = updates.newPassword;
       delete updates.newPassword;
    }
    
    users[userIndex] = { ...users[userIndex], ...updates };
    const { password, ...rest } = users[userIndex];
    res.json(rest);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
