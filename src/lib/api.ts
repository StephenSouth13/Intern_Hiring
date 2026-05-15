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

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly statusText: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

async function readErrorMessage(response: Response) {
  const errorText = await response.text();

  if (!errorText) return "Unknown error";

  try {
    const body = JSON.parse(errorText) as { message?: string; error?: string };
    return body.message || body.error || errorText;
  } catch {
    return errorText;
  }
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
    const message = await readErrorMessage(response);
    throw new ApiError(`API ${response.status} ${response.statusText}: ${message}`, response.status, response.statusText);
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
  status?: string;
  restricted?: boolean;
  isRestricted?: boolean;
  avatarUrl?: string;
  phoneNumber?: string;
  gender?: string;
  dob?: string;
  cvUrl?: string;
};

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  gender?: string;
  dob?: string;
  cvUrl?: string;
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

export type AdminUser = ApiUser & {
  createdAt?: string;
};

export type AdminJobPost = {
  id: string | number;
  title: string;
  company?: string;
  employerName?: string;
  employerEmail?: string;
  location?: string;
  type?: string;
  salary?: string;
  status?: string;
  description?: string;
  createdAt?: string;
  deletedAt?: string | null;
};

export type EmployerVerificationRequest = {
  id: string | number;
  userId?: string | number;
  userEmail?: string;
  companyName: string;
  companyEmail: string;
  taxCode: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  createdAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  extraFields?: Record<string, string>;
};

export const adminApi = {
  listUsers: (token: string) =>
    apiRequest<AdminUser[]>("/api/admin/users", {
      headers: authHeaders(token),
    }),


  setUserRestriction: (token: string, userId: string | number, restricted: boolean) =>
    apiRequest<AdminUser>(`/api/admin/users/${encodeURIComponent(String(userId))}/restriction`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ restricted }),
    }),

  listJobs: (token: string, includeTrash = true) =>
    apiRequest<AdminJobPost[]>("/api/admin/jobs", {
      headers: authHeaders(token),
      params: { includeTrash },
    }),

  moveJobToTrash: (token: string, jobId: string | number) =>
    apiRequest<AdminJobPost>(`/api/admin/jobs/${encodeURIComponent(String(jobId))}/trash`, {
      method: "PATCH",
      headers: authHeaders(token),
    }),

  restoreJob: (token: string, jobId: string | number) =>
    apiRequest<AdminJobPost>(`/api/admin/jobs/${encodeURIComponent(String(jobId))}/restore`, {
      method: "PATCH",
      headers: authHeaders(token),
    }),

  deleteJobPermanently: (token: string, jobId: string | number) =>
    apiRequest<void>(`/api/admin/jobs/${encodeURIComponent(String(jobId))}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),

  listEmployerRequests: (token: string) =>
    apiRequest<EmployerVerificationRequest[]>("/api/admin/employer-verification-requests", {
      headers: authHeaders(token),
    }),

  reviewEmployerRequest: (
    token: string,
    requestId: string | number,
    status: "APPROVED" | "REJECTED",
    rejectionReason?: string,
  ) =>
    apiRequest<EmployerVerificationRequest>(
      `/api/admin/employer-verification-requests/${encodeURIComponent(String(requestId))}`,
      {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ status, rejectionReason }),
      },
    ),
};
