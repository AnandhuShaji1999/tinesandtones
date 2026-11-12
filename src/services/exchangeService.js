import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

export const createExchange = async (payload, idempotencyKey) => {
  const { data } = await axiosInstance.post(API_ENDPOINTS.EXCHANGES.CREATE, payload, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return data;
};

export const getExchanges = async (params) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.EXCHANGES.LIST, { params });
  return data;
};

export const getExchange = async (id) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.EXCHANGES.DETAIL(id));
  return data;
};

export const getExchangePdf = async (id) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.EXCHANGES.PDF(id), {
    responseType: "blob",
  });
  return data;
};