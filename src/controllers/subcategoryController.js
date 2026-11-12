import * as subcategoryService from "../services/subcategoryService";
import { parseApiError } from "../models/authModel";
import { PAGE_SIZE } from "../models/categoryModel";
import {
  toCreateSubcategoryPayload,
  toUpdateSubcategoryPayload,
  fromSubcategory,
  fromSubcategoryList,
} from "../models/subcategoryModel";

export const listSubcategories = async ({
  category = "",
  search = "",
  page = 1,
} = {}) => {
  try {
    const data = await subcategoryService.getSubcategories({
      category,
      search,
      page,
      page_size: PAGE_SIZE,
    });
    return fromSubcategoryList(data, page, PAGE_SIZE);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load subcategories"));
  }
};

// Active subcategories of one category for dropdowns (returns [] on failure)
export const listSubcategoryOptions = async (category) => {
  if (!category) return [];
  try {
    const data = await subcategoryService.getSubcategories({
      category,
      page: 1,
      page_size: 100,
    });
    return fromSubcategoryList(data, 1, 100)
      .rows.filter((s) => s.isActive)
      .map((s) => ({ value: String(s.id), label: s.name }));
  } catch {
    return [];
  }
};

export const createSubcategory = async (form) => {
  try {
    return fromSubcategory(
      await subcategoryService.createSubcategory(
        toCreateSubcategoryPayload(form)
      )
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not create subcategory"));
  }
};

export const updateSubcategory = async (id, form) => {
  try {
    return fromSubcategory(
      await subcategoryService.updateSubcategory(
        id,
        toUpdateSubcategoryPayload(form)
      )
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not update subcategory"));
  }
};

export const deactivateSubcategory = async (id) => {
  try {
    await subcategoryService.deactivateSubcategory(id);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not deactivate subcategory"));
  }
};