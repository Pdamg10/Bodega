const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = process.env.JWT_SECRET || 'bodega_secret_key';
let previewIsSelect = false;

// Supabase client (optional)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;
const hasSupabase = !!supabase;

const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || null;
if (ALLOWED_ORIGIN) {
  app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
} else {
  app.use(cors());
}
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
  { id: 1, name: 'Arroz 1kg', category: 'Granos', stock: 45, minStock: 20, price: 1.20, cost: 0.80, expirationDate: '2025-12-31' },
  { id: 2, name: 'Aceite 1L', category: 'Aceites', stock: 8, minStock: 10, price: 2.50, cost: 1.60, expirationDate: '2026-06-30' },
  { id: 3, name: 'Leche 1L', category: 'Lácteos', stock: 5, minStock: 15, price: 0.90, cost: 0.60, expirationDate: '2024-02-15' },
  { id: 4, name: 'Atún en lata', category: 'Conservas', stock: 100, minStock: 20, price: 1.50, cost: 1.00, expirationDate: '2027-01-01' },
  { id: 5, name: 'Yogurt Fresa', category: 'Lácteos', stock: 12, minStock: 10, price: 0.80, cost: 0.55, expirationDate: '2024-02-01' },
];

let movements = [
  { id: 1, type: 'IN', productId: 1, productName: 'Arroz 1kg', quantity: 50, date: new Date(Date.now() - 86400000).toISOString(), userId: 1 },
  { id: 2, type: 'OUT', productId: 2, productName: 'Aceite 1L', quantity: 2, date: new Date().toISOString(), userId: 2 },
];

// In-memory customers
let customers = [
  {
    id: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    cedula: '12345678',
    phone: '555-1111',
    debt: { enabled: false, parts: 0, installmentAmount: 0, frequency: null },
    specialOrder: { enabled: false, product: '', payInAdvance: false, advanceAmount: 0, notes: '' },
    createdAt: new Date().toISOString()
  }
];

// In-memory backups and logs
let backups = [];
let backupLogs = [];
let backupSchedule = { enabled: false, frequency: null, nextRun: null };
const backupStorageCapacityBytes = 10 * 1024 * 1024; // 10MB virtual capacity

// Routes
app.get('/api', (req, res) => {
  res.send('Bodega API is running');
});

app.get('/api/getThemeColors', (req, res) => {
  res.json({
    primary: '#2563eb',
    secondary: '#10b981',
    backgroundLight: '#ffffff',
    backgroundDark: '#0f172a',
    textLight: '#0f172a',
    textDark: '#ffffff',
    borderLight: '#e2e8f0',
    borderDark: '#334155'
  });
});

app.get('/api/getLanguageText', (req, res) => {
  const lang = (req.query.lang || 'es').toLowerCase();
  const dict = {
    es: { ok: 'OK', cancel: 'Cancelar', theme: 'Tema', language: 'Idioma' },
    en: { ok: 'OK', cancel: 'Cancel', theme: 'Theme', language: 'Language' }
  };
  res.json(dict[lang] || dict.es);
});

app.get('/api/getWorkspacePath', (req, res) => {
  res.json({ path: process.cwd() });
});

app.post('/api/setIsSelect', (req, res) => {
  const { isSelect } = req.body || {};
  previewIsSelect = !!isSelect;
  res.json({ isSelect: previewIsSelect });
});

// Backup API
app.post('/api/backups/create', (req, res) => {
  const snapshot = {
    users,
    products,
    movements,
    customers
  };
  const payload = JSON.stringify(snapshot);
  const size = new Blob([payload]).size || Buffer.byteLength(payload, 'utf8');
  const id = backups.length ? Math.max(...backups.map(b => b.id)) + 1 : 1;
  const record = {
    id,
    name: `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
    createdAt: new Date().toISOString(),
    size,
    data: snapshot
  };
  backups.push(record);
  backupLogs.push({ ts: new Date().toISOString(), type: 'CREATE', message: `Respaldo ${record.name} creado`, backupId: id });
  res.status(201).json(record);
});

app.get('/api/backups', (req, res) => {
  res.json(backups.map(b => ({ id: b.id, name: b.name, createdAt: b.createdAt, size: b.size })));
});

app.get('/api/backups/download/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const b = backups.find(x => x.id === id);
  if (!b) return res.status(404).json({ message: 'Respaldo no encontrado' });
  const payload = JSON.stringify(b.data, null, 2);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=${b.name}`);
  res.send(payload);
});

app.post('/api/backups/restore', (req, res) => {
  const { backupId } = req.body || {};
  const b = backups.find(x => x.id === parseInt(backupId));
  if (!b) return res.status(404).json({ message: 'Respaldo no encontrado' });
  users = Array.isArray(b.data.users) ? b.data.users : users;
  products = Array.isArray(b.data.products) ? b.data.products : products;
  movements = Array.isArray(b.data.movements) ? b.data.movements : movements;
  customers = Array.isArray(b.data.customers) ? b.data.customers : customers;
  backupLogs.push({ ts: new Date().toISOString(), type: 'RESTORE', message: `Sistema restaurado desde ${b.name}`, backupId: b.id });
  res.json({ message: 'Sistema restaurado', backupId: b.id });
});

app.delete('/api/backups/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const exists = backups.some(b => b.id === id);
  if (!exists) return res.status(404).json({ message: 'Respaldo no encontrado' });
  const b = backups.find(x => x.id === id);
  backups = backups.filter(b => b.id !== id);
  backupLogs.push({ ts: new Date().toISOString(), type: 'DELETE', message: `Respaldo ${b?.name || id} eliminado`, backupId: id });
  res.json({ message: 'Respaldo eliminado' });
});

app.get('/api/backups/storage', (req, res) => {
  const used = backups.reduce((acc, b) => acc + (b.size || 0), 0);
  res.json({ usedBytes: used, capacityBytes: backupStorageCapacityBytes });
});

app.get('/api/backups/logs', (req, res) => {
  res.json(backupLogs.slice().reverse());
});

app.post('/api/backups/schedule', (req, res) => {
  const { enabled, frequency } = req.body || {};
  const valid = ['daily', 'weekly', 'monthly'];
  if (enabled && !valid.includes(frequency)) {
    return res.status(400).json({ message: 'Frecuencia inválida' });
  }
  backupSchedule.enabled = !!enabled;
  backupSchedule.frequency = enabled ? frequency : null;
  const now = new Date();
  const next = new Date(now);
  if (enabled) {
    if (frequency === 'daily') next.setDate(now.getDate() + 1);
    if (frequency === 'weekly') next.setDate(now.getDate() + 7);
    if (frequency === 'monthly') next.setMonth(now.getMonth() + 1);
    backupSchedule.nextRun = next.toISOString();
  } else {
    backupSchedule.nextRun = null;
  }
  backupLogs.push({ ts: new Date().toISOString(), type: 'SCHEDULE', message: `Programación: ${enabled ? frequency : 'desactivada'}` });
  res.json(backupSchedule);
});

app.get('/api/backups/schedule', (req, res) => {
  res.json(backupSchedule);
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
app.get('/api/products', async (req, res) => {
  if (!hasSupabase) {
    return res.json(products);
  }
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });
    if (error) {
      return res.status(500).json({ message: 'Error en Supabase (products)', detail: error.message });
    }
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: 'Error consultando productos', detail: err.message });
  }
});

// Customers CRUD
app.get('/api/customers', (req, res) => {
  res.json(customers);
});

app.post('/api/customers', (req, res) => {
  const { firstName, lastName, cedula, phone, debt, specialOrder } = req.body;
  if (!firstName || !lastName) {
    return res.status(400).json({ message: 'Nombre y apellido son requeridos' });
  }
  const newCustomer = {
    id: customers.length ? Math.max(...customers.map(c => c.id)) + 1 : 1,
    firstName,
    lastName,
    cedula: cedula || '',
    phone: phone || '',
    debt: {
      enabled: !!debt?.enabled,
      parts: Number(debt?.parts || 0),
      installmentAmount: Number(debt?.installmentAmount || 0),
      frequency: debt?.frequency || null
    },
    specialOrder: {
      enabled: !!specialOrder?.enabled,
      product: specialOrder?.product || '',
      payInAdvance: !!specialOrder?.payInAdvance,
      advanceAmount: Number(specialOrder?.advanceAmount || 0),
      notes: specialOrder?.notes || ''
    },
    createdAt: new Date().toISOString()
  };
  customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

app.put('/api/customers/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Cliente no encontrado' });
  }
  const updates = req.body;
  customers[idx] = {
    ...customers[idx],
    ...updates,
    debt: {
      enabled: !!updates?.debt?.enabled,
      parts: Number(updates?.debt?.parts ?? customers[idx].debt.parts),
      installmentAmount: Number(updates?.debt?.installmentAmount ?? customers[idx].debt.installmentAmount),
      frequency: updates?.debt?.frequency ?? customers[idx].debt.frequency
    },
    specialOrder: {
      enabled: !!updates?.specialOrder?.enabled,
      product: updates?.specialOrder?.product ?? customers[idx].specialOrder.product,
      payInAdvance: !!(updates?.specialOrder?.payInAdvance ?? customers[idx].specialOrder.payInAdvance),
      advanceAmount: Number(updates?.specialOrder?.advanceAmount ?? customers[idx].specialOrder.advanceAmount),
      notes: updates?.specialOrder?.notes ?? customers[idx].specialOrder.notes
    }
  };
  res.json(customers[idx]);
});

app.delete('/api/customers/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const exists = customers.some(c => c.id === id);
  if (!exists) {
    return res.status(404).json({ message: 'Cliente no encontrado' });
  }
  customers = customers.filter(c => c.id !== id);
  res.json({ message: 'Cliente eliminado' });
});

// Create Product
app.post('/api/products', async (req, res) => {
  const { name, category, price, cost, stock, minStock, expirationDate, photoData } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ message: 'Nombre y precio son requeridos' });
  }
  if (!hasSupabase) {
    const newProduct = {
      id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
      name,
      category: category || '',
      price: Number(price),
      cost: Number(cost ?? 0),
      stock: Number(stock ?? 0),
      minStock: Number(minStock ?? 0),
      expirationDate: expirationDate || '',
      photoData: photoData || null,
    };
    products.push(newProduct);
    return res.status(201).json(newProduct);
  }
  try {
    const toInsert = {
      name,
      category: category || '',
      price: Number(price),
      cost: Number(cost ?? 0),
      stock: Number(stock ?? 0),
      minStock: Number(minStock ?? 0),
      expirationDate: expirationDate || '',
      photoData: photoData || null,
    };
    const { data, error } = await supabase
      .from('products')
      .insert([toInsert])
      .select()
      .single();
    if (error) {
      return res.status(500).json({ message: 'Error insertando producto', detail: error.message });
    }
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error en servidor al crear producto', detail: err.message });
  }
});

// Update Product
app.put('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (!hasSupabase) {
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    const updates = req.body;
    products[idx] = { ...products[idx], ...updates, id };
    return res.json(products[idx]);
  }
  try {
    const updates = req.body;
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      return res.status(500).json({ message: 'Error actualizando producto', detail: error.message });
    }
    if (!data) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error en servidor al actualizar producto', detail: err.message });
  }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (!hasSupabase) {
    const exists = products.some(p => p.id === id);
    if (!exists) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    products = products.filter(p => p.id !== id);
    return res.json({ message: 'Producto eliminado' });
  }
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) {
      return res.status(500).json({ message: 'Error eliminando producto', detail: error.message });
    }
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error en servidor al eliminar producto', detail: err.message });
  }
});

// Export Products as CSV (Excel compatible)
app.get('/api/products/export', (req, res) => {
  const header = ['id','name','category','price','cost','stock','minStock','expirationDate'].join(',');
  const lines = products.map(p => [
    p.id,
    JSON.stringify(p.name),
    JSON.stringify(p.category || ''),
    p.price,
    p.cost ?? 0,
    p.stock,
    p.minStock ?? 0,
    JSON.stringify(p.expirationDate || '')
  ].join(','));
  const csv = [header, ...lines].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=productos.csv');
  res.send(csv);
});

// Import Products (bulk)
app.post('/api/products/import', (req, res) => {
  const { products: incoming } = req.body;
  if (!Array.isArray(incoming)) {
    return res.status(400).json({ message: 'Formato inválido: se espera arreglo products' });
  }
  const created = [];
  for (const item of incoming) {
    if (!item.name || item.price == null) {
      continue;
    }
    const newProduct = {
      id: products.length ? Math.max(...products.map(p => p.id)) + 1 + created.length : 1 + created.length,
      name: item.name,
      category: item.category || '',
      price: Number(item.price),
      cost: Number(item.cost ?? 0),
      stock: Number(item.stock ?? 0),
      minStock: Number(item.minStock ?? 0),
      expirationDate: item.expirationDate || '',
      photoData: item.photoData || null,
    };
    created.push(newProduct);
  }
  products.push(...created);
  res.status(201).json({ created });
});
// Get Movements
app.get('/api/movements', async (req, res) => {
  if (!hasSupabase) {
    return res.json(movements);
  }
  try {
    const { data, error } = await supabase
      .from('movements')
      .select('*')
      .order('id', { ascending: false });
    if (error) {
      return res.status(500).json({ message: 'Error en Supabase (movements)', detail: error.message });
    }
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: 'Error consultando movimientos', detail: err.message });
  }
});

app.post('/api/sales/single', async (req, res) => {
  const { productId, quantity, userId } = req.body;
  const q = parseInt(quantity);
  const pid = parseInt(productId);

  if (!pid || !q || q <= 0) {
    return res.status(400).json({ message: 'Parámetros inválidos' });
  }

  if (!hasSupabase) {
    const product = products.find(p => p.id === pid);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    if (product.stock < q) {
      return res.status(400).json({ message: 'Stock insuficiente', available: product.stock });
    }
    product.stock -= q;
    const newMovement = {
      id: movements.length ? Math.max(...movements.map(m => m.id)) + 1 : 1,
      type: 'OUT',
      productId: product.id,
      productName: product.name,
      quantity: q,
      date: new Date().toISOString(),
      userId: userId || null
    };
    movements.push(newMovement);
    return res.status(201).json({ movement: newMovement, product });
  }
  try {
    const { data: product, error: pErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', pid)
      .single();
    if (pErr) {
      return res.status(404).json({ message: 'Producto no encontrado', detail: pErr.message });
    }
    if (!product || product.stock < q) {
      return res.status(400).json({ message: 'Stock insuficiente', available: product?.stock ?? 0 });
    }
    const { data: updatedProduct, error: uErr } = await supabase
      .from('products')
      .update({ stock: product.stock - q })
      .eq('id', pid)
      .select()
      .single();
    if (uErr) {
      return res.status(500).json({ message: 'Error actualizando stock', detail: uErr.message });
    }
    const movementRow = {
      type: 'OUT',
      productId: pid,
      productName: product.name,
      quantity: q,
      date: new Date().toISOString(),
      userId: userId || null
    };
    const { data: mv, error: mErr } = await supabase
      .from('movements')
      .insert([movementRow])
      .select()
      .single();
    if (mErr) {
      return res.status(500).json({ message: 'Error registrando movimiento', detail: mErr.message });
    }
    res.status(201).json({ movement: mv, product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: 'Error en servidor (venta individual)', detail: err.message });
  }
});

app.post('/api/sales/batch', async (req, res) => {
  const { items, userId } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Lista de items inválida' });
  }

  if (!hasSupabase) {
    for (const item of items) {
      const pid = parseInt(item.productId);
      const q = parseInt(item.quantity);
      const product = products.find(p => p.id === pid);
      if (!pid || !q || q <= 0) {
        return res.status(400).json({ message: 'Item inválido', item });
      }
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado', productId: pid });
      }
      if (product.stock < q) {
        return res.status(400).json({ message: 'Stock insuficiente', productId: pid, available: product.stock });
      }
    }
    const created = [];
    for (const item of items) {
      const pid = parseInt(item.productId);
      const q = parseInt(item.quantity);
      const product = products.find(p => p.id === pid);
      product.stock -= q;
      const mv = {
        id: movements.length ? Math.max(...movements.map(m => m.id)) + 1 + created.length : 1 + created.length,
        type: 'OUT',
        productId: product.id,
        productName: product.name,
        quantity: q,
        date: new Date().toISOString(),
        userId: userId || null
      };
      created.push(mv);
    }
    movements.push(...created);
    return res.status(201).json({ movements: created });
  }
  try {
    // Validación previa
    for (const item of items) {
      const pid = parseInt(item.productId);
      const q = parseInt(item.quantity);
      const { data: product, error } = await supabase
        .from('products')
        .select('id, stock')
        .eq('id', pid)
        .single();
      if (error || !product) {
        return res.status(404).json({ message: 'Producto no encontrado', productId: pid });
      }
      if (product.stock < q) {
        return res.status(400).json({ message: 'Stock insuficiente', productId: pid, available: product.stock });
      }
    }
    const created = [];
    for (const item of items) {
      const pid = parseInt(item.productId);
      const q = parseInt(item.quantity);
      const { data: productRow } = await supabase
        .from('products')
        .select('name, stock')
        .eq('id', pid)
        .single();
      await supabase
        .from('products')
        .update({ stock: (productRow?.stock ?? 0) - q })
        .eq('id', pid);
      const { data: mv } = await supabase
        .from('movements')
        .insert([{
          type: 'OUT',
          productId: pid,
          productName: productRow?.name || '',
          quantity: q,
          date: new Date().toISOString(),
          userId: userId || null
        }])
        .select()
        .single();
      created.push(mv);
    }
    res.status(201).json({ movements: created });
  } catch (err) {
    res.status(500).json({ message: 'Error en servidor (ventas múltiples)', detail: err.message });
  }
});

app.put('/api/movements/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { quantity } = req.body;
  const qNew = parseInt(quantity);

  if (!hasSupabase) {
    const mvIndex = movements.findIndex(m => m.id === id);
    if (mvIndex === -1) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    const mv = movements[mvIndex];
    if (!qNew || qNew <= 0) {
      return res.status(400).json({ message: 'Cantidad inválida' });
    }
    const product = products.find(p => p.id === mv.productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto del movimiento no existe' });
    }
    const delta = qNew - mv.quantity;
    if (mv.type === 'OUT') {
      if (product.stock - delta < 0) {
        return res.status(400).json({ message: 'Stock insuficiente para actualizar' });
      }
      product.stock -= delta;
    } else if (mv.type === 'IN') {
      product.stock += delta;
      if (product.stock < 0) {
        return res.status(400).json({ message: 'Stock no puede ser negativo' });
      }
    }
    movements[mvIndex] = { ...mv, quantity: qNew };
    return res.json({ movement: movements[mvIndex], product });
  }
  try {
    const { data: mv, error: mvErr } = await supabase
      .from('movements')
      .select('*')
      .eq('id', id)
      .single();
    if (mvErr || !mv) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    if (!qNew || qNew <= 0) {
      return res.status(400).json({ message: 'Cantidad inválida' });
    }
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', mv.productId)
      .single();
    const delta = qNew - mv.quantity;
    if (mv.type === 'OUT') {
      if ((product?.stock ?? 0) - delta < 0) {
        return res.status(400).json({ message: 'Stock insuficiente para actualizar' });
      }
      await supabase.from('products').update({ stock: (product?.stock ?? 0) - delta }).eq('id', mv.productId);
    } else if (mv.type === 'IN') {
      const newStock = (product?.stock ?? 0) + delta;
      if (newStock < 0) {
        return res.status(400).json({ message: 'Stock no puede ser negativo' });
      }
      await supabase.from('products').update({ stock: newStock }).eq('id', mv.productId);
    }
    const { data: updatedMv, error: upErr } = await supabase
      .from('movements')
      .update({ quantity: qNew })
      .eq('id', id)
      .select()
      .single();
    if (upErr) {
      return res.status(500).json({ message: 'Error actualizando movimiento', detail: upErr.message });
    }
    const { data: updatedProduct } = await supabase
      .from('products')
      .select('*')
      .eq('id', mv.productId)
      .single();
    res.json({ movement: updatedMv, product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: 'Error en servidor al actualizar movimiento', detail: err.message });
  }
});

app.delete('/api/movements/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (!hasSupabase) {
    const mvIndex = movements.findIndex(m => m.id === id);
    if (mvIndex === -1) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    const mv = movements[mvIndex];
    const product = products.find(p => p.id === mv.productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto del movimiento no existe' });
    }
    if (mv.type === 'OUT') {
      product.stock += mv.quantity;
    } else if (mv.type === 'IN') {
      if (product.stock - mv.quantity < 0) {
        return res.status(400).json({ message: 'No se puede eliminar: stock quedaría negativo' });
      }
      product.stock -= mv.quantity;
    }
    movements.splice(mvIndex, 1);
    return res.json({ message: 'Movimiento eliminado', product });
  }
  try {
    const { data: mv } = await supabase
      .from('movements')
      .select('*')
      .eq('id', id)
      .single();
    if (!mv) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    const { data: product } = await supabase
      .from('products')
      .select('id, stock')
      .eq('id', mv.productId)
      .single();
    let newStock = product?.stock ?? 0;
    if (mv.type === 'OUT') {
      newStock += mv.quantity;
    } else if (mv.type === 'IN') {
      if (newStock - mv.quantity < 0) {
        return res.status(400).json({ message: 'No se puede eliminar: stock quedaría negativo' });
      }
      newStock -= mv.quantity;
    }
    await supabase.from('products').update({ stock: newStock }).eq('id', mv.productId);
    await supabase.from('movements').delete().eq('id', id);
    const { data: updatedProduct } = await supabase
      .from('products')
      .select('*')
      .eq('id', mv.productId)
      .single();
    res.json({ message: 'Movimiento eliminado', product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: 'Error en servidor al eliminar movimiento', detail: err.message });
  }
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
