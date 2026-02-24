import type { ApiResponse } from "@/types/shared";
import { logger, isDevelopment } from "./logger";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

if (isDevelopment) {
  logger.log("🔗 API Base URL:", API_BASE_URL);
}

const DEFAULT_TIMEOUT = 30000;
const AUTH_TIMEOUT = 15000;

export interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
  timeout?: number;
}

const getAuthToken = (): string | null => {
  const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  if (!user) return null;

  try {
    const userData = JSON.parse(user);
    return userData.token || null;
  } catch {
    return null;
  }
};

let csrfTokenCache: string | null = null;
let csrfTokenPromise: Promise<string | null> | null = null;

const getCsrfToken = async (): Promise<string | null> => {
  if (csrfTokenCache) return csrfTokenCache;
  if (csrfTokenPromise) return csrfTokenPromise;

  csrfTokenPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/csrf-token`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (data?.success && typeof data.csrfToken === "string") {
        csrfTokenCache = data.csrfToken;
        return csrfTokenCache;
      }

      return null;
    } catch {
      return null;
    } finally {
      csrfTokenPromise = null;
    }
  })();

  return csrfTokenPromise;
};

const clearCsrfToken = () => {
  csrfTokenCache = null;
  csrfTokenPromise = null;
};

export const apiRequest = async <T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const { requiresAuth = true, timeout, ...fetchOptions } = options;

  const method = (fetchOptions.method || "GET").toUpperCase();
  const isMutatingRequest = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string> | undefined),
  };

  const isFormData = typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  if (isMutatingRequest) {
    const csrfToken = await getCsrfToken();
    if (csrfToken) {
      headers["x-csrf-token"] = csrfToken;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  if (isDevelopment) {
    logger.log("📤 API Request:", url, { method });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout || DEFAULT_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = "Request failed";
      let errorType = "unknown";
      let errorDetails: any = undefined;

      try {
        const error = await response.json();
        errorMessage = error.message || error.error || `HTTP error! status: ${response.status}`;
        errorType = error.type || "unknown";
        errorDetails = error;

        if (response.status === 403 && isMutatingRequest) {
          clearCsrfToken();
        }
      } catch {
        if (response.status === 503) {
          errorMessage = "Service temporarily unavailable. Please try again in a few moments.";
        } else if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const retryMessage = retryAfter
            ? ` Please try again after ${retryAfter} seconds.`
            : " Please wait a moment and try again.";
          errorMessage = `Rate limit exceeded.${retryMessage}`;
          errorType = "server_rate_limit";
        } else if (response.status === 401) {
          errorMessage = "Unauthorized. Please login again.";
        } else if (response.status === 404) {
          errorMessage = "Resource not found.";
        } else {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
      }

      const err = new Error(errorMessage);
      (err as any).status = response.status;
      (err as any).type = errorType;
      (err as any).details = errorDetails;
      throw err;
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error?.name === "AbortError" || error?.name === "TimeoutError") {
      const timeoutError = new Error(
        "Request timeout. Please check your connection and try again."
      );
      (timeoutError as any).type = "timeout";
      (timeoutError as any).status = 408;
      throw timeoutError;
    }

    throw error;
  }
};

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ success: boolean; data: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      requiresAuth: false,
      timeout: AUTH_TIMEOUT,
    }),

  register: (name: string, email: string, password: string) =>
    apiRequest<{ success: boolean; data?: any; message?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      requiresAuth: false,
      timeout: AUTH_TIMEOUT,
    }),

  getMe: () => apiRequest<{ success: boolean; data: any }>("/auth/me"),

  updateProfile: (payload: {
    name?: string;
    avatar?: string;
    coverPhoto?: string;
    email?: string;
    password?: string;
    bio?: string;
    headline?: string;
    location?: string;
    yearsOfExperience?: number;
    currentRole?: string;
    industries?: string[];
    skills?: string[];
    socialLinks?: {
      linkedin?: string;
      github?: string;
      portfolio?: string;
    };
    isPublicProfile?: boolean;
  }) =>
    apiRequest<{ success: boolean; data: any }>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

export const uploadApi = {
  uploadAvatar: (formData: FormData) =>
    apiRequest<ApiResponse<{ avatar: string }>>("/upload/avatar", {
      method: "POST",
      body: formData,
      headers: {},
    }),

  uploadCoverPhoto: (formData: FormData) =>
    apiRequest<ApiResponse<{ coverPhoto: string }>>("/upload/cover-photo", {
      method: "POST",
      body: formData,
      headers: {},
    }),

  uploadPostImage: (formData: FormData) =>
    apiRequest<ApiResponse<{ url: string; filename: string; size: number }>>("/upload/post-image", {
      method: "POST",
      body: formData,
      headers: {},
    }),
};
