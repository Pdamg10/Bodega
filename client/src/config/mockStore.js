// Client-side mock data for demo verification
export const mockStore = {
  users: [
    {
      id: 1,
      username: "admin",
      role: "admin",
      firstName: "System",
      lastName: "Admin",
      email: "admin@bodega.com",
      cedula: "0000000000",
      phone: "555-5555",
      paymentAmount: 0,
      isActive: true,
      cutoffDate: "",
    },
  ],
  products: [
    {
      id: 1,
      name: "Arroz 1kg (Demo)",
      category: "Granos",
      stock: 45,
      minStock: 20,
      price: 1.2,
      cost: 0.8,
    },
    {
      id: 2,
      name: "Aceite 1L (Demo)",
      category: "Aceites",
      stock: 8,
      minStock: 10,
      price: 2.5,
      cost: 1.6,
    },
  ],
  customers: [
    {
      id: 1,
      firstName: "Cliente",
      lastName: "Demo",
      cedula: "99999999",
      phone: "555-9999",
      debt: { enabled: false, parts: 0, installmentAmount: 0 },
      specialOrder: { enabled: false },
    },
  ],
  movements: [],
  backups: [],
};
