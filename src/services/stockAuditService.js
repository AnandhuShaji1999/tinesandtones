import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

export const createAudit = async (payload) => {
  const { data } = await axiosInstance.post(API_ENDPOINTS.STOCK_AUDITS.CREATE, payload);
  return data;
};

export const getAudits = async (params) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.STOCK_AUDITS.LIST, { params });
  return data;
};

export const getAudit = async (id) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.STOCK_AUDITS.DETAIL(id));
  return data;
};