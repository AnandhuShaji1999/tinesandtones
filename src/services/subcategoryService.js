import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

export const getSubcategories = async (params) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.SUBCATEGORIES.LIST, {
    params,
  });
  return data;
};

export const createSubcategory = async (payload) => {
  const { data } = await axiosInstance.post(
    API_ENDPOINTS.SUBCATEGORIES.CREATE,
    payload
  );
  return data;
};

export const updateSubcategory = async (id, payload) => {
  const { data } = await axiosInstance.patch(
    API_ENDPOINTS.SUBCATEGORIES.DETAIL(id),
    payload
  );
  return data;
};

export const deactivateSubcategory = async (id) => {
  await axiosInstance.delete(API_ENDPOINTS.SUBCATEGORIES.DETAIL(id));
};