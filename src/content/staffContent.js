export const STAFF_CONTENT = {
  title: "Staff Management",
  subtitle: "Create staff accounts and assign them to a branch with a role.",
  form: {
    title: "Create Staff",
    firstName: { label: "First Name", placeholder: "Enter first name" },
    lastName: { label: "Last Name", placeholder: "Enter last name" },
    email: { label: "Email", placeholder: "staff@example.com" },
    password: { label: "Password", placeholder: "Enter password" },
    branch: { label: "Branch", placeholder: "Select branch" },
    branchId: { label: "Branch ID", placeholder: "Enter branch ID" },
    role: { label: "Role", placeholder: "Select role" },
    submit: "Create Staff",
    submitting: "Creating...",
    reset: "Reset",
    success: "Staff created successfully.",
  },
  list: {
    title: "Staff List",
    columns: ["Name", "Email", "Branch", "Role", "Status", "Actions"],
    empty: "No staff found.",
    deactivate: "Deactivate",
  },
};