import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiConstants";
import { CUSTOMERS_DATA } from "../content/customersContent";

// Set to false when the real API is ready
const USE_MOCK = true;

export const getCustomers = async (filters = {}) => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const name = (filters.name || "").trim().toLowerCase();
    const code = (filters.code || "").trim().toLowerCase();

    const rows = CUSTOMERS_DATA.rows.filter(
      (r) =>
        (!name || `${r.first} ${r.last}`.toLowerCase().includes(name)) &&
        (!code || r.code.toLowerCase().includes(code)) &&
        (!filters.from || r.startDate >= filters.from) &&
        (!filters.to || r.startDate <= filters.to)
    );
    const filtered = Boolean(name || code || filters.from || filters.to);

    return {
      rows,
      filtered,
      total: CUSTOMERS_DATA.total,
      pages: filtered ? 1 : CUSTOMERS_DATA.pages,
    };
  }

  const { data } = await axiosInstance.get(API_ENDPOINTS.CUSTOMERS.LIST, {
    params: filters,
  });
  return data;
};