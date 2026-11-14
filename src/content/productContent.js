export const PRODUCT_CONTENT = {
  title: "Add New Product",
  subtitle: "Enter comprehensive product specifications, pricing, and tax details.",
  basic: {
    title: "Basic Information",
    barcode: { label: "Barcode", placeholder: "Scan or enter barcode" },
    name: { label: "Product Name", placeholder: "Enter product name" },
    category: { label: "Category", placeholder: "Select category" },
    subcategory: {
      label: "Subcategory",
      placeholder: "Select subcategory",
      selectCategoryFirst: "Select category first",
    },
    description: { label: "Description", placeholder: "Detailed product description..." },
    hsn: { label: "HSN/SAC Code", placeholder: "e.g. 330499" },
  },
  details: {
    title: "Product Details",
    brand: { label: "Brand", placeholder: "Select brand" },
    expiry: {
      label: "Expiry Tracking",
      text: "Track expiry dates for this product",
    },
  },
  pricing: {
    title: "Pricing & Taxation",
    gst: { label: "GST Rate", placeholder: "Select GST rate" },
    purchase: { label: "Purchase Price (₹)", placeholder: "0.00" },
    retail: { label: "Retail Price (₹, GST inclusive)", placeholder: "0.00" },
  },
  cancel: "Cancel",
  save: "Save Product",
  saving: "Saving...",
  saved: "Product saved. Scan the next barcode.",
};