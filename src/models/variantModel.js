import { PAGE_SIZE } from "./categoryModel";

// The form has no SKU field. The backend requires one, so the barcode is sent as the SKU.
export const toCreateVariantPayload = (form) => {
  const barcode = form.barcode.trim();
  return {
    product: form.product,
    sku: barcode,
    barcode,
    shade: form.shade.trim(),
    size: form.size.trim(),
    color: form.color.trim(),
  };
};

// SKU and product are fixed after creation
export const toUpdateVariantPayload = (form) => ({
  barcode: form.barcode.trim(),
  shade: form.shade.trim(),
  size: form.size.trim(),
  color: form.color.trim(),
});

const asList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

export const fromVariant = (v = {}) => {
  const p = v.product;
  const isObj = p && typeof p === "object";
  return {
    id: v.id,
    productId: String(isObj ? p.id : p ?? ""),
    productName: v.product_name || (isObj ? p.name : "") || "",
    sku: v.sku || "",
    barcode: v.barcode || "",
    shade: v.shade || "",
    size: v.size || "",
    color: v.color || "",
    isActive: v.is_active !== false,
  };
};

export const fromVariantList = (data, page = 1) => {
  const rows = asList(data).map(fromVariant);
  const total = data?.count ?? rows.length;
  return {
    rows,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
};