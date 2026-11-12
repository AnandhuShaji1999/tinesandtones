import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

export const getReport = async (name, params) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.REPORTS.LIST(name), {
    params,
  });
  return data;
};

export const getReportExport = async (name, params, format) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.REPORTS.LIST(name), {
    params: { ...params, export: format },
    responseType: "blob",
  });
  return data;
};