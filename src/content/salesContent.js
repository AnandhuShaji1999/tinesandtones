export const SALES_CONTENT = {
  title: "Inventory Management",
  subtitle: "Monitor stock levels, product movement, and replenishment across your branches.",
  addProduct: "Add New Product",
  search: {
    placeholder: "Search product, SKU or category",
    reset: "Reset",
    submit: "Search",
  },
  categoryOptions: [
    { value: "", label: "All Categories" },
    { value: "Linens", label: "Linens" },
    { value: "Kitchenware", label: "Kitchenware" },
    { value: "Furniture", label: "Furniture" },
    { value: "Cleaning", label: "Cleaning" },
    { value: "Electrical", label: "Electrical" },
  ],
  statusOptions: [
    { value: "", label: "All Stock Status" },
    { value: "in", label: "In Stock" },
    { value: "low", label: "Low Stock" },
    { value: "out", label: "Out of Stock" },
  ],
  branchOptions: [
    { value: "", label: "All Branches" },
    { value: "Main Branch", label: "Main Branch" },
    { value: "North Branch", label: "North Branch" },
    { value: "South Branch", label: "South Branch" },
  ],
  statusLabels: { in: "In Stock", low: "Low Stock", out: "Out of Stock" },
  columns: ["Product", "SKU", "Category", "Branch", "Available", "Unit Cost", "Status", "Actions"],
  empty: "No products found.",
};

export const SALES_DATA = {
  total: 1284,
  stats: [
    { id: 1, label: "Total Products", value: "1,284", sub: { type: "trend", text: "8.2%", suffix: "vs. last month" } },
    { id: 2, label: "Inventory Value", value: "₹248,560", sub: { type: "trend", text: "4.6%", suffix: "vs. last month" } },
    { id: 3, label: "Low Stock Items", value: "24", sub: { type: "warn", text: "Needs attention", suffix: "across 3 branches" } },
    { id: 4, label: "Out of Stock", value: "8", sub: { type: "plain", text: "Review replenishment orders" } },
  ],
  rows: [
    { id: 1, initials: "CT", tone: "tan", name: "Classic Cotton Bath Towel", sku: "LIN-2048", category: "Linens", branch: "Main Branch", available: "128 pcs", cost: "₹18.50", status: "in" },
    { id: 2, initials: "PD", tone: "slate", name: 'Porcelain Dinner Plate, 10"', sku: "KIT-1182", category: "Kitchenware", branch: "North Branch", available: "36 pcs", cost: "₹12.75", status: "low" },
    { id: 3, initials: "AG", tone: "tan", name: "Amber Glass Water Carafe", sku: "KIT-0924", category: "Kitchenware", branch: "Main Branch", available: "84 pcs", cost: "₹9.20", status: "in" },
    { id: 4, initials: "QD", tone: "lilac", name: "Queen Duvet Cover Set", sku: "LIN-3105", category: "Linens", branch: "South Branch", available: "12 sets", cost: "₹64.00", status: "low" },
    { id: 5, initials: "OC", tone: "sand", name: "Oak Dining Chair", sku: "FUR-0441", category: "Furniture", branch: "Main Branch", available: "0 pcs", cost: "₹145.00", status: "out" },
    { id: 6, initials: "CS", tone: "mint", name: "Citrus Surface Cleaner, 1L", sku: "CLN-0720", category: "Cleaning", branch: "North Branch", available: "19 bottles", cost: "₹6.40", status: "low" },
    { id: 7, initials: "ST", tone: "slate", name: "Brushed Steel Serving Tray", sku: "KIT-1560", category: "Kitchenware", branch: "South Branch", available: "53 pcs", cost: "₹27.90", status: "in" },
    { id: 8, initials: "LB", tone: "tan", name: "LED Bedside Lamp", sku: "ELC-0328", category: "Electrical", branch: "Main Branch", available: "7 pcs", cost: "₹38.00", status: "low" },
  ],
};