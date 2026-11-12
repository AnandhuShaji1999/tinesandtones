import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

export const getVariants = async (params) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.VARIANTS.LIST, {
    params,
  });
  return data;
};

export const createVariant = async (payload) => {
  const { data } = await axiosInstance.post(
    API_ENDPOINTS.VARIANTS.CREATE,
    payload
  );
  return data;
};

export const updateVariant = async (id, payload) => {
  const { data } = await axiosInstance.patch(
    API_ENDPOINTS.VARIANTS.DETAIL(id),
    payload
  );
  return data;
};

export const deactivateVariant = async (id) => {
  await axiosInstance.delete(API_ENDPOINTS.VARIANTS.DETAIL(id));
};