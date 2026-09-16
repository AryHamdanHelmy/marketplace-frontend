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

  // Response kosong (204) atau HTML (502 dari proxy) tidak bisa di-parse sebagai JSON
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Token kedaluwarsa atau dicabut: bersihkan sesi lalu arahkan ke login.
    // Hanya kalau request tadi memakai token, supaya login dengan password salah
    // tetap menampilkan pesan error biasa.
    if (response.status === 401 && token) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    let message = data.message || "Terjadi kesalahan pada server";
    if (response.status === 429) {
      message = "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
    } else if (response.status === 401 && token) {
      message = "Sesi kamu sudah berakhir. Silakan login lagi.";
    }

    const error = new Error(message);
    error.errors = data.errors;
    error.status = response.status;
    throw error;
  }

  return data;
}