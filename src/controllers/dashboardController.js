import * as dashboardService from "../services/dashboardService";
import { parseApiError } from "../models/authModel";
import { fromDashboard, toDashboardParams } from "../models/dashboardModel";

export const loadDashboard = async (filters) => {
  try {
    return fromDashboard(
      await dashboardService.getDashboardSummary(toDashboardParams(filters))
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load the dashboard"));
  }
};