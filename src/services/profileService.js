import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

export const getMe = async () => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.AUTH.ME);
  return data;
};

export const postChangePassword = async (payload) => {
  const { data } = await axiosInstance.post(
    API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
    payload
  );
  return data;
};