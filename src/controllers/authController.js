import * as authService from "../services/authService";
import tokenService from "../services/tokenService";
import {
  toLoginPayload,
  fromLoginResponse,
  fromProfileResponse,
  toChangePasswordPayload,
  parseApiError,
} from "../models/authModel";

// Login → save tokens → load profile. Throws an Error with a readable message.
export const login = async (form) => {
  try {
    const tokens = fromLoginResponse(
      await authService.login(toLoginPayload(form))
    );
    tokenService.setTokens(tokens, form.remember);

    const user = fromProfileResponse(await authService.getProfile());
    tokenService.setUser(user);
    tokenService.setBranch(form.branch);
    return user;
  } catch (err) {
    tokenService.clear();
    throw new Error(parseApiError(err, "Login failed"));
  }
};

// Always clears local session, even if the API call fails
export const logout = async () => {
  const refresh = tokenService.getRefreshToken();
  try {
    if (refresh) await authService.logout(refresh);
  } catch {
    // ignore: token may already be expired or blacklisted
  } finally {
    tokenService.clear();
  }
};

export const changePassword = async (values) => {
  try {
    return await authService.changePassword(toChangePasswordPayload(values));
  } catch (err) {
    throw new Error(parseApiError(err, "Could not change password"));
  }
};

export const getCurrentUser = () => tokenService.getUser();
export const isLoggedIn = () => tokenService.isAuthenticated();