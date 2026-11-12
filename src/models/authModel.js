// Request/response shapes for the auth API

export const toLoginPayload = ({ username, password }) => ({
  email: String(username || "").trim(),
  password,
});

export const fromLoginResponse = (data = {}) => ({
  access: data.access,
  refresh: data.refresh,
});

export const fromProfileResponse = (data = {}) => ({
  ...data,
  fullName:
    [data.first_name, data.last_name].filter(Boolean).join(" ") ||
    data.email ||
    "",
  memberships: data.memberships || [],
});

export const toChangePasswordPayload = ({ currentPassword, newPassword }) => ({
  current_password: currentPassword,
  new_password: newPassword,
});

// Turns a DRF / network error into one readable message
export const parseApiError = (err, fallback = "Something went wrong") => {
  if (!err.response) return "Cannot reach the server. Please try again.";

  const data = err.response.data;
  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;
  if (data?.non_field_errors?.length) return data.non_field_errors[0];

  const first = data && Object.values(data)[0];
  if (Array.isArray(first) && first.length) return String(first[0]);
  if (typeof first === "string") return first;

  return fallback;
};