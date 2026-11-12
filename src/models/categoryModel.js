export const PAGE_SIZE = 10;

export const toCategoryPayload = (form) => ({
  name: form.name.trim(),
});

const asList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

export const fromCategory = (c = {}) => ({
  id: c.id,
  name: c.name || "",
  isActive: c.is_active !== false,
});

export const fromCategoryList = (data, page = 1) => {
  const rows = asList(data).map(fromCategory);
  const total = data?.count ?? rows.length;
  return {
    rows,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
};