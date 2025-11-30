const API_URL = (import.meta.env as ImportMetaEnv).VITE_API_URL ??
  "http://localhost:3000";

export const customFetcher = async <T>({
  url,
  method,
  params,
  data,
  headers,
  signal,
}: {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  params?: Record<string, string | number | boolean | undefined>;
  data?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}): Promise<T> => {
  const fullUrl = new URL(`${API_URL}${url}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        fullUrl.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(fullUrl.toString(), {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
