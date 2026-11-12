import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

export const getBrands = async (params) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.BRANDS.LIST, {
    params,
  });
  return data;
};

export const createBrand = async (payload) => {
  const { data } = await axiosInstance.post(
    API_ENDPOINTS.BRANDS.CREATE,
    payload
  );
  return data;
};

export const updateBrand = async (id, payload) => {
  const { data } = await axiosInstance.patch(
    API_ENDPOINTS.BRANDS.DETAIL(id),
    payload
  );
  return data;
};

export const deactivateBrand = async (id) => {
  await axiosInstance.delete(API_ENDPOINTS.BRANDS.DETAIL(id));
};