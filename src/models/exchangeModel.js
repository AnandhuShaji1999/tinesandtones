import { PAGE_SIZE } from "./categoryModel";
import { lineNet, money, round2 } from "./billingModel";

export const EX_PAGE_SIZE = PAGE_SIZE;

export const EX_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "store_credit", label: "Store Credit" },
];

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

/* ---------- requests ---------- */

export const toExchangePayload = ({ originalSale, returned, replacements, payments }) => ({
  original_sale: originalSale,
  returned_lines: returned
    .filter((r) => Number(r.qty) > 0)
    .map((r) => ({ sale_line: r.saleLine, quantity: Number(r.qty) })),
  replacement_lines: replacements.map((l) => ({
    variant: l.variant,
    quantity: Number(l.qty),
    line_discount: money(l.discount),
  })),
  payments: payments
    .filter((p) => Number(p.amount) > 0)
    .map((p) => {
      const row = { method: p.method, amount: money(p.amount) };
      if (p.method !== "cash" && p.reference.trim()) row.reference = p.reference.trim();
      return row;
    }),
});

/* ---------- estimate (server figures are final) ---------- */

export const returnLinesFromSale = (sale) =>
  sale.lines.map((l) => {
    const qty = Number(l.quantity) || 0;
    const unit = l.total !== "" && qty ? Number(l.total) / qty : Number(l.unitPrice) || 0;
    return {
      saleLine: String(l.id),
      name: l.name || l.sku || "Item",
      sku: l.sku,
      max: qty,
      unit: round2(unit),
      qty: "",
    };
  });

export const estimateExchange = (returned, replacements) => {
  const credit = round2(
    returned.reduce((a, r) => a + (Number(r.qty) || 0) * r.unit, 0)
  );
  const replacement = round2(replacements.reduce((a, l) => a + lineNet(l), 0));
  return { credit, replacement, diff: round2(replacement - credit) };
};

/* ---------- responses ---------- */

const asList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

export const fromExchange = (e = {}) => ({
  id: e.id,
  branch: String(e.branch ?? ""),
  originalSale: e.original_sale,
  replacementSale: e.replacement_sale,
  documentNumber: e.document_number || "",
  creditTotal: e.credit_total ?? "",
  creditUsed: e.credit_used ?? "",
  topUp: e.top_up ?? "",
  creditCode: e.store_credit_code || "",
  creditRemaining: e.store_credit_remaining ?? "",
  createdBy: e.created_by ?? "",
  createdAt: e.created_at || "",
  returnedLines: (e.returned_lines || []).map((l) => ({
    id: l.id,
    originalLine: l.original_line,
    quantity: l.quantity,
    creditAmount: l.credit_amount,
    taxable: l.taxable_value,
    cgst: l.cgst_amount,
    sgst: l.sgst_amount,
    igst: l.igst_amount,
  })),
});

export const fromExchangeList = (data, page = 1) => {
  const rows = asList(data).map(fromExchange);
  const total = data?.count ?? rows.length;
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / EX_PAGE_SIZE)) };
};