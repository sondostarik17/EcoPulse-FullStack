
const API_BASE_URL = "http://localhost:5000/api";

// Build the correct API URL
const buildApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return `${API_BASE_URL}${cleanEndpoint}`;
};

// General API Request
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const isFormData = options.body instanceof FormData;

    const headers = {
      Accept: "application/json",
      ...(!isFormData && options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    };

    const response = await fetch(buildApiUrl(endpoint), {
      ...options,
      headers,
      credentials: "include",
    });

    // Handle empty responses
    if (response.status === 204) {
      return { success: true };
    }

    const contentType = response.headers.get("content-type") || "";

    const data = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    if (!response.ok) {
      if (response.status === 401) {
        window.dispatchEvent(new Event("authChanged"));
      }

      throw new Error(
        data.message || `Request failed (${response.status})`
      );
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Cannot connect to the server. Check that the backend is running and CORS is configured correctly."
      );
    }

    throw error;
  }
};

// Authentication
export const loginUser = (email, password) =>
  apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });

export const registerUser = (userData) =>
  apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

export const googleLogin = (credential) =>
  apiRequest("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });

// Current logged-in user
export const getCurrentUser = async () => {
  const data = await apiRequest("/auth/me");
  return data.user;
};

// Logout
export const logoutUser = async () => {
  try {
    await apiRequest("/auth/logout", {
      method: "POST",
    });
  } finally {
    window.dispatchEvent(new Event("authChanged"));
  }
};

// OTP
export const sendOTP = (email) =>
  apiRequest("/otp/send", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
    }),
  });

export const verifyOTP = (email, otp) =>
  apiRequest("/otp/verify", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      otp,
    }),
  });

// Cookie-based authentication
// JWT is stored in an HttpOnly cookie by the backend.
export const getAuthToken = () => null;

export const saveAuthToken = () => {
  console.warn("Authentication uses HttpOnly cookies.");
};

export const removeAuthToken = () => {
  // The backend clears the authentication cookie on logout.
};
