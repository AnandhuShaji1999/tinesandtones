import * as salesService from "../services/salesService";
import { parseApiError } from "../models/authModel";
import { fromSaleList, buildStats, buildBranchOptions } from "../models/salesModel";

const MAX_PAGES = 50;

// Loads every sale (follows pagination if the API paginates)
export const loadSales = async () => {
  try {
    let data = await salesService.getSales();
    let all = Array.isArray(data) ? data : data?.results ?? [];

    let page = 1;
    while (!Array.isArray(data) && data?.next && page < MAX_PAGES) {
      page += 1;
      data = await salesService.getSales({ page });
      all = all.concat(data?.results ?? []);
    }

    const rows = fromSaleList(all);
    return { rows, stats: buildStats(rows), branchOptions: buildBranchOptions(rows) };
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load sales"));
  }
};

// Opens the printable PDF of a sale in a new tab
export const openSalePdf = async (id) => {
  try {
    const blob = await salesService.getSalePdf(id);
    const url = URL.createObjectURL(
      new Blob([blob], { type: "application/pdf" })
    );
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not open the sale PDF"));
  }
};