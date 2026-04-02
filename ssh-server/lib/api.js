const API_URL = process.env.API_URL || 'http://localhost:5000';

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}

export async function signup(username, phone) {
  return request('POST', '/auth/signup', { username, phone });
}

export async function login(username) {
  return request('POST', '/auth/login', { username });
}

export async function requestLocationToken(token) {
  return request('POST', '/auth/location-token', null, token);
}

export async function getLocationStatus(token) {
  return request('GET', '/auth/location-status', null, token);
}

export async function fetchNearbyShops(lat, lng, radius = 50000) {
  return request('GET', `/shops/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
}

export async function fetchAllShops() {
  return request('GET', `/shops/all`);
}

export async function fetchShopMenu(shopId) {
  return request('GET', `/shops/${shopId}/menu`);
}

export async function createOrder(token, { items, shopId }) {
  return request('POST', '/order', { items, shopId }, token);
}

export async function getOrderStatus(token) {
  return request('GET', '/order/status', null, token);
}

export async function getOrderHistory(token) {
  return request('GET', '/order/history', null, token);
}
