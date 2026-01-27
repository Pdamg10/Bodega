import axios from "axios";

const originApi =
  typeof window !== "undefined"
    ? `${window.location.origin}/api`
    : "http://localhost:3001/api";
export const API_URL = import.meta.env?.VITE_API_URL || originApi;

const api = axios.create({
  baseURL: API_URL,
});

// Mock data for Netlify/Demo mode
const MOCK_DATA = {
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
      debt: { enabled: false, parts: 0, installmentAmount: 0, frequency: null },
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
    console.log("[Mock Adapter] Intercepting request:", config.url);

    // Simulate network delay for realism (optional, but good for UX testing)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Handle Login
    if (config.url === "/auth/login" && config.method === "post") {
      const { username, password } = config.data || {};
      const mockUser = MOCK_DATA.users.find(
        (u) => u.username === username && u.password === password,
      );

      if (mockUser) {
        const { password: _, ...userWithoutPass } = mockUser;
        // Construct a proper Axios response object
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
      if (config.url === "/users") data = MOCK_DATA.users;
      else if (config.url === "/products") data = MOCK_DATA.products;
      else if (config.url === "/customers") data = MOCK_DATA.customers;
      else if (config.url === "/movements") data = MOCK_DATA.movements;
      else if (config.url === "/backups") data = MOCK_DATA.backups;
      else if (config.url === "/backups/logs") data = MOCK_DATA.logs;

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

    // Handle POST/PUT/DELETE endpoints (Fake success)
    if (["post", "put", "delete"].includes(config.method)) {
      config.adapter = () =>
        Promise.resolve({
          data: { message: "Operación simulada con éxito (Demo Mode)" },
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
