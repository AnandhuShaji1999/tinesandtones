import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

const TONES = ["tan", "slate", "lilac", "sand", "mint"];

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "--";
  const first = parts[0][0] || "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] : parts[0][1] || "";
  return (first + second).toUpperCase();
};

// API customer -> table row
const normalize = (c) => ({
  id: c.id,
  code: `CUS-${String(c.id).padStart(4, "0")}`,
  name: c.name || "",
  initials: getInitials(c.name),
  tone: TONES[Number(c.id) % TONES.length],
  mobile: c.phone || "",
  email: c.email || "",
  gstin: c.gstin || "",
  address: c.address || "",
  startDate: (c.created_at || "").slice(0, 10),
});

export const getErrorMessage = (err, fallback = "Something went wrong") => {
  const d = err?.response?.data;
  if (!d) return err?.message || fallback;
  if (typeof d === "string") return d;
  if (d.detail) return d.detail;
  return (
    Object.entries(d)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join(" | ") || fallback
  );
};

export const getCustomers = async (filters = {}, page = 1) => {
  const params = {};
  const name = (filters.name || "").trim();
  if (name) params.search = name;
  if (page > 1) params.page = page;

  const { data } = await axiosInstance.get(API_ENDPOINTS.POS_CUSTOMERS.LIST, {
    params,
  });

  const list = Array.isArray(data) ? data : data.results ?? [];
  const code = (filters.code || "").trim().toLowerCase();

  // Customer ID and date filters run on the loaded list
  const rows = list
    .map(normalize)
    .filter(
      (r) =>
        (!code || r.code.toLowerCase().includes(code)) &&
        (!filters.from || (r.startDate && r.startDate >= filters.from)) &&
        (!filters.to || (r.startDate && r.startDate <= filters.to))
    );

  return {
    rows,
    total: Array.isArray(data) ? list.length : data.count ?? list.length,
    pageSize: list.length,
    hasNext: Boolean(data.next),
    hasPrev: Boolean(data.previous),
  };
};

export const createCustomer = async (payload) => {
  const { data } = await axiosInstance.post(API_ENDPOINTS.POS_CUSTOMERS.CREATE, {
    name: payload.name.trim(),
    phone: (payload.phone || "").trim(),
    email: (payload.email || "").trim(),
    gstin: (payload.gstin || "").trim(),
    address: (payload.address || "").trim(),
  });
  return normalize(data);
};