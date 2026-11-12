import * as stockService from "../services/stockService";
import { parseApiError } from "../models/authModel";
import { PAGE_SIZE } from "../models/categoryModel";
import { fromStockList, flatten } from "../models/stockModel";

const FETCHERS = {
  balances: stockService.getBalances,
  batches: stockService.getBatches,
  ledger: stockService.getLedger,
};

export const listStock = async (
  tab,
  { branch = "", variant = "", purchase = "", page = 1 } = {}
) => {
  const params = { page, page_size: PAGE_SIZE };
  if (branch) params.branch = branch;
  if (tab === "batches" && variant) params.variant = variant;
  if (tab === "ledger" && purchase) params.purchase = purchase;

  try {
    return fromStockList(await FETCHERS[tab](params), page);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load stock"));
  }
};

export const getBatchDetail = async (id) => {
  try {
    return flatten(await stockService.getBatch(id));
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load batch"));
  }
};