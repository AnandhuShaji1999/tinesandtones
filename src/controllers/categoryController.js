import * as categoryService from "../services/categoryService";
import { parseApiError } from "../models/authModel";
import {
  PAGE_SIZE,
  toCategoryPayload,
  fromCategory,
  fromCategoryList,
} from "../models/categoryModel";

export const listCategories = async ({ search = "", page = 1 } = {}) => {
  try {
    const data = await categoryService.getCategories({
      search,
      page,
      page_size: PAGE_SIZE,
    });
    return fromCategoryList(data, page);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load categories"));
  }
};

// Active categories for dropdowns (returns [] on failure)
export const listCategoryOptions = async () => {
  try {
    const data = await categoryService.getCategories({
      page: 1,
      page_size: 100,
    });
    return fromCategoryList(data, 1)
      .rows.filter((c) => c.isActive)
      .map((c) => ({ value: String(c.id), label: c.name }));
  } catch {
    return [];
  }
};

export const createCategory = async (form) => {
  try {
    return fromCategory(
      await categoryService.createCategory(toCategoryPayload(form))
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not create category"));
  }
};

export const updateCategory = async (id, form) => {
  try {
    return fromCategory(
      await categoryService.updateCategory(id, toCategoryPayload(form))
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not update category"));
  }
};

export const deactivateCategory = async (id) => {
  try {
    await categoryService.deactivateCategory(id);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not deactivate category"));
  }
};