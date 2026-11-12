import * as brandService from "../services/brandService";
import { parseApiError } from "../models/authModel";
import { PAGE_SIZE } from "../models/categoryModel";
import {
  toBrandPayload,
  fromBrand,
  fromBrandList,
} from "../models/brandModel";

export const listBrands = async ({ search = "", page = 1 } = {}) => {
  try {
    const data = await brandService.getBrands({
      search,
      page,
      page_size: PAGE_SIZE,
    });
    return fromBrandList(data, page);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load brands"));
  }
};

// Active brands for dropdowns, e.g. Add Product (returns [] on failure)
export const listBrandOptions = async () => {
  try {
    const data = await brandService.getBrands({ page: 1, page_size: 100 });
    return fromBrandList(data, 1)
      .rows.filter((b) => b.isActive)
      .map((b) => ({ value: String(b.id), label: b.name }));
  } catch {
    return [];
  }
};

export const createBrand = async (form) => {
  try {
    return fromBrand(await brandService.createBrand(toBrandPayload(form)));
  } catch (err) {
    throw new Error(parseApiError(err, "Could not create brand"));
  }
};

export const updateBrand = async (id, form) => {
  try {
    return fromBrand(
      await brandService.updateBrand(id, toBrandPayload(form))
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not update brand"));
  }
};

export const deactivateBrand = async (id) => {
  try {
    await brandService.deactivateBrand(id);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not deactivate brand"));
  }
};