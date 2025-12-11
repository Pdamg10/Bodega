~# Bodega - Inventory Management System

Modern web application for inventory management with role-based access control, audit logging, and automatic backups.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Bamelita/Bodega.git
cd Bodega
```

2. **Install dependencies**

```bash
# Root (for concurrently)
npm install

# Server
cd server
npm install

# Client
cd ../client
npm install
```

3. **Configure environment**

```bash
cd server
cp .env.example .env
# Edit .env with your settings
```

4. **Initialize database**

```bash
cd server
node seed.js
```

5. **Start the application**

```bash
# From root directory
npm start
```

Access the app at: `http://localhost:5173`

**Default credentials:**

- Username: `admin`
- Password: `admin123`

## ✨ Features

### Core

- 🔐 JWT Authentication
- 👥 Role-based access (Admin/User)
- 📦 Product management (CRUD)
- 📊 Inventory tracking with USD/VES prices
- 📈 Sales & purchase movements
- 💰 Payment tracking

### Admin Features

- 👤 User management
- 💾 Manual & automatic backups
- 🗑️ Automatic backup retention
- 📋 Audit logs (all actions tracked)
- 📄 Excel import/export

### UX

- 🎨 Modern UI with TailwindCSS
- 🔔 Toast notifications
- ✅ Custom confirmation modals
- 📱 Responsive design

## 📁 Project Structure

```
Bodega/
├── client/          # React frontend (Vite)
├── server/          # Node.js Express backend
│   ├── models/      # Sequelize models
│   ├── routes/      # API routes
│   ├── middleware/  # Auth middleware
│   ├── utils/       # Utilities (backup, audit, etc.)
│   └── backups/     # SQLite backups
└── legacy_backup/   # Archived Python code
```

## 🔧 Configuration

Edit `server/.env`:

```bash
PORT=3001
JWT_SECRET=your_secret_key

# Auto backups
AUTO_BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *  # Daily at 2 AM
```

## 📖 Documentation

See `walkthrough.md` for detailed feature guide.

## 🛡️ Security

- Passwords hashed with bcrypt
- JWT token authentication
- Role-based authorization
- Complete audit logging
- IP address tracking

## � Troubleshooting

### Port already in use

```bash
# Kill process on port 3001 (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Database locked

```bash
# Stop the server and delete lock files
cd server
del bodega.sqlite-shm
del bodega.sqlite-wal
node seed.js  # Reinitialize
```

### Missing JWT_SECRET error

```bash
# Make sure you have a .env file
cd server
copy .env.example .env
# Edit .env and set JWT_SECRET
```

### Client won't start

```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Import Excel errors

- Ensure file has columns: SKU, Name, Description, Price (USD), Stock, Active
- SKU and Name are required
- Active must be "Yes" or "No"

## �📝 License

MIT
