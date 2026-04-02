const TOKEN_KEY = "shop_auth_token";
const SHOP_KEY = "shop_info";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export function getShopToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setShopToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearShopToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SHOP_KEY);
}

export function getShopInfo(): { id: string; name: string; slug: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SHOP_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setShopInfo(shop: {
  id: string;
  name: string;
  slug: string;
}): void {
  localStorage.setItem(SHOP_KEY, JSON.stringify(shop));
}

export async function shopApiCall<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = getShopToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options: RequestInit = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${path}`, options);

  if (response.status === 401) {
    clearShopToken();
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data as T;
}
