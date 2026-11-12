import * as billingService from "../services/billingService";
import * as productService from "../services/productService";
import { parseApiError } from "../models/authModel";
import { fromProductList } from "../models/productModel";
import {
  BILL_PAGE_SIZE,
  toSalePayload,
  toCustomerPayload,
  toGstPayload,
  toSellable,
  fromSale,
  fromSaleList,
  fromCustomer,
  fromCustomerList,
} from "../models/billingModel";

/* Items */
export const searchSellable = async (q = "") => {
  try {
    const data = await productService.getProducts({
      search: q,
      page: 1,
      page_size: 20,
    });
    return toSellable(fromProductList(data, 1).rows);
  } catch {
    return [];
  }
};

/* Customers */
export const listCustomers = async (search = "") => {
  try {
    return fromCustomerList(await billingService.getCustomers({ search }));
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load customers"));
  }
};

export const createCustomer = async (form) => {
  try {
    return fromCustomer(
      await billingService.createCustomer(toCustomerPayload(form))
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not create customer"));
  }
};

/* Sales */
export const checkout = async (data, idempotencyKey) => {
  try {
    return fromSale(
      await billingService.createSale(toSalePayload(data), idempotencyKey)
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not complete the sale"));
  }
};

export const listSales = async ({ branch = "", page = 1 } = {}) => {
  try {
    const params = { page, page_size: BILL_PAGE_SIZE };
    if (branch) params.branch = branch;
    return fromSaleList(await billingService.getSales(params), page);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load sales"));
  }
};

export const getSale = async (id) => {
  try {
    return fromSale(await billingService.getSale(id));
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load sale"));
  }
};

export const findInvoice = async (invoiceNumber) => {
  try {
    return fromSale(await billingService.lookupInvoice(invoiceNumber.trim()));
  } catch (err) {
    if (err.response?.status === 404) throw new Error("Invoice not found");
    throw new Error(parseApiError(err, "Could not look up invoice"));
  }
};

// Downloads the printable PDF
export const downloadSalePdf = async (id, invoiceNumber) => {
  try {
    const blob = await billingService.getSalePdf(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoiceNumber || id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not download the PDF"));
  }
};

/* Branch GST */
export const enableGst = async (branchId, form) => {
  try {
    return await billingService.updateBranch(branchId, toGstPayload(form));
  } catch (err) {
    throw new Error(parseApiError(err, "Could not enable GST"));
  }
};