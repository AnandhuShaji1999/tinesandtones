import * as reportService from "../services/reportService";
import { parseApiError } from "../models/authModel";
import {
  REPORT_PAGE_SIZE,
  fromReport,
  toReportParams,
} from "../models/reportModel";

export const loadReport = async (name, filters, page = 1) => {
  try {
    const data = await reportService.getReport(name, {
      ...toReportParams(filters),
      page,
      page_size: REPORT_PAGE_SIZE,
    });
    return fromReport(data, page);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load the report"));
  }
};

// format: "csv" | "xlsx"
export const exportReport = async (name, filters, format) => {
  try {
    const blob = await reportService.getReportExport(
      name,
      toReportParams(filters),
      format
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-report.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not export the report"));
  }
};