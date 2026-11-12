import * as staffService from "../services/staffService";
import { parseApiError } from "../models/authModel";
import {
  toCreateStaffPayload,
  fromStaff,
  fromStaffList,
  fromBranchList,
} from "../models/staffModel";

export const createStaff = async (form) => {
  try {
    return fromStaff(
      await staffService.createStaff(toCreateStaffPayload(form))
    );
  } catch (err) {
    throw new Error(parseApiError(err, "Could not create staff"));
  }
};

export const listStaff = async (params) => {
  try {
    return fromStaffList(await staffService.getStaffList(params));
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load staff"));
  }
};

export const deactivateStaff = async (id) => {
  try {
    await staffService.deactivateStaff(id);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not deactivate staff"));
  }
};

// Returns [] if the branch endpoint is unavailable (page falls back to manual ID)
export const listBranches = async () => {
  try {
    return fromBranchList(await staffService.getBranches());
  } catch {
    return [];
  }
};