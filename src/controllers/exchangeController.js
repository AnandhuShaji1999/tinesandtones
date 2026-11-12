import * as exchangeService from "../services/exchangeService";
import { parseApiError } from "../models/authModel";
import {
  EX_PAGE_SIZE,
  toExchangePayload,
  fromExchange,
  fromExchangeList,
} from "../models/exchangeModel";

export const submitExchange = async (data, key) => {
  try {
    return fromExchange(
      await exchangeService.createExchange(toExchangePayload(data), key)
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not complete the exchange"));
  }
};

export const listExchanges = async ({ branch = "", page = 1 } = {}) => {
  try {
    const params = { page, page_size: EX_PAGE_SIZE };
    if (branch) params.branch = branch;
    return fromExchangeList(await exchangeService.getExchanges(params), page);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load exchanges"));
  }
};

export const getExchange = async (id) => {
  try {
    return fromExchange(await exchangeService.getExchange(id));
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load exchange"));
  }
};

export const downloadExchangePdf = async (id, number) => {
  try {
    const blob = await exchangeService.getExchangePdf(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exchange-${number || id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not download the PDF"));
  }
};