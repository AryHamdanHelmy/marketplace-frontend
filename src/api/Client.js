const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const headers = {
    Accept: "application/json",
    // Kalau FormData, jangan set Content-Type — browser yang set otomatis
    // beserta boundary-nya untuk multipart/form-data
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    // Kalau FormData kirim as-is, kalau object biasa JSON.stringify
    body: options.body
      ? isFormData
        ? options.body
        : JSON.stringify(options.body)
      : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data.message || "Terjadi kesalahan pada server";
    const error = new Error(message);
    error.errors = data.errors;
    error.status = response.status;
    throw error;
  }

  return data;
}