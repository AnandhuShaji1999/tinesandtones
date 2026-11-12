import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

export const getProducts = async (params) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.LIST, {
    params,
  });
  return data;
};

export const getProduct = async (id) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
  return data;
};

export const createProduct = async (payload) => {
  const { data } = await axiosInstance.post(
    API_ENDPOINTS.PRODUCTS.CREATE,
    payload
  );
  return data;
};

export const updateProduct = async (id, payload) => {
  const { data } = await axiosInstance.patch(
    API_ENDPOINTS.PRODUCTS.DETAIL(id),
    payload
  );
  return data;
};

export const deactivateProduct = async (id) => {
  await axiosInstance.delete(API_ENDPOINTS.PRODUCTS.DETAIL(id));
};