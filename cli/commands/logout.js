import { deleteConfig, loadConfig } from '../lib/config.js';
import { success, info, divider } from '../lib/ui.js';

export function registerLogoutCommand(program) {
  program
    .command('logout')
    .description('Log out and remove stored credentials')
    .action(() => {
      const config = loadConfig();

      if (!config || !config.token) {
        divider();
        info('Already logged out.');
        divider();
        return;
      }

      deleteConfig();
      divider();
      success('Logged out successfully.');
      divider();
    });
}
