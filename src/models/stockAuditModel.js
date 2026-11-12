import { PAGE_SIZE } from "./categoryModel";

export const AUDIT_PAGE_SIZE = PAGE_SIZE;

const asList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

const pick = (o, keys) => {
  for (const k of keys) if (o?.[k] !== undefined && o?.[k] !== null) return o[k];
  return "";
};

// Reads expected quantity / version from a batch response (field names vary)
export const fromBatchForAudit = (b = {}) => {
  const bal = b.balance && typeof b.balance === "object" ? b.balance : {};
  return {
    expected: String(
      pick(b, ["quantity", "quantity_on_hand", "on_hand", "available", "current_quantity"]) ||
        pick(bal, ["quantity", "quantity_on_hand", "on_hand"]) ||
        (typeof b.balance !== "object" ? pick(b, ["balance"]) : "")
    ),
    version: String(
      pick(b, ["balance_version", "version", "expected_version"]) ||
        pick(bal, ["version"])
    ),
  };
};

export const fromBatchOption = (b = {}) => {
  const code = pick(b, ["manufacturer_batch_code", "batch_code", "code"]);
  const sku = pick(b, ["variant_sku", "sku"]);
  const qty = pick(b, ["quantity", "quantity_on_hand", "on_hand", "available"]);
  const parts = [`#${b.id}`, sku, code, qty !== "" ? `qty ${qty}` : ""].filter(Boolean);
  return { value: String(b.id), label: parts.join(" | ") };
};

export const batchOptionsFromList = (data) => asList(data).map(fromBatchOption);

export const variance = (l) =>
  l.expected === "" || l.physical === ""
    ? null
    : (Number(l.physical) || 0) - (Number(l.expected) || 0);

export const toAuditPayload = ({ branch, reason, lines }) => ({
  branch,
  reason: reason.trim(),
  lines: lines.map((l) => ({
    batch: l.batch,
    expected_quantity: String(l.expected),
    expected_version: String(l.version),
    physical_quantity: String(l.physical),
  })),
});

export const fromAudit = (a = {}) => ({
  id: a.id,
  branch: String(a.branch ?? ""),
  reason: a.reason || "",
  createdBy: a.created_by ?? "",
  createdAt: a.created_at || "",
  lines: (a.lines || []).map((l) => ({
    id: l.id,
    batch: l.batch,
    expected: l.expected_quantity,
    version: l.expected_version,
    physical: l.physical_quantity,
    variance: l.variance,
  })),
});

export const totalVariance = (a) =>
  a.lines.reduce((s, l) => s + (Number(l.variance) || 0), 0);

export const fromAuditList = (data, page = 1) => {
  const rows = asList(data).map(fromAudit);
  const total = data?.count ?? rows.length;
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE)) };
};