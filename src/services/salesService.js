import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

export const getSales = async (params = {}) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.POS_SALES.LIST, {
    params,
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