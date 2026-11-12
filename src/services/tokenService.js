const KEYS = {
  ACCESS: "accessToken",
  REFRESH: "refreshToken",
  USER: "user",
  BRANCH: "branch",
};

const read = (key) =>
  localStorage.getItem(key) ?? sessionStorage.getItem(key) ?? null;

// Tokens live where the refresh token is saved (localStorage when "Remember" is on)
const activeStore = () =>
  sessionStorage.getItem(KEYS.REFRESH) && !localStorage.getItem(KEYS.REFRESH)
    ? sessionStorage
    : localStorage;

const tokenService = {
  getAccessToken: () => read(KEYS.ACCESS),
  getRefreshToken: () => read(KEYS.REFRESH),

  setTokens({ access, refresh }, remember = true) {
    tokenService.clear();
    const store = remember ? localStorage : sessionStorage;
    store.setItem(KEYS.ACCESS, access);
    store.setItem(KEYS.REFRESH, refresh);
  },

  // Used after a refresh (refresh token may be rotated)
  updateTokens({ access, refresh }) {
    const store = activeStore();
    if (access) store.setItem(KEYS.ACCESS, access);
    if (refresh) store.setItem(KEYS.REFRESH, refresh);
  },

  getUser() {
    try {
      return JSON.parse(read(KEYS.USER));
    } catch {
      return null;
    }
  },
  setUser: (user) => activeStore().setItem(KEYS.USER, JSON.stringify(user)),

  getBranch: () => read(KEYS.BRANCH),
  setBranch: (branch) => activeStore().setItem(KEYS.BRANCH, branch),

  isAuthenticated: () => Boolean(read(KEYS.ACCESS)),

  clear() {
    Object.values(KEYS).forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    localStorage.removeItem("token"); // old mock key
  },
};

export default tokenService;