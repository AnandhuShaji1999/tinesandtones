export const PURCHASE_CONTENT = {
  title: "Purchase Management",
  subtitle: "Monitor product movement, and replenishment across your branches.",
  details: {
    title: "Purchase Details",
    addSupplier: "Add Suppliers",
    branch: "Branch",
    supplier: "Supplier",
    billNo: "Purchase Bill No",
    date: "Purchase Date",
  },
  product: {
    title: "Product",
    searchPlaceholder: "Search product, SKU or category",
    addProduct: "Add New Product",
    name: "Product",
    qty: "QTY",
    price: "Price",
    gst: "GST",
  },
  columns: ["Product", "QTY", "Price", "GST", "Total", "Actions"],
  empty: "No products added yet.",
};

export const PURCHASE_OPTIONS = {
  suppliers: [
    { value: "", label: "" },
    { value: "supplier-1", label: "Supplier One" },
    { value: "supplier-2", label: "Supplier Two" },
    { value: "supplier-3", label: "Supplier Three" },
  ],
  gst: [
    { value: "", label: "" },
    { value: "0", label: "0%" },
    { value: "5", label: "5%" },
    { value: "12", label: "12%" },
    { value: "18", label: "18%" },
    { value: "28", label: "28%" },
  ],
};