export const GST_RATES = [
  { value: "0.00", label: "0%" },
  { value: "5.00", label: "5%" },
  { value: "12.00", label: "12%" },
  { value: "18.00", label: "18%" },
  { value: "28.00", label: "28%" },
];

export const PRODUCT_PAGE_SIZE = 10;

// The backend rejects a blank HSN/SAC code, and the Add Product form no
// longer asks for it, so this default is sent instead. Change it if needed.
export const DEFAULT_HSN = "330499";

const money = (v) => Number(v).toFixed(2);

// The scanned barcode is sent as product_code (the backend requires it).
// The barcode itself is saved on the variant by createProductWithBarcode.
export const toCreateProductPayload = (form) => {
  const payload = {
    product_code: form.barcode.trim(),
    name: form.name.trim(),
    category: form.category,
    description: form.description.trim(),
    hsn_sac_code: (form.hsn || "").trim() || DEFAULT_HSN,
    gst_rate: form.gstRate,
    default_purchase_cost: money(form.purchasePrice),
    retail_price: money(form.retailPrice),
    expiry_tracked: Boolean(form.expiryTracked),
  };
  if (form.subcategory) payload.subcategory = form.subcategory;
  if (form.brand) payload.brand = form.brand;
  return payload;
};

// Cost is skipped when the API did not return it (cashier accounts)
export const toUpdateProductPayload = (form) => {
  const payload = {
    name: form.name.trim(),
    description: form.description.trim(),
    hsn_sac_code: (form.hsn || "").trim() || DEFAULT_HSN,
    gst_rate: Number(form.gstRate).toFixed(2),
    retail_price: money(form.retailPrice),
    expiry_tracked: Boolean(form.expiryTracked),
  };
  if (form.hasCost) payload.default_purchase_cost = money(form.purchasePrice);
  return payload;
};

const nameOf = (v, fallback = "") =>
  v && typeof v === "object" ? v.name || fallback : fallback;

const idOf = (v) => String(v && typeof v === "object" ? v.id : v ?? "");

export const fromVariant = (v = {}) => ({
  id: v.id,
  sku: v.sku || "",
  barcode: v.barcode || "",
  shade: v.shade || "",
  size: v.size || "",
  color: v.color || "",
  isActive: v.is_active !== false,
});

export const fromProduct = (p = {}) => ({
  id: p.id,
  code: p.product_code || "",
  name: p.name || "",
  description: p.description || "",
  hsn: p.hsn_sac_code || "",
  gstRate: p.gst_rate != null ? Number(p.gst_rate).toFixed(2) : "",
  hasCost: p.default_purchase_cost !== undefined,
  purchaseCost: p.default_purchase_cost ?? "",
  retailPrice: p.retail_price ?? "",
  expiryTracked: Boolean(p.expiry_tracked),
  categoryId: idOf(p.category),
  categoryName: p.category_name || nameOf(p.category),
  subcategoryId: idOf(p.subcategory),
  subcategoryName: p.subcategory_name || nameOf(p.subcategory),
  brandId: idOf(p.brand),
  brandName: p.brand_name || nameOf(p.brand),
  isActive: p.is_active !== false,
  variants: (p.variants || []).map(fromVariant),
});

const asList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

export const fromProductList = (data, page = 1) => {
  const rows = asList(data).map(fromProduct);
  const total = data?.count ?? rows.length;
  return {
    rows,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PRODUCT_PAGE_SIZE)),
  };
};

export const formatINR = (v) =>
  v === "" || v == null
    ? "-"
    : `₹${Number(v).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;