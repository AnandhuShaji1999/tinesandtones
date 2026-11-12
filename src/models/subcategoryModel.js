export const toCreateSubcategoryPayload = (form) => ({
  category: form.category,
  name: form.name.trim(),
});

// Per the API, only the name is updated
export const toUpdateSubcategoryPayload = (form) => ({
  name: form.name.trim(),
});

const asList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

export const fromSubcategory = (s = {}) => {
  const cat = s.category;
  const isObj = cat && typeof cat === "object";
  return {
    id: s.id,
    name: s.name || "",
    categoryId: String(isObj ? cat.id : cat ?? ""),
    categoryName: s.category_name || (isObj ? cat.name : "") || "",
    isActive: s.is_active !== false,
  };
};

export const fromSubcategoryList = (data, page = 1, pageSize = 10) => {
  const rows = asList(data).map(fromSubcategory);
  const total = data?.count ?? rows.length;
  return {
    rows,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  };
};