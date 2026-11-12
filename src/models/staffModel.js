export const STAFF_ROLES = [
  { value: "manager", label: "Manager" },
  { value: "cashier", label: "Cashier" },
  { value: "inventory", label: "Inventory" },
];

export const toCreateStaffPayload = (form) => ({
  email: form.email.trim(),
  password: form.password,
  first_name: form.firstName.trim(),
  last_name: form.lastName.trim(),
  branch: form.branch,
  role: form.role,
});

const asList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

export const fromStaff = (s = {}) => {
  const memberships = s.memberships || s.branches || [];
  const first = memberships[0] || {};
  const branchName =
    first.branch_name ||
    (typeof first.branch === "object" ? first.branch?.name : "") ||
    "";
  return {
    id: s.id,
    email: s.email || "",
    firstName: s.first_name || "",
    lastName: s.last_name || "",
    fullName:
      [s.first_name, s.last_name].filter(Boolean).join(" ") || s.email || "",
    isActive: s.is_active !== false,
    role: first.role || s.role || "",
    branch: branchName,
  };
};

export const fromStaffList = (data) => ({
  rows: asList(data).map(fromStaff),
  total: data?.count ?? asList(data).length,
});

export const fromBranchList = (data) =>
  asList(data).map((b) => ({
    value: String(b.id),
    label: b.name || b.code || `Branch ${b.id}`,
  }));