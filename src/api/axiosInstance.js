import axios from "axios";
import { BASE_URL, API_ENDPOINTS } from "../constants/apiConstants";
import { ROUTES } from "../constants/routes";
import tokenService from "../services/tokenService";

const COMMON_HEADERS = {
  "Content-Type": "application/json",
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: COMMON_HEADERS,
});

// Attach the access token (skipped for login/refresh via { skipAuth: true })
axiosInstance.interceptors.request.use((config) => {
  if (!config.skipAuth) {
    const token = tokenService.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// One shared refresh call, even if several requests fail at once
let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        { refresh: tokenService.getRefreshToken() },
        { headers: COMMON_HEADERS }
      )
      .then(({ data }) => {
        tokenService.updateTokens(data);
        return data.access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      original &&
      !original.skipAuth &&
      !original._retry &&
      tokenService.getRefreshToken()
    ) {
      original._retry = true;
      try {
        const access = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(original);
      } catch (refreshError) {
        tokenService.clear();
        if (window.location.pathname !== ROUTES.LOGIN) {
          window.location.href = ROUTES.LOGIN;
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;