export const SALES_CONTENT = {
  title: "Sales Management",
  subtitle: "Track bills, payments, and invoices across your branches.",
  addProduct: "New Sale",
  search: {
    placeholder: "Search invoice, customer or product",
    reset: "Reset",
    submit: "Search",
  },
  kindOptions: [
    { value: "", label: "All Documents" },
    { value: "receipt", label: "Receipt" },
    { value: "tax_invoice", label: "Tax Invoice" },
  ],
  methodOptions: [
    { value: "", label: "All Payments" },
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "card", label: "Card" },
  ],
  kindLabels: { receipt: "Receipt", tax_invoice: "Tax Invoice" },
  columns: ["Invoice", "Customer", "Branch", "Items", "Payment", "Total", "Date", "Type"],
  empty: "No sales found.",
};