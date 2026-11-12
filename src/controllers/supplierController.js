import * as supplierService from "../services/supplierService";
import { parseApiError } from "../models/authModel";
import { PAGE_SIZE } from "../models/categoryModel";
import {
  toCreateSupplierPayload,
  toUpdateSupplierPayload,
  fromSupplier,
  fromSupplierList,
} from "../models/supplierModel";

export const listSuppliers = async ({ search = "", page = 1 } = {}) => {
  try {
    const data = await supplierService.getSuppliers({
      search,
      page,
      page_size: PAGE_SIZE,
    });
    return fromSupplierList(data, page);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load suppliers"));
  }
};

// Active suppliers for dropdowns (returns [] on failure)
export const listSupplierOptions = async () => {
  try {
    const data = await supplierService.getSuppliers({ page: 1, page_size: 100 });
    return fromSupplierList(data, 1)
      .rows.filter((s) => s.isActive)
      .map((s) => ({ value: String(s.id), label: `${s.code} - ${s.name}` }));
  } catch {
    return [];
  }
};

export const createSupplier = async (form) => {
  try {
    return fromSupplier(
      await supplierService.createSupplier(toCreateSupplierPayload(form))
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not create supplier"));
  }
};

export const updateSupplier = async (id, form) => {
  try {
    return fromSupplier(
      await supplierService.updateSupplier(id, toUpdateSupplierPayload(form))
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not update supplier"));
  }
};

export const deactivateSupplier = async (id) => {
  try {
    await supplierService.deactivateSupplier(id);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not deactivate supplier"));
  }
};