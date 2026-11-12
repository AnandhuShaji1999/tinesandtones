import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";
import { SALES_DATA } from "../content/salesContent";

// Set to false when the real API is ready
const USE_MOCK = true;

export const getSalesData = async (filters = {}) => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const q = (filters.search || "").trim().toLowerCase();
    const rows = SALES_DATA.rows.filter(
      (r) =>
        (!q ||
          r.name.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)) &&
        (!filters.category || r.category === filters.category) &&
        (!filters.status || r.status === filters.status) &&
        (!filters.branch || r.branch === filters.branch)
    );
    const filtered = Boolean(
      q || filters.category || filters.status || filters.branch
    );

    return { stats: SALES_DATA.stats, total: SALES_DATA.total, rows, filtered };
  }

  const { data } = await axiosInstance.get(API_ENDPOINTS.SALES.INVENTORY, {
    params: filters,
  });
  return data;
};