const ROLE_LABELS = {
  manager: "Manager",
  cashier: "Cashier",
  inventory: "Inventory",
};

export const roleLabel = (r) => ROLE_LABELS[r] || (r ? String(r) : "");

export const fromProfile = (d = {}) => {
  const first = d.first_name || "";
  const last = d.last_name || "";
  const fullName = [first, last].filter(Boolean).join(" ") || d.email || "";
  const initials =
    ([first, last].filter(Boolean).map((w) => w[0]).join("") ||
      (d.email || "?")[0]).toUpperCase().slice(0, 2);

  const memberships = (d.memberships || []).map((m) => ({
    branchId: String(m.branch ?? ""),
    branchName: m.branch_name || `Branch ${m.branch}`,
    role: m.role || "",
    roleLabel: roleLabel(m.role),
  }));

  const isAdmin = Boolean(d.is_business_admin);

  return {
    id: d.id,
    email: d.email || "",
    firstName: first,
    lastName: last,
    fullName,
    initials,
    isActive: d.is_active !== false,
    isAdmin,
    joined: d.date_joined || "",
    memberships,
    // Short text for the topbar
    roleText: isAdmin
      ? "Business Admin"
      : memberships[0]?.roleLabel || "Staff",
  };
};

export const toPasswordPayload = ({ current, next }) => ({
  current_password: current,
  new_password: next,
});

export const formatJoined = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? String(v)
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};