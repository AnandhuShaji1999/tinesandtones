import { PAGE_SIZE } from "./categoryModel";

export const REPORT_PAGE_SIZE = PAGE_SIZE;

export const REPORTS = [
  { key: "sales", label: "Sales" },
  { key: "payments", label: "Payments" },
  { key: "gst", label: "GST" },
  { key: "products", label: "Products" },
  { key: "purchases", label: "Purchases" },
  { key: "exchanges", label: "Exchanges" },
  { key: "audits", label: "Audits" },
  { key: "stock", label: "Stock" },
];

export const toReportParams = ({ branch, from, to }) => {
  const p = {};
  if (branch) p.branch = branch;
  if (from) p.date_from = from;
  if (to) p.date_to = to;
  return p;
};

const asList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

export const fromReport = (data, page = 1) => {
  const rows = asList(data);
  const paged = !Array.isArray(data);
  const total = data?.count ?? rows.length;
  return {
    rows: paged ? rows : rows.slice((page - 1) * REPORT_PAGE_SIZE, page * REPORT_PAGE_SIZE),
    total,
    pages: Math.max(1, Math.ceil(total / REPORT_PAGE_SIZE)),
  };
};

export const columnsOf = (rows) => {
  const keys = [];
  rows.forEach((r) =>
    Object.keys(r).forEach((k) => {
      if (!keys.includes(k)) keys.push(k);
    })
  );
  return keys;
};

// Stock rows carry both branch and branch_name: show the name only
export const visibleColumns = (tab, cols) =>
  tab === "stock" && cols.includes("branch_name")
    ? cols.filter((k) => k !== "branch")
    : cols;

export const humanize = (key) => key.replace(/_/g, " ").toUpperCase();

// 1 ... 4 5 6 ... 12
export const pageList = (page, pages) => {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push("...");
    out.push(n);
  });
  return out;
};

const MONEY = new Set([
  "subtotal", "discount", "taxable", "cgst", "sgst", "igst", "total", "amount",
  "net_total", "returned_value", "top_up", "store_credit_issued",
]);
const WORDS = new Set(["status", "document_type", "document_kind", "method"]);
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T/;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export const formatCell = (key, value, branchMap = {}) => {
  if (value === null || value === undefined || value === "") return "-";
  if (key === "branch") return branchMap[String(value)] || String(value);
  if (MONEY.has(key) && !Number.isNaN(Number(value))) {
    return `₹${Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  if (typeof value === "string" && DATE_TIME.test(value)) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toLocaleString("en-IN");
  }
  if (typeof value === "string" && DATE_ONLY.test(value)) {
    const d = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    }
  }
  if (WORDS.has(key)) return String(value).replace(/_/g, " ");
  return String(value);
};

// Colour for the stock status pill
export const statusClass = (value) =>
  value === "out_of_stock" ? "st-out" : value === "low_stock" ? "st-low" : "st-in";