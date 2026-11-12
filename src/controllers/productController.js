import * as productService from "../services/productService";
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