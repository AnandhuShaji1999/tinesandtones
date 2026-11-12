import { PAGE_SIZE } from "./categoryModel";

export const toBrandPayload = (form) => ({
  name: form.name.trim(),
});

const asList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

export const fromBrand = (b = {}) => ({
  id: b.id,
  name: b.name || "",
  isActive: b.is_active !== false,
});

export const fromBrandList = (data, page = 1) => {
  const rows = asList(data).map(fromBrand);
  const total = data?.count ?? rows.length;
  return {
    rows,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
};