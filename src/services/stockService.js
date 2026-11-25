import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";

export const getBalances = async (params) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.STOCK.BALANCES, {
    params,
  });
  return data;
};

export const getBatches = async (params) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.STOCK.BATCHES, {
    params,
  });
  return data;
};

export const getBatch = async (id) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.STOCK.BATCH(id));
  return data;
};

export const getLedger = async (params) => {
  const { data } = await axiosInstance.get(API_ENDPOINTS.STOCK.LEDGER, {
    params,
  });
  return data;
};