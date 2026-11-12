import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

export const getCategories = async (params) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.CATEGORIES.LIST, {
    params,
  });
  return data;
};

export const createCategory = async (payload) => {
  const { data } = await axiosInstance.post(
    API_ENDPOINTS.CATEGORIES.CREATE,
    payload
  );
  return data;
};

export const updateCategory = async (id, payload) => {
  const { data } = await axiosInstance.patch(
    API_ENDPOINTS.CATEGORIES.DETAIL(id),
    payload
  );
  return data;
};

export const deactivateCategory = async (id) => {
  await axiosInstance.delete(API_ENDPOINTS.CATEGORIES.DETAIL(id));
};