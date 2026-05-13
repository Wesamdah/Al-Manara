import { API_BASE_URL } from "./api-config";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: HeadersInit;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);

    this.status = status;
  }
}

export async function apiClient<T>(
  endPoint: string,
  options?: RequestOptions,
): Promise<T> {
  console.log(`Making API request to: ${API_BASE_URL}${endPoint}`);
  const response = await fetch(`${API_BASE_URL}${endPoint}`, {
    method: options?.method ?? "GET",
    credentials: "include", // Include cookies for authentication if needed
    headers: {
      "Content-Type": "application/json", // Default to JSON content type
      ...options?.headers, // Allow overriding or adding custom headers such as Authorization or multipart/form-data
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.message || "API request failed", response.status);
  }

  return data;
}
