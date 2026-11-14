import * as productService from "../services/productService";
import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";
import { parseApiError } from "../models/authModel";
import {
  PRODUCT_PAGE_SIZE,
  toCreateProductPayload,
  toUpdateProductPayload,
  fromProduct,
  fromProductList,
} from "../models/productModel";

export const listProducts = async ({
  search = "",
  category = "",
  subcategory = "",
  brand = "",
  page = 1,
} = {}) => {
  try {
    const data = await productService.getProducts({
      search,
      category,
      subcategory,
      brand,
      page,
      page_size: PRODUCT_PAGE_SIZE,
    });
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

export const createProduct = async (form) => {
  try {
    return fromProduct(
      await productService.createProduct(toCreateProductPayload(form))
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not create product"));
  }
};

// Barcode lives on the variant: check it, create the product, then its variant
export const createProductWithBarcode = async (form) => {
  const barcode = form.barcode.trim();

  let existing = [];
  try {
    const { data } = await axiosInstance.get(API_ENDPOINTS.VARIANTS.LIST, {
      params: { search: barcode },
    });
    existing = Array.isArray(data) ? data : data?.results || [];
  } catch {
    // If the check fails, the backend still rejects duplicates on save
  }
  if (existing.some((v) => v.barcode === barcode || v.sku === barcode)) {
    throw new Error("This barcode already exists.");
  }

  const product = await createProduct(form);

  try {
    await axiosInstance.post(API_ENDPOINTS.VARIANTS.CREATE, {
      product: product.id,
      sku: barcode,
      barcode,
    });
  } catch (err) {
    throw new Error(
      `Product was saved, but the barcode was not: ${parseApiError(
        err,
        "Could not save barcode"
      )}`
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