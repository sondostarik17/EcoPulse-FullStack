
const API_BASE_URL = "http://localhost:5000/api";

// Send requests using the HttpOnly authentication cookie
export const apiRequest = async (endpoint, options = {}) => {
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch (error) {
    throw new Error(
      "Cannot connect to the server. Make sure the backend is running."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    window.dispatchEvent(new Event("authChanged"));
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// Admin login only
export const loginAdmin = async (email, password) => {
  const data = await apiRequest("/auth/admin/login", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });

  if (data.user?.role !== "admin") {
    await apiRequest("/auth/logout", {
      method: "POST",
    }).catch(() => {});

    throw new Error("Access denied. Admin account required.");
  }

  window.dispatchEvent(new Event("authChanged"));

  return data;
};

// Get current admin
export const getCurrentAdmin = async () => {
  const data = await apiRequest("/auth/me", {
    method: "GET",
  });

  if (data.user?.role !== "admin") {
    throw new Error("Admin access required.");
  }

  return data.user;
};

// Logout
export const logoutAdmin = async () => {
  await apiRequest("/auth/logout", {
    method: "POST",
  });

  window.dispatchEvent(new Event("authChanged"));
};
