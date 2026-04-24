export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

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

export type SiteSettings = {
  heroTitle: string;
  heroDescription: string;
  ctaLabel: string;
};

export const siteApi = {
  getSettings: () => apiRequest<SiteSettings>("/site-settings"),
  updateSettings: (payload: Partial<SiteSettings>) =>
    apiRequest<SiteSettings>("/site-settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};
