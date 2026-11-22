import * as productService from "../services/productService";
import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";
import { parseApiError } from "../models/authModel";
import {
  BARCODE_MAX_QTY,
  BARCODE_MIN_QTY,
  PRODUCT_PAGE_SIZE,
  toCreateProductPayload,
  toUpdateProductPayload,
  fromProduct,
  fromProductList,
  fromBarcodeLabels,
} from "../models/productModel";

// Empty filters are not sent (an empty "barcode=" would match nothing)
export const listProducts = async ({
  search = "",
  category = "",
  subcategory = "",
  brand = "",
  barcode = "",
  page = 1,
} = {}) => {
  const params = { page, page_size: PRODUCT_PAGE_SIZE };
  if (search) params.search = search;
  if (category) params.category = category;
  if (subcategory) params.subcategory = subcategory;
  if (brand) params.brand = brand;
  if (barcode) params.barcode = barcode;

  try {
    const data = await productService.getProducts(params);
    return fromProductList(data, page);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load products"));
  }
};

// Active products for dropdowns (returns [] on failure)
export const listProductOptions = async () => {
  try {
    const data = await productService.getProducts({ page: 1, page_size: 100 });
    return fromProductList(data, 1)
      .rows.filter((p) => p.isActive)
      .map((p) => ({ value: String(p.id), label: `${p.code} - ${p.name}` }));
  } catch {
    return [];
  }
};

export const getProduct = async (id) => {
  try {
    return fromProduct(await productService.getProduct(id));
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load product"));
  }
};

// Exact lookup of a scanned barcode (product barcodes and saved variant barcodes)
export const lookupBarcode = async (barcode) => {
  const code = String(barcode || "").trim();
  if (!code) return [];
  try {
    const data = await productService.getProducts({
      barcode: code,
      page: 1,
      page_size: 20,
    });
    return fromProductList(data, 1).rows;
  } catch (err) {
    throw new Error(parseApiError(err, "Could not look up the barcode"));
  }
};

// One entry per label to print (quantity 1 to 1000)
export const loadBarcodeLabels = async (productId, quantity) => {
  const n = Number(quantity);
  if (!Number.isInteger(n) || n < BARCODE_MIN_QTY || n > BARCODE_MAX_QTY) {
    throw new Error(
      `Use a whole number between ${BARCODE_MIN_QTY} and ${BARCODE_MAX_QTY}.`
    );
  }
  try {
    return fromBarcodeLabels(
      await productService.getBarcodeLabels(productId, n)
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load barcode labels"));
  }
};

export const createProduct = async (form) => {
  try {
    return fromProduct(
      await productService.createProduct(toCreateProductPayload(form))
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not create product"));
  }
};

// Creates the product (the backend generates its barcode), then a default
// variant so the product can be sold in Billing. Returns the saved product.
export const createProductWithVariant = async (form) => {
  const product = await createProduct(form);

  try {
    await axiosInstance.post(API_ENDPOINTS.VARIANTS.CREATE, {
      product: product.id,
      sku: product.code,
    });
  } catch (err) {
    throw new Error(
      `Product was saved, but its default variant was not: ${parseApiError(
        err,
        "Could not create variant"
      )}. Add the variant on the Variants page.`
    );
  }
  return product;
};

export const updateProduct = async (id, form) => {
  try {
    return fromProduct(
      await productService.updateProduct(id, toUpdateProductPayload(form))
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not update product"));
  }
};

export const deactivateProduct = async (id) => {
  try {
    await productService.deactivateProduct(id);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not deactivate product"));
  }
};