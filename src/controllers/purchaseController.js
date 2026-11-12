import * as purchaseService from "../services/purchaseService";
import { parseApiError } from "../models/authModel";
import { PAGE_SIZE } from "../models/categoryModel";
import {
  toCreatePurchasePayload,
  toUpdatePurchasePayload,
  fromPurchase,
  fromPurchaseList,
  fromRevisions,
} from "../models/purchaseModel";

export const listPurchases = async ({ branch = "", page = 1 } = {}) => {
  try {
    const data = await purchaseService.getPurchases({
      branch,
      page,
      page_size: PAGE_SIZE,
    });
    return fromPurchaseList(data, page);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load purchases"));
  }
};

export const getPurchase = async (id) => {
  try {
    return fromPurchase(await purchaseService.getPurchase(id));
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load purchase"));
  }
};

export const createPurchase = async (form, lines) => {
  try {
    return fromPurchase(
      await purchaseService.createPurchase(
        toCreatePurchasePayload(form, lines)
      )
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not save purchase"));
  }
};

export const correctPurchase = async (id, version, taxTreatment, lines) => {
  try {
    return fromPurchase(
      await purchaseService.updatePurchase(
        id,
        toUpdatePurchasePayload(version, taxTreatment, lines)
      )
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not correct purchase"));
  }
};

export const listRevisions = async (id) => {
  try {
    return fromRevisions(await purchaseService.getPurchaseRevisions(id));
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load revisions"));
  }
};