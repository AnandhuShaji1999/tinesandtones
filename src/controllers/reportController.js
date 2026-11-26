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

// An export asks for a file, so an error body also arrives as a blob: read it
const readBlobError = async (err) => {
  const body = err?.response?.data;
  if (body instanceof Blob) {
    try {
      const parsed = JSON.parse(await body.text());
      return { ...err, response: { ...err.response, data: parsed } };
    } catch {
      return err;
    }
  }
  return err;
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
    const fixed = await readBlobError(err);
    throw new Error(parseApiError(fixed, "Could not export the report"));
  }
};