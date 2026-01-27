import axios from "axios";

const originApi =
  typeof window !== "undefined"
    ? `${window.location.origin}/api`
    : "http://localhost:3001/api";
export const API_URL = import.meta.env?.VITE_API_URL || originApi;

const api = axios.create({
  baseURL: API_URL,
});

// Mock data for Netlify/Demo mode - MUTABLE STATE
// We use a global variable on window if it exists to persist state across hot reloads or component re-renders
// IF the page refreshes, this resets (unless we used localStorage, but simple memory is fine for a demo session).

if (typeof window !== "undefined" && !window.__MOCK_DATA__) {
  window.__MOCK_DATA__ = {
    users: [
      {
        id: 1,
        username: "admin",
        password: "admin123",
        role: "admin",
        firstName: "System",
        lastName: "Admin",
        email: "admin@bodega.com",
        cedula: "0000000000",
        phone: "555-5555",
        paymentMethod: "Efectivo",
        paymentAmount: 0,
        startDate: new Date().toISOString(),
        cutoffDate: "",
        isActive: true,
      },
      {
        id: 2,
        username: "user",
        password: "user123",
        role: "user",
        firstName: "Vendedor",
        lastName: "Demo",
        email: "vendedor@bodega.com",
        cedula: "1111111111",
        phone: "555-1234",
        paymentMethod: "Efectivo",
        paymentAmount: 0,
        startDate: new Date().toISOString(),
        cutoffDate: "",
        isActive: true,
      },
    ],
    products: [
      {
        id: 1,
        name: "Arroz 1kg",
        category: "Granos",
        stock: 45,
        minStock: 20,
        price: 1.2,
        cost: 0.8,
        expirationDate: "2025-12-31",
      },
      {
        id: 2,
        name: "Aceite 1L",
        category: "Aceites",
        stock: 8,
        minStock: 10,
        price: 2.5,
        cost: 1.6,
        expirationDate: "2026-06-30",
      },
      {
        id: 3,
        name: "Leche 1L",
        category: "Lácteos",
        stock: 5,
        minStock: 15,
        price: 0.9,
        cost: 0.6,
        expirationDate: "2024-02-15",
      },
      {
        id: 4,
        name: "Atún en lata",
        category: "Conservas",
        stock: 100,
        minStock: 20,
        price: 1.5,
        cost: 1.0,
        expirationDate: "2027-01-01",
      },
      {
        id: 5,
        name: "Yogurt Fresa",
        category: "Lácteos",
        stock: 12,
        minStock: 10,
        price: 0.8,
        cost: 0.55,
        expirationDate: "2024-02-01",
      },
    ],
    movements: [],
    customers: [
      {
        id: 1,
        firstName: "Cliente",
        lastName: "Demo",
        cedula: "12345678",
        phone: "555-1111",
        debt: {
          enabled: false,
          parts: 0,
          installmentAmount: 0,
          frequency: null,
        },
        specialOrder: {
          enabled: false,
          product: "",
          payInAdvance: false,
          advanceAmount: 0,
          notes: "",
        },
        createdAt: new Date().toISOString(),
      },
    ],
    backups: [],
    logs: [],
  };
}

const getMockData = () =>
  typeof window !== "undefined" ? window.__MOCK_DATA__ : null;

api.interceptors.request.use(async (config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.access_token) {
    config.headers.Authorization = `Bearer ${user.access_token}`;
  }

  // Detect Netlify environment
  const isNetlify =
    typeof window !== "undefined" &&
    /netlify\.app$/.test(window.location.hostname);

  // If on Netlify, hijack the request and return mock data
  if (isNetlify) {
    // console.log('[Mock Adapter] Intercepting request:', config.url);
    const mockDB = getMockData();

    // Handle Login
    if (config.url === "/auth/login" && config.method === "post") {
      const { username, password } = config.data || {};
      const mockUser = mockDB.users.find(
        (u) => u.username === username && u.password === password,
      );

      if (mockUser) {
        const { password: _, ...userWithoutPass } = mockUser;
        config.adapter = () =>
          Promise.resolve({
            data: {
              user: userWithoutPass,
              access_token: "mock_token_" + Date.now(),
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            request: {},
          });
        return config;
      } else {
        config.adapter = () =>
          Promise.reject({
            response: {
              status: 401,
              data: { message: "Credenciales inválidas (Demo Mode)" },
            },
          });
        return config;
      }
    }

    // Handle GET endpoints
    if (config.method === "get") {
      let data = null;
      if (config.url === "/users") data = mockDB.users;
      else if (config.url === "/products") data = mockDB.products;
      else if (config.url === "/customers") data = mockDB.customers;
      else if (config.url === "/movements") data = mockDB.movements;
      else if (config.url === "/backups") data = mockDB.backups;
      else if (config.url === "/backups/logs") data = mockDB.logs;

      if (data) {
        config.adapter = () =>
          Promise.resolve({
            data,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            request: {},
          });
        return config;
      }
    }

    // Handle POST (Create)
    if (config.method === "post") {
      let createdDetails = { id: Date.now() };

      if (config.url === "/users") {
        const newUser = {
          id: Date.now(),
          ...JSON.parse(config.data || "{}"),
          isActive: true,
        };
        mockDB.users.push(newUser);
        createdDetails = newUser;
      } else if (config.url === "/products") {
        const newProd = { id: Date.now(), ...JSON.parse(config.data || "{}") };
        mockDB.products.push(newProd);
        createdDetails = newProd;
      }

      config.adapter = () =>
        Promise.resolve({
          data: createdDetails,
          status: 201,
          statusText: "Created",
          headers: {},
          config,
          request: {},
        });
      return config;
    }

    // Handle DELETE
    if (config.method === "delete") {
      const urlParts = config.url.split("/");
      const id = parseInt(urlParts[urlParts.length - 1]);
      const resource = urlParts[1]; // 'users', 'products', etc.

      if (resource === "users") {
        mockDB.users = mockDB.users.filter((u) => u.id !== id);
      } else if (resource === "products") {
        mockDB.products = mockDB.products.filter((u) => u.id !== id);
      }

      config.adapter = () =>
        Promise.resolve({
          data: { message: "Eliminado correctamente (Demo)" },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          request: {},
        });
      return config;
    }

    // Handle PUT (Update)
    if (config.method === "put") {
      const urlParts = config.url.split("/");
      const id = parseInt(urlParts[urlParts.length - 1]);
      const resource = urlParts[1];
      const updateData = JSON.parse(config.data || "{}");

      if (resource === "users") {
        const idx = mockDB.users.findIndex((u) => u.id === id);
        if (idx !== -1)
          mockDB.users[idx] = { ...mockDB.users[idx], ...updateData };
      }

      config.adapter = () =>
        Promise.resolve({
          data: { ...updateData, id },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          request: {},
        });
      return config;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    // Check for accidental HTML responses
    if (
      response.headers["content-type"] &&
      response.headers["content-type"].includes("text/html")
    ) {
      return Promise.reject(
        new Error(
          "API responded with HTML instead of JSON. Backend might be down.",
        ),
      );
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
