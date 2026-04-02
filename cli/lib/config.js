import fs from 'fs';
import path from 'path';
import os from 'os';

export const CONFIG_PATH = path.join(os.homedir(), '.coffee-config.json');
export const DEFAULT_API_URL = 'http://localhost:5000';

export function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

export function saveConfig(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), { mode: 0o600 });
}

export function deleteConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    fs.unlinkSync(CONFIG_PATH);
  }
}

export function getAuthConfig() {
  const config = loadConfig();
  if (!config || !config.token) {
    return null;
  }
  return config;
}

export function saveLocation(lat, lng) {
  const config = loadConfig() || {};
  config.location = { lat, lng };
  saveConfig(config);
}

export function getLocation() {
  const config = loadConfig();
  return config?.location || null;
}
