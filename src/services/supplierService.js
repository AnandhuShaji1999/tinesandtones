import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

export const getSuppliers = async (params) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.SUPPLIERS.LIST, {
    params,
  });
  return data;
};

export const getSupplier = async (id) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.SUPPLIERS.DETAIL(id));
  return data;
};

export const createSupplier = async (payload) => {
  const { data } = await axiosInstance.post(
    API_ENDPOINTS.SUPPLIERS.CREATE,
    payload
  );
  return data;
};

export const updateSupplier = async (id, payload) => {
  const { data } = await axiosInstance.patch(
    API_ENDPOINTS.SUPPLIERS.DETAIL(id),
    payload
  );
  return data;
};

export const deactivateSupplier = async (id) => {
  await axiosInstance.delete(API_ENDPOINTS.SUPPLIERS.DETAIL(id));
};