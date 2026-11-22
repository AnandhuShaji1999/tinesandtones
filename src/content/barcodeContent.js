export const BARCODE_CONTENT = {
  title: "Barcode Labels",
  subtitle: "Find a product, choose how many labels you need, and print them.",
  scan: {
    title: "Scan a barcode",
    placeholder: "Scan or type a barcode, then press Enter",
    found: "Found",
    notFound: "No product found for this barcode.",
    several: "Several products match. The first one is selected.",
  },
  list: {
    title: "Products",
    search: "Search name, code, SKU or barcode",
    searchBtn: "Search",
    reset: "Reset",
    columns: ["Code", "Product", "Barcode", "Price", "Status", "Action"],
    empty: "No products found.",
    select: "Select",
    selected: "Selected",
  },
  print: {
    title: "Print labels",
    none: "Select a product from the list, or scan its barcode.",
    quantity: "Number of labels (1 to 1000)",
    perRow: "Labels per row",
    preview: "Preview",
    print: "Print",
    loading: "Loading...",
    badQty: "Use a whole number between 1 and 1000.",
    noBarcode:
      "This product has no barcode yet. Ask the backend developer to run the barcode migration.",
    hint: "Tip: in the print window, set margins to None or Default and scale to 100%.",
  },
};