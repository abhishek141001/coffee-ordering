#!/usr/bin/env node

import { Command } from 'commander';
import { banner } from './lib/ui.js';
import { registerSignupCommand, registerLoginCommand } from './commands/login.js';
import { registerLogoutCommand } from './commands/logout.js';
import { registerWhoamiCommand } from './commands/whoami.js';
import { registerLocationCommand } from './commands/location.js';
import { registerShopsCommand } from './commands/shops.js';
import { registerMenuCommand } from './commands/menu.js';
import { registerOrderCommand } from './commands/order.js';
import { registerStatusCommand } from './commands/status.js';
import { registerHistoryCommand } from './commands/history.js';
import { registerHelpCommand } from './commands/help.js';

const program = new Command();

program
  .name('coffee')
  .description('Order coffee from your terminal')
  .version('1.0.0')
  .option('--json', 'Output raw JSON (for scripting)')
  .hook('preAction', () => {
    if (!program.opts().json) {
      banner();
    }
  });

// Register all commands
registerSignupCommand(program);
registerLoginCommand(program);
registerLogoutCommand(program);
registerWhoamiCommand(program);
registerLocationCommand(program);
registerShopsCommand(program);
registerMenuCommand(program);
registerOrderCommand(program);
registerStatusCommand(program);
registerHistoryCommand(program);
registerHelpCommand(program);

// Custom help footer
program.addHelpText('after', `
Examples:
  $ coffee signup --username john --phone "+91 98765 43210"
  $ coffee login --username john
  $ coffee location --lat 12.97 --lng 77.59
  $ coffee shops
  $ coffee menu
  $ coffee order
  $ coffee order --shop <id> --item latte --size large
  $ coffee status
  $ coffee history
  $ coffee history --json
  $ coffee whoami
  $ coffee logout
`);

program.parse();
