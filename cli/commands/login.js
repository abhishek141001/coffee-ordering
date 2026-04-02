import ora from 'ora';
import { saveConfig, DEFAULT_API_URL } from '../lib/config.js';
import { success, error, divider, jsonOutput } from '../lib/ui.js';

export function registerSignupCommand(program) {
  program
    .command('signup')
    .description('Create a new account')
    .requiredOption('--username <username>', 'Choose a username')
    .requiredOption('--phone <phone>', 'Your phone number (shared with shop for delivery)')
    .option('--api-url <url>', 'API server URL', DEFAULT_API_URL)
    .action(async (options) => {
      try {
        const spinner = ora({ text: 'Creating account...', color: 'yellow' }).start();

        const url = `${options.apiUrl}/auth/signup`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: options.username, phone: options.phone }),
        });

        const data = await response.json();
        spinner.stop();

        if (!response.ok) {
          throw new Error(data.error || 'Signup failed');
        }

        saveConfig({
          token: data.token,
          username: data.username,
          apiUrl: options.apiUrl,
        });

        jsonOutput({ username: data.username, phone: data.phone, apiUrl: options.apiUrl }, program);

        divider();
        success(`Account created! Logged in as ${data.username}`);
        divider();
      } catch (err) {
        if (err.cause?.code === 'ECONNREFUSED') {
          error('Cannot connect to the server.', 'Is the backend running? Start it with: cd backend && npm run dev');
        } else {
          error(`Signup failed: ${err.message}`);
        }
        process.exit(1);
      }
    });
}

export function registerLoginCommand(program) {
  program
    .command('login')
    .description('Log in to an existing account')
    .requiredOption('--username <username>', 'Your username')
    .option('--api-url <url>', 'API server URL', DEFAULT_API_URL)
    .action(async (options) => {
      try {
        const spinner = ora({ text: 'Logging in...', color: 'yellow' }).start();

        const url = `${options.apiUrl}/auth/login`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: options.username }),
        });

        const data = await response.json();
        spinner.stop();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        saveConfig({
          token: data.token,
          username: data.username,
          apiUrl: options.apiUrl,
        });

        jsonOutput({ username: data.username, apiUrl: options.apiUrl }, program);

        divider();
        success(`Logged in as ${data.username}`);
        divider();
      } catch (err) {
        if (err.cause?.code === 'ECONNREFUSED') {
          error('Cannot connect to the server.', 'Is the backend running? Start it with: cd backend && npm run dev');
        } else {
          error(`Login failed: ${err.message}`);
        }
        process.exit(1);
      }
    });
}
