// front/src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // IMPORTANT: Ensure cookies are sent with requests
});

// DEFINIMOS OS CAMINHOS QUE NÃO DEVEM ENVIAR UM TOKEN DE AUTORIZAÇÃO
const AUTH_PATHS = ['/api/auth/login', '/api/auth/refresh'];

api.interceptors.request.use(
  (config) => {
    // For Next.js App Router with HTTP-only cookies, the browser automatically
    // sends the 'token' cookie with requests to the same origin.
    // Explicitly attaching the Authorization header is generally not needed
    // unless your backend strictly requires it even with cookies.
    // If it's an authentication path (login/refresh), ensure no Authorization header.
    if (AUTH_PATHS.some(path => config.url.endsWith(path))) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // For Next.js App Router with httpOnly cookies and server-side auth checks,
    // the client-side does not typically handle token refreshing.
    // If a 401 Unauthorized error occurs for API calls, it implies the session
    // represented by the httpOnly cookie is no longer valid.
    // The `AuthContext` (in `providers/auth-provider.tsx`) handles
    // redirecting the user to the login page if their session is invalid
    // when `checkAuthStatus` is called (e.g., on page load or when accessing protected routes).
    // Therefore, the complex refresh token logic and direct logout calls are removed from here.

    if (error.response?.status === 401) {
      console.warn("API request received 401. Relying on Next.js AuthProvider for session management and redirection.");
      // No explicit action needed here; the AuthProvider will detect the invalid session.
    }
    return Promise.reject(error);
  }
);

export default api;