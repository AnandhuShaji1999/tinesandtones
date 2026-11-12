import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

// Public endpoint: no token (skipAuth)
export const getHealth = async () => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.UTILITIES.HEALTH, {
    skipAuth: true,
  });
  return data;
};

// Returned as text so both JSON and YAML schemas work
export const getSchema = async () => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.UTILITIES.SCHEMA, {
    responseType: "text",
    transformResponse: [(d) => d],
  });
  return data;
};