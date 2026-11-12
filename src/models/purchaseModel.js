import { PAGE_SIZE } from "./categoryModel";

export const PRICE_MODES = [
  { value: "exclusive", label: "Exclusive of GST" },
  { value: "inclusive", label: "Inclusive of GST" },
];

export const TAX_TREATMENTS = [
  { value: "intra_state", label: "Intra-state (CGST + SGST)" },
  { value: "inter_state", label: "Inter-state (IGST)" },
  { value: "none", label: "No GST" },
];

export const GST_OPTIONS = ["0.00", "5.00", "12.00", "18.00", "28.00"];

export const EMPTY_LINE = {
  id: "",
  variant: "",
  quantity: "",
  unitPrice: "",
  gstRate: "18.00",
  batchCode: "",
  expiry: "",
};

const money = (v) => Number(v).toFixed(2);

const lineToApi = (l, noGst, withId) => {
  const line = {
    variant: l.variant,
    quantity: Number(l.quantity),
    unit_price: money(l.unitPrice),
    gst_rate: noGst ? "0.00" : money(l.gstRate || 0),
    manufacturer_batch_code: l.batchCode.trim(),
  };
  if (l.expiry) line.expiry_date = l.expiry;
  if (withId && l.id) line.id = l.id;
  return line;
};

export const toCreatePurchasePayload = (form, lines) => {
  const noGst = form.taxTreatment === "none";
  return {
    branch: form.branch,
    supplier: form.supplier,
    bill_number: form.billNumber.trim(),
    bill_date: form.billDate,
    price_mode: form.priceMode,
    tax_treatment: form.taxTreatment,
    lines: lines.map((l) => lineToApi(l, noGst, false)),
  };
};

// Lines replace the full current set; version must be the latest
export const toUpdatePurchasePayload = (version, taxTreatment, lines) => ({
  version: String(version),
  lines: lines.map((l) => lineToApi(l, taxTreatment === "none", true)),
});

// Client-side estimate (the server's figures are final)
export const lineAmounts = (l, priceMode, taxTreatment) => {
  const qty = Number(l.quantity) || 0;
  const price = Number(l.unitPrice) || 0;
  const rate = taxTreatment === "none" ? 0 : Number(l.gstRate) || 0;
  const gross = qty * price;
  let taxable;
  let gst;
  if (priceMode === "inclusive") {
    taxable = gross / (1 + rate / 100);
    gst = gross - taxable;
  } else {
    taxable = gross;
    gst = (gross * rate) / 100;
  }
  return { taxable, gst, total: taxable + gst };
};

export const computeTotals = (lines, priceMode, taxTreatment) =>
  lines.reduce(
    (acc, l) => {
      const a = lineAmounts(l, priceMode, taxTreatment);
      return {
        taxable: acc.taxable + a.taxable,
        gst: acc.gst + a.gst,
        total: acc.total + a.total,
        units: acc.units + (Number(l.quantity) || 0),
      };
    },
    { taxable: 0, gst: 0, total: 0, units: 0 }
  );

const idOf = (v) => String(v && typeof v === "object" ? v.id : v ?? "");
const nameOf = (v) => (v && typeof v === "object" ? v.name || "" : "");

export const fromLine = (l = {}) => ({
  id: String(l.id ?? ""),
  variant: idOf(l.variant),
  variantLabel: l.variant_sku || l.sku || nameOf(l.variant) || "",
  quantity: l.quantity ?? "",
  unitPrice: l.unit_price ?? "",
  gstRate: l.gst_rate != null ? Number(l.gst_rate).toFixed(2) : "0.00",
  batchCode: l.manufacturer_batch_code || "",
  expiry: l.expiry_date || "",
  batch: l.batch ?? "",
});

export const fromPurchase = (p = {}) => ({
  id: p.id,
  version: p.version,
  branchId: idOf(p.branch),
  branchName: p.branch_name || nameOf(p.branch),
  supplierId: idOf(p.supplier),
  supplierName: p.supplier_name || nameOf(p.supplier),
  billNumber: p.bill_number || "",
  billDate: p.bill_date || "",
  priceMode: p.price_mode || "exclusive",
  taxTreatment: p.tax_treatment || "intra_state",
  total: p.grand_total ?? p.total_amount ?? p.total ?? "",
  lines: (p.lines || []).map(fromLine),
});

const asList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

export const fromPurchaseList = (data, page = 1) => {
  const rows = asList(data).map(fromPurchase);
  const total = data?.count ?? rows.length;
  return {
    rows,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
};

export const fromRevisions = (data) => asList(data);

export const formatINR = (v) =>
  v === "" || v == null
    ? "-"
    : `₹${Number(v).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;