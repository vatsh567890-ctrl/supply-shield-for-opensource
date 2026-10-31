import { ApiError } from "./errors";

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers = {}, ...rest } = options;

  let url = `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    const query = searchParams.toString();
    if (query) url += `?${query}`;
  }

  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(
    (rest.method || "GET").toUpperCase()
  );

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  if (isMutating) {
    requestHeaders.set("X-SupplyShield-Request", "1");
    if (!requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }
  }

  const response = await fetch(url, {
    credentials: "include",
    headers: requestHeaders,
    ...rest,
  });

  if (!response.ok) {
    let errorCode = "UNKNOWN_ERROR";
    let errorMessage = "An unexpected error occurred.";
    let requestId: string | undefined;

    try {
      const errorJson = await response.json();
      if (errorJson.error) {
        errorCode = errorJson.error.code || errorCode;
        errorMessage = errorJson.error.message || errorMessage;
        requestId = errorJson.error.request_id;
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    const retryAfterHeader = response.headers.get("Retry-After");
    const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;

    throw new ApiError(errorMessage, errorCode, response.status, requestId, retryAfter);
  }

  return response.json() as Promise<T>;
}
