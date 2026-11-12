import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

export const login = async (payload) => {
  const { data } = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, payload, {
    skipAuth: true,
  });
  return data;
};

export const refreshToken = async (refresh) => {
  const { data } = await axiosInstance.post(
    API_ENDPOINTS.AUTH.REFRESH,
    { refresh },
    { skipAuth: true }
  );
  return data;
};

export const getProfile = async () => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.AUTH.ME);
  return data;
};

export const changePassword = async (payload) => {
  const { data } = await axiosInstance.post(
    API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
    payload
  );
  return data;
};

export const logout = async (refresh) => {
  await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT, { refresh });
};