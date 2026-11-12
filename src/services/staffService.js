import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

export const createStaff = async (payload) => {
  const { data } = await axiosInstance.post(API_ENDPOINTS.STAFF.CREATE, payload);
  return data;
};

export const getStaffList = async (params = { page: 1, page_size: 20 }) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.STAFF.LIST, { params });
  return data;
};

export const deactivateStaff = async (id) => {
  await axiosInstance.delete(API_ENDPOINTS.STAFF.DETAIL(id));
};

export const getBranches = async () => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.BRANCHES.LIST);
  return data;
};