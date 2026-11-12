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

export const humanize = (key) => key.replace(/_/g, " ").toUpperCase();

const MONEY = new Set([
  "subtotal", "discount", "taxable", "cgst", "sgst", "igst", "total", "amount",
  "net_total", "returned_value", "top_up", "store_credit_issued",
]);

export const formatCell = (key, value, branchMap = {}) => {
  if (value === null || value === undefined || value === "") return "-";
  if (key === "branch") return branchMap[String(value)] || String(value);
  if (MONEY.has(key) && !Number.isNaN(Number(value))) {
    return `₹${Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toLocaleString("en-IN");
  }
  return String(value).replace(/_/g, key === "status" || key === "document_type" || key === "document_kind" ? " " : "_");
};