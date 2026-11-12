import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

export const getPurchases = async (params) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.PURCHASES.LIST, {
    params,
  });
  return data;
};

export const getPurchase = async (id) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.PURCHASES.DETAIL(id));
  return data;
};

export const createPurchase = async (payload) => {
  const { data } = await axiosInstance.post(
    API_ENDPOINTS.PURCHASES.CREATE,
    payload
  );
  return data;
};

export const updatePurchase = async (id, payload) => {
  const { data } = await axiosInstance.patch(
    API_ENDPOINTS.PURCHASES.DETAIL(id),
    payload
  );
  return data;
};

export const getPurchaseRevisions = async (id) => {
  const { data } = await axiosInstance.get(
    API_ENDPOINTS.PURCHASES.REVISIONS(id)
  );
  return data;
};