export const PAGE_SIZE = 10;

const TONES = ["tan", "slate", "lilac", "sand", "mint"];

const METHOD_LABELS = { cash: "Cash", upi: "UPI", card: "Card" };

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "WI";
  const first = parts[0][0] || "";
  const second =
    parts.length > 1 ? parts[parts.length - 1][0] : parts[0][1] || "";
  return (first + second).toUpperCase();
};

export const formatMoney = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatDate = (iso = "") =>
  iso ? iso.split("-").reverse().join("/") : "-";

const methodLabel = (m = "") =>
  METHOD_LABELS[m] || m.charAt(0).toUpperCase() + m.slice(1);

// API sale object -> table row
export const fromSale = (s) => {
  const lines = s.lines || [];
  const methods = [...new Set((s.payments || []).map((p) => p.method))];
  const customer = s.customer_snapshot?.name?.trim() || "Walk-in Customer";

  return {
    id: s.id,
    invoice: s.invoice_number || `#${s.id}`,
    customer,
    initials: getInitials(s.customer_snapshot?.name || ""),
    tone: TONES[Number(s.id) % TONES.length],
    branch: s.branch_snapshot?.name || "-",
    items: lines.reduce((sum, l) => sum + Number(l.quantity || 0), 0),
    products: lines.map((l) => `${l.product_name || ""} ${l.sku || ""}`).join(" "),
    methods,
    paymentLabel: methods.length ? methods.map(methodLabel).join(", ") : "-",
    totalValue: Number(s.grand_total || 0),
    total: formatMoney(s.grand_total),
    kind: s.document_kind || "receipt",
    date: (s.created_at || "").slice(0, 10),
  };
};

export const fromSaleList = (data) => {
  const list = Array.isArray(data) ? data : data?.results ?? [];
  return list.map(fromSale).sort((a, b) => b.id - a.id);
};

export const buildStats = (rows) => {
  const revenue = rows.reduce((sum, r) => sum + r.totalValue, 0);
  const taxInvoices = rows.filter((r) => r.kind === "tax_invoice").length;
  const receipts = rows.filter((r) => r.kind === "receipt").length;

  return [
    { id: 1, label: "Total Sales", value: rows.length.toLocaleString("en-IN"), sub: { text: "Bills created" } },
    { id: 2, label: "Total Revenue", value: formatMoney(revenue), sub: { text: "Sum of all bill totals" } },
    { id: 3, label: "Tax Invoices", value: taxInvoices.toLocaleString("en-IN"), sub: { text: "GST bills" } },
    { id: 4, label: "Receipts", value: receipts.toLocaleString("en-IN"), sub: { text: "Non-GST bills" } },
  ];
};

export const buildBranchOptions = (rows) => [
  { value: "", label: "All Branches" },
  ...[...new Set(rows.map((r) => r.branch).filter((b) => b && b !== "-"))].map(
    (b) => ({ value: b, label: b })
  ),
];

export const filterSales = (rows, f = {}) => {
  const q = (f.search || "").trim().toLowerCase();
  return rows.filter(
    (r) =>
      (!q ||
        r.invoice.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.products.toLowerCase().includes(q)) &&
      (!f.kind || r.kind === f.kind) &&
      (!f.method || r.methods.includes(f.method)) &&
      (!f.branch || r.branch === f.branch)
  );
};