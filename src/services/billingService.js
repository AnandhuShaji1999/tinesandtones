import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

/* Customers */
export const getCustomers = async (params) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.POS_CUSTOMERS.LIST, {
    params,
  });
  return data;
};

export const createCustomer = async (payload) => {
  const { data } = await axiosInstance.post(
    API_ENDPOINTS.POS_CUSTOMERS.CREATE,
    payload
  );
  return data;
};

export const updateCustomer = async (id, payload) => {
  const { data } = await axiosInstance.patch(
    API_ENDPOINTS.POS_CUSTOMERS.DETAIL(id),
    payload
  );
  return data;
};

/* Sales */
export const createSale = async (payload, idempotencyKey) => {
  const { data } = await axiosInstance.post(
    API_ENDPOINTS.POS_SALES.CREATE,
    payload,
    { headers: { "Idempotency-Key": idempotencyKey } }
  );
  return data;
};

export const getSales = async (params) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.POS_SALES.LIST, {
    params,
  });
  return data;
};

export const lookupInvoice = async (invoiceNumber) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.POS_SALES.LOOKUP, {
    params: { invoice_number: invoiceNumber },
  });
  return data;
};

export const getSale = async (id) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.POS_SALES.DETAIL(id));
  return data;
};

export const getSalePdf = async (id) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.POS_SALES.PDF(id), {
    responseType: "blob",
  });
  return data;
};

/* Branch GST (business admin only) */
export const updateBranch = async (id, payload) => {
  const { data } = await axiosInstance.patch(
    API_ENDPOINTS.BRANCHES.DETAIL(id),
    payload
  );
  return data;
};