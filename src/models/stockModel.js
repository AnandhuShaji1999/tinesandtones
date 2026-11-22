import { PAGE_SIZE } from "./categoryModel";

const asList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

// Nested objects become "parent.child" keys; arrays become text
export const flatten = (obj, prefix = "", out = {}) => {
  Object.entries(obj || {}).forEach(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) {
      out[key] = v.every((x) => x === null || typeof x !== "object")
        ? v.join(", ")
        : `${v.length} item(s)`;
    } else if (v && typeof v === "object") {
      flatten(v, key, out);
    } else {
      out[key] = v;
    }
  });
  return out;
};

// Works for both server-paginated ({count, results}) and plain array responses
export const fromStockList = (data, page = 1) => {
  const all = asList(data).map((r) => flatten(r));
  const serverPaged = !Array.isArray(data);
  const total = data?.count ?? all.length;
  const rows = serverPaged
    ? all
    : all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return {
    rows,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
};

// Every field returned by the API becomes a column
export const columnsOf = (rows) => {
  const keys = [];
  rows.forEach((r) =>
    Object.keys(r).forEach((k) => {
      if (!keys.includes(k)) keys.push(k);
    })
  );
  return keys;
};

export const humanize = (key) => key.replace(/[._]+/g, " ").toUpperCase();

const last = (key) => key.split(".").pop();

const QTY = /^(quantity|qty|on_hand|balance|available|quantity_on_hand|remaining|current_quantity|closing_quantity)/;

export const qtyKey = (cols) => cols.find((k) => QTY.test(last(k)));

export const sumOf = (rows, key) =>
  key ? rows.reduce((a, r) => a + (Number(r[key]) || 0), 0) : 0;

const MONEY = /(price|cost|amount|value|total)/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T/;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export const formatCell = (key, value, lookup = {}) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";

  const name = last(key);
  const str = String(value);
  if (lookup[name]?.[str]) return lookup[name][str];

  if (DATE_TIME.test(str)) {
    const d = new Date(str);
    if (!Number.isNaN(d.getTime())) return d.toLocaleString("en-IN");
  }
  if (MONEY.test(name) && str !== "" && !Number.isNaN(Number(str))) {
    return `₹${Number(str).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return str;
};

/* ---------- batch editing ---------- */

// Never editable: ids, timestamps, links to other records, nested/derived names
const READ_ONLY =
  /^(id|created_at|updated_at|received_at|branch|variant|purchase|product)$|\.|_name$|_sku$|^sku$/;

export const isEditable = (key) => !READ_ONLY.test(key);

export const editableKeys = (detail) =>
  Object.keys(detail || {}).filter(isEditable);

export const inputTypeOf = (key, value) => {
  if (typeof value === "boolean") return "checkbox";
  if (DATE_ONLY.test(String(value ?? "")) || /(^|_)date$/.test(key)) return "date";
  if (typeof value === "number") return "number";
  return "text";
};

// Form state: every editable field as its current value
export const toBatchForm = (detail) => {
  const form = {};
  editableKeys(detail).forEach((k) => {
    const v = detail[k];
    form[k] = typeof v === "boolean" ? v : v ?? "";
  });
  return form;
};

// PATCH body: only the fields the user changed
export const toBatchPatch = (detail, form) => {
  const body = {};
  Object.keys(form).forEach((k) => {
    const before = typeof detail[k] === "boolean" ? detail[k] : detail[k] ?? "";
    if (form[k] === before) return;
    if (typeof form[k] === "boolean") body[k] = form[k];
    else if (form[k] === "") body[k] = null;
    else body[k] = form[k];
  });
  return body;
};