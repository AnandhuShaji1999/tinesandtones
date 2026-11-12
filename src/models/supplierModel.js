import { PAGE_SIZE } from "./categoryModel";

const clean = (form) => ({
  code: form.code.trim(),
  name: form.name.trim(),
  contact_name: form.contactName.trim(),
  phone: form.phone.trim(),
  email: form.email.trim(),
  address: form.address.trim(),
  state_code: form.stateCode.trim(),
});

export const toCreateSupplierPayload = (form) => clean(form);
export const toUpdateSupplierPayload = (form) => clean(form);

const asList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

export const fromSupplier = (s = {}) => ({
  id: s.id,
  code: s.code || "",
  name: s.name || "",
  contactName: s.contact_name || "",
  phone: s.phone || "",
  email: s.email || "",
  address: s.address || "",
  stateCode: s.state_code || "",
  isActive: s.is_active !== false,
});

export const fromSupplierList = (data, page = 1) => {
  const rows = asList(data).map(fromSupplier);
  const total = data?.count ?? rows.length;
  return {
    rows,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
};