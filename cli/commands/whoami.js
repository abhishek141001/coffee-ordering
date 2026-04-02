import chalk from 'chalk';
import { getAuthConfig } from '../lib/config.js';
import { error, divider, jsonOutput } from '../lib/ui.js';

export function registerWhoamiCommand(program) {
  program
    .command('whoami')
    .description('Show current logged-in user')
    .action(() => {
      const config = getAuthConfig();

      if (!config) {
        error('Not logged in.', 'Run: coffee login --username <name>');
        process.exit(1);
      }

      const maskedToken = config.token.slice(0, 8) + '...' + config.token.slice(-4);

      jsonOutput({
        username: config.username,
        apiUrl: config.apiUrl,
        token: maskedToken,
      }, program);

      divider();
      console.log(`  ${chalk.bold('User:')}   ${chalk.white(config.username)}`);
      console.log(`  ${chalk.bold('Server:')} ${chalk.gray(config.apiUrl)}`);
      console.log(`  ${chalk.bold('Token:')}  ${chalk.gray(maskedToken)}`);
      divider();
    });
}
