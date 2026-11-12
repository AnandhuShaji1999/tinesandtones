import * as variantService from "../services/variantService";
import { parseApiError } from "../models/authModel";
import { PAGE_SIZE } from "../models/categoryModel";
import {
  toCreateVariantPayload,
  toUpdateVariantPayload,
  fromVariant,
  fromVariantList,
} from "../models/variantModel";

export const listVariants = async ({
  product = "",
  search = "",
  page = 1,
} = {}) => {
  try {
    const data = await variantService.getVariants({
      product,
      search,
      page,
      page_size: PAGE_SIZE,
    });
    return fromVariantList(data, page);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load variants"));
  }
};

// Active variants for dropdowns (returns [] on failure)
export const listVariantOptions = async () => {
  try {
    const data = await variantService.getVariants({ page: 1, page_size: 100 });
    return fromVariantList(data, 1)
      .rows.filter((v) => v.isActive)
      .map((v) => ({
        value: String(v.id),
        label: v.productName ? `${v.sku} - ${v.productName}` : v.sku,
      }));
  } catch {
    return [];
  }
};

export const createVariant = async (form) => {
  try {
    return fromVariant(
      await variantService.createVariant(toCreateVariantPayload(form))
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not create variant"));
  }
};

export const updateVariant = async (id, form) => {
  try {
    return fromVariant(
      await variantService.updateVariant(id, toUpdateVariantPayload(form))
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not update variant"));
  }
};

export const deactivateVariant = async (id) => {
  try {
    await variantService.deactivateVariant(id);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not deactivate variant"));
  }
};