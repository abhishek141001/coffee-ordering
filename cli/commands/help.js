import chalk from 'chalk';
import { banner, divider } from '../lib/ui.js';

const amber = chalk.hex('#FFBF00');

function cmdLine(name, desc, flags) {
  const cmd = chalk.bold.white(name.padEnd(12));
  const description = chalk.gray(desc.padEnd(36));
  const options = flags ? amber(flags) : '';
  return `    ${cmd}${description}${options}`;
}

export function registerHelpCommand(program) {
  program
    .command('help')
    .description('Show all available commands')
    .action(() => {
      banner();

      console.log(chalk.bold.white('  GETTING STARTED'));
      console.log(cmdLine('signup', 'Create a new account', '--username, --phone'));
      console.log(cmdLine('login', 'Log in to your account', '--username'));
      console.log(cmdLine('logout', 'Log out & clear credentials'));
      console.log(cmdLine('whoami', 'Show current user info'));
      divider();

      console.log(chalk.bold.white('  DISCOVERY'));
      console.log(cmdLine('location', 'Set or view your location', '--lat, --lng'));
      console.log(cmdLine('shops', 'Find nearby coffee shops', '--radius'));
      console.log(cmdLine('menu', 'View available coffee & prices'));
      divider();

      console.log(chalk.bold.white('  ORDERING'));
      console.log(cmdLine('order', 'Place a coffee order', '--item, --size, --shop'));
      console.log(cmdLine('status', 'Check latest order status', '--wait'));
      console.log(cmdLine('history', 'View your past orders'));
      divider();

      console.log(chalk.bold.white('  GLOBAL OPTIONS'));
      console.log(cmdLine('--json', 'Output raw JSON (for scripting)'));
      console.log(cmdLine('--help', 'Show help for any command'));
      console.log(cmdLine('--version', 'Show CLI version'));
      divider();

      console.log(chalk.bold.white('  EXAMPLES'));
      console.log(chalk.gray('    $ coffee signup --username john --phone "+91 98765 43210"'));
      console.log(chalk.gray('    $ coffee order --item latte --size medium'));
      console.log(chalk.gray('    $ coffee status --wait'));
      console.log(chalk.gray('    $ coffee help'));
      divider();
    });
}
