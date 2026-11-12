// Dev: leave VITE_API_URL unset, requests go to the same origin and Vite proxies /api and /health.
// Production: set VITE_API_URL to the real backend URL (e.g. https://api.example.com).
export const BASE_URL = import.meta.env.VITE_API_URL ?? "";

const API_V1 = "/api/v1";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_V1}/auth/login/`,
    REFRESH: `${API_V1}/auth/refresh/`,
    LOGOUT: `${API_V1}/auth/logout/`,
    ME: `${API_V1}/auth/me/`,
    CHANGE_PASSWORD: `${API_V1}/auth/change-password/`,
  },
  UTILITIES: {
    HEALTH: "/health/",
    SCHEMA: "/api/schema/",
  },
  DASHBOARD: {
    SUMMARY: `${API_V1}/dashboard/summary/`,
  },
  REPORTS: {
    LIST: (name) => `${API_V1}/reports/${name}/`,
  },
  STAFF: {
    LIST: `${API_V1}/staff/`,
    CREATE: `${API_V1}/staff/`,
    DETAIL: (id) => `${API_V1}/staff/${id}/`,
  },
  CATEGORIES: {
    LIST: `${API_V1}/categories/`,
    CREATE: `${API_V1}/categories/`,
    DETAIL: (id) => `${API_V1}/categories/${id}/`,
  },
  SUBCATEGORIES: {
    LIST: `${API_V1}/subcategories/`,
    CREATE: `${API_V1}/subcategories/`,
    DETAIL: (id) => `${API_V1}/subcategories/${id}/`,
  },
  BRANDS: {
    LIST: `${API_V1}/brands/`,
    CREATE: `${API_V1}/brands/`,
    DETAIL: (id) => `${API_V1}/brands/${id}/`,
  },
  PRODUCTS: {
    LIST: `${API_V1}/products/`,
    CREATE: `${API_V1}/products/`,
    DETAIL: (id) => `${API_V1}/products/${id}/`,
  },
  VARIANTS: {
    LIST: `${API_V1}/variants/`,
    CREATE: `${API_V1}/variants/`,
    DETAIL: (id) => `${API_V1}/variants/${id}/`,
  },
  SUPPLIERS: {
    LIST: `${API_V1}/suppliers/`,
    CREATE: `${API_V1}/suppliers/`,
    DETAIL: (id) => `${API_V1}/suppliers/${id}/`,
  },
  PURCHASES: {
    LIST: `${API_V1}/purchases/`,
    CREATE: `${API_V1}/purchases/`,
    DETAIL: (id) => `${API_V1}/purchases/${id}/`,
    REVISIONS: (id) => `${API_V1}/purchases/${id}/revisions/`,
  },
  STOCK: {
    BALANCES: `${API_V1}/stock/balances/`,
    BATCHES: `${API_V1}/stock/batches/`,
    BATCH: (id) => `${API_V1}/stock/batches/${id}/`,
    LEDGER: `${API_V1}/stock/ledger/`,
  },
  POS_CUSTOMERS: {
    LIST: `${API_V1}/customers/`,
    CREATE: `${API_V1}/customers/`,
    DETAIL: (id) => `${API_V1}/customers/${id}/`,
  },
  POS_SALES: {
    LIST: `${API_V1}/sales/`,
    CREATE: `${API_V1}/sales/`,
    LOOKUP: `${API_V1}/sales/lookup/`,
    DETAIL: (id) => `${API_V1}/sales/${id}/`,
    PDF: (id) => `${API_V1}/sales/${id}/pdf/`,
  },
  EXCHANGES: {
    LIST: `${API_V1}/exchanges/`,
    CREATE: `${API_V1}/exchanges/`,
    DETAIL: (id) => `${API_V1}/exchanges/${id}/`,
    PDF: (id) => `${API_V1}/exchanges/${id}/pdf/`,
  },
  STOCK_AUDITS: {
    LIST: `${API_V1}/stock-audits/`,
    CREATE: `${API_V1}/stock-audits/`,
    DETAIL: (id) => `${API_V1}/stock-audits/${id}/`,
  },
  BRANCHES: {
    LIST: `${API_V1}/branches/`,
    DETAIL: (id) => `${API_V1}/branches/${id}/`,
  },
  SALES: {
    INVENTORY: "/sales/inventory",
  },
  CUSTOMERS: {
    LIST: "/customers",
  },
  PURCHASE: {
    OPTIONS: "/purchase/options",
  },
};