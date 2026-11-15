import * as profileService from "../services/profileService";
import tokenService from "../services/tokenService";
import { parseApiError } from "../models/authModel";
import {
  fromProfile,
  toPasswordPayload,
  toProfileUpdatePayload,
} from "../models/profileModel";

// Instant, from the saved login (may be null)
export const getCachedProfile = () => {
  const u = tokenService.getUser();
  if (!u) return null;
  return fromProfile({
    id: u.id,
    email: u.email,
    first_name: u.first_name,
    last_name: u.last_name,
    is_active: u.is_active,
    date_joined: u.date_joined,
    is_business_admin: u.is_business_admin,
    memberships: u.memberships,
  });
};

export const loadProfile = async () => {
  try {
    const raw = await profileService.getMe();
    tokenService.setUser(raw);
    return fromProfile(raw);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load your profile"));
  }
};

// PATCH /auth/me/ then refresh the saved user
export const updateProfile = async (form) => {
  if (!form.firstName.trim()) throw new Error("First name is required.");
  try {
    const res = await profileService.patchMe(toProfileUpdatePayload(form));
    const merged = { ...(tokenService.getUser() || {}), ...res };
    tokenService.setUser(merged);
    return fromProfile(merged);
  } catch (err) {
    throw new Error(parseApiError(err, "Could not update your profile"));
  }
};

export const changePassword = async ({ current, next, confirm }) => {
  if (next.length < 8) throw new Error("New password must be at least 8 characters.");
  if (next !== confirm) throw new Error("New password and confirmation do not match.");
  if (next === current) throw new Error("New password must be different from the current one.");
  try {
    await profileService.postChangePassword(toPasswordPayload({ current, next }));
  } catch (err) {
    throw new Error(parseApiError(err, "Could not change the password"));
  }
};