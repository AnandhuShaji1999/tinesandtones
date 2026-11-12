import { PAGE_SIZE } from "./categoryModel";

export const BILL_PAGE_SIZE = PAGE_SIZE;

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
];

export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
export const money = (v) => round2(v).toFixed(2);

export const inr = (v) =>
  v === "" || v == null
    ? "-"
    : `₹${Number(v).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

export const fmtDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString("en-IN");
};

/* ---------- cart maths (retail price is GST-inclusive) ---------- */

export const lineNet = (l) =>
  Math.max(0, (Number(l.qty) || 0) * (Number(l.price) || 0) - (Number(l.discount) || 0));

export const computeBill = (lines, billDiscount) => {
  const subtotal = lines.reduce(
    (a, l) => a + (Number(l.qty) || 0) * (Number(l.price) || 0),
    0
  );
  const afterLines = lines.reduce((a, l) => a + lineNet(l), 0);
  const lineDiscounts = subtotal - afterLines;
  const billDisc = Math.min(Number(billDiscount) || 0, afterLines);
  return {
    subtotal: round2(subtotal),
    lineDiscounts: round2(lineDiscounts),
    billDiscount: round2(billDisc),
    total: round2(afterLines - billDisc),
    units: lines.reduce((a, l) => a + (Number(l.qty) || 0), 0),
  };
};

/* ---------- requests ---------- */

export const toSalePayload = ({ branch, customer, lines, billDiscount, payments }) => {
  const payload = {
    branch,
    lines: lines.map((l) => ({
      variant: l.variant,
      quantity: Number(l.qty),
      line_discount: money(l.discount),
    })),
    bill_discount: money(billDiscount),
    payments: payments
      .filter((p) => Number(p.amount) > 0)
      .map((p) => {
        const row = { method: p.method, amount: money(p.amount) };
        if (p.method !== "cash" && p.reference.trim()) {
          row.reference = p.reference.trim();
        }
        return row;
      }),
  };
  if (customer) payload.customer = customer;
  return payload;
};

export const toCustomerPayload = (form) => ({
  name: form.name.trim(),
  phone: form.phone.trim(),
  gstin: form.gstin.trim(),
  address: form.address.trim(),
});

export const toGstPayload = (form) => ({
  gstin: form.gstin.trim(),
  gst_enabled: true,
});

/* ---------- responses ---------- */

const asList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
const idOf = (v) => String(v && typeof v === "object" ? v.id : v ?? "");
const nameOf = (v) => (v && typeof v === "object" ? v.name || "" : "");

export const fromCustomer = (c = {}) => ({
  id: String(c.id ?? ""),
  name: c.name || "",
  phone: c.phone || "",
  gstin: c.gstin || "",
  address: c.address || "",
});

export const fromCustomerList = (data) => asList(data).map(fromCustomer);

export const fromSaleLine = (l = {}) => ({
  id: String(l.id ?? ""),
  variant: idOf(l.variant),
  sku: l.sku || l.variant_sku || nameOf(l.variant) || "",
  name: l.product_name || l.name || "",
  quantity: l.quantity ?? "",
  unitPrice: l.unit_price ?? l.retail_price ?? "",
  discount: l.line_discount ?? "",
  total: l.line_total ?? l.total ?? "",
});

export const fromSale = (s = {}) => ({
  id: s.id,
  invoiceNumber: s.invoice_number || "",
  date: s.created_at || s.sale_date || s.invoice_date || "",
  branchId: idOf(s.branch),
  branchName: s.branch_name || nameOf(s.branch),
  customerName: s.customer_name || nameOf(s.customer) || "Walk-in",
  total: s.grand_total ?? s.total_amount ?? s.total ?? "",
  billDiscount: s.bill_discount ?? "",
  status: s.status || "",
  lines: (s.lines || []).map(fromSaleLine),
  payments: (s.payments || []).map((p) => ({
    method: p.method || "",
    amount: p.amount ?? "",
    reference: p.reference || "",
  })),
});

export const fromSaleList = (data, page = 1) => {
  const rows = asList(data).map(fromSale);
  const total = data?.count ?? rows.length;
  return {
    rows,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / BILL_PAGE_SIZE)),
  };
};

// Products with variants -> sellable items (one per active variant)
export const toSellable = (products) =>
  products
    .filter((p) => p.isActive)
    .flatMap((p) =>
      p.variants
        .filter((v) => v.isActive)
        .map((v) => ({
          id: String(v.id),
          sku: v.sku,
          barcode: v.barcode,
          name: p.name,
          detail: [v.shade, v.size, v.color].filter(Boolean).join(" / "),
          price: Number(p.retailPrice) || 0,
        }))
    );