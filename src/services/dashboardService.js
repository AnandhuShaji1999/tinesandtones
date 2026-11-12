import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

export const getDashboardSummary = async (params) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.DASHBOARD.SUMMARY, {
    params,
  });
  return data;
};