export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined | null>;
};

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  { params, headers, ...options }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API ${response.status} ${response.statusText}: ${errorText || "Unknown error"}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ── Auth headers helper ──────────────────────────────────────────────
function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── User type shared across API consumers ────────────────────────────
export type ApiUser = {
  id: string | number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  phoneNumber?: string;
  gender?: string;
  resumeUrl?: string;
};

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  gender?: string;
  resumeUrl?: string;
};

// ── Auth API ─────────────────────────────────────────────────────────
export const authApi = {
  getMe: (token: string) =>
    apiRequest<ApiUser>("/api/auth/me", {
      headers: authHeaders(token),
    }),
};

// ── User API ─────────────────────────────────────────────────────────
export const userApi = {
  updateProfile: (token: string, data: UpdateProfilePayload) =>
    apiRequest<ApiUser>("/api/users/me", {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),
};
