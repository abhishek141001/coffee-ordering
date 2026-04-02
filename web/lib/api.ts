const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function apiCall<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data as T;
}
