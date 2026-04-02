import ora from 'ora';
import { getAuthConfig, DEFAULT_API_URL } from './config.js';
import { error } from './ui.js';

export async function apiCall(method, endpoint, body = null, { message = 'Loading...', auth = true } = {}) {
  const config = auth ? getAuthConfig() : null;

  if (auth && !config) {
    error('Not logged in.', 'Run: coffee login --username <name>');
    process.exit(1);
  }

  const baseUrl = config?.apiUrl || DEFAULT_API_URL;
  const url = `${baseUrl}${endpoint}`;

  const spinner = ora({ text: message, color: 'yellow' }).start();

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && config?.token) {
      headers.Authorization = `Bearer ${config.token}`;
    }

    const options = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      spinner.stop();
      if (response.status === 401) {
        error('Session expired or invalid token.', 'Run: coffee login --username <name>');
      } else {
        error(data.error || `Request failed (${response.status})`);
      }
      process.exit(1);
    }

    spinner.stop();
    return data;
  } catch (err) {
    spinner.stop();
    if (err.cause?.code === 'ECONNREFUSED') {
      error('Cannot connect to the server.', `Is the backend running? Start it with: cd backend && npm run dev`);
    } else {
      error(err.message);
    }
    process.exit(1);
  }
}

export async function publicApiCall(method, endpoint, { message = 'Loading...' } = {}) {
  const config = getAuthConfig();
  const baseUrl = config?.apiUrl || DEFAULT_API_URL;
  const url = `${baseUrl}${endpoint}`;

  const spinner = ora({ text: message, color: 'yellow' }).start();

  try {
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' } });
    const data = await response.json();
    spinner.stop();

    if (!response.ok) {
      return null;
    }

    return data;
  } catch {
    spinner.stop();
    return null;
  }
}
