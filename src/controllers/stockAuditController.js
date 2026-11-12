import * as auditService from "../services/stockAuditService";
import * as stockService from "../services/stockService";
import { parseApiError } from "../models/authModel";
import {
  AUDIT_PAGE_SIZE,
  toAuditPayload,
  fromAudit,
  fromAuditList,
  fromBatchForAudit,
  batchOptionsFromList,
} from "../models/stockAuditModel";

export const listBatchOptions = async (branch) => {
  if (!branch) return [];
  try {
    return batchOptionsFromList(
      await stockService.getBatches({ branch, page: 1, page_size: 100 })
    );
  } catch {
    return [];
  }
};

// Expected quantity + version captured from Get Batch
export const loadBatch = async (id) => {
  try {
    return fromBatchForAudit(await stockService.getBatch(id));
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load batch"));
  }
};

export const postAudit = async (data) => {
  try {
    return fromAudit(await auditService.createAudit(toAuditPayload(data)));
  } catch (err) {
    throw new Error(parseApiError(err, "Could not post the audit"));
  }
};

export const listAudits = async ({ branch = "", page = 1 } = {}) => {
  try {
    const params = { page, page_size: AUDIT_PAGE_SIZE };
    if (branch) params.branch = branch;
    return fromAuditList(await auditService.getAudits(params), page);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load audits"));
  }
};

export const getAudit = async (id) => {
  try {
    return fromAudit(await auditService.getAudit(id));
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load audit"));
  }
};