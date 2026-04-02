import chalk from 'chalk';
import { apiCall } from '../lib/api.js';
import { getAuthConfig } from '../lib/config.js';
import { error, info, divider, formatPrice, statusBadge, capitalize, table, jsonOutput } from '../lib/ui.js';

export function registerHistoryCommand(program) {
  program
    .command('history')
    .description('View your order history')
    .action(async () => {
      const config = getAuthConfig();
      if (!config) {
        error('Not logged in.', 'Run: coffee login --username <name>');
        process.exit(1);
      }

      const data = await apiCall('GET', '/order/history', null, { message: 'Fetching order history...' });

      jsonOutput(data, program);

      if (data.orders.length === 0) {
        divider();
        info('No orders yet. Place one with: coffee order');
        divider();
        return;
      }

      divider();
      console.log(chalk.bold('  ☕  Order History'));
      console.log('');

      const headers = ['#', 'Shop', 'Item', 'Price', 'Status', 'Date'];
      const rows = data.orders.map((order, i) => {
        const hasMultiple = order.items && order.items.length > 1;
        const itemDisplay = hasMultiple
          ? `${order.items.length} items`
          : `${capitalize(order.item)} (${capitalize(order.size)})`;
        return [
          chalk.gray(String(i + 1)),
          order.shopName || chalk.gray('—'),
          itemDisplay,
          chalk.yellow(formatPrice(order.totalPrice || order.price)),
          statusBadge(order.status),
          chalk.gray(new Date(order.createdAt).toLocaleDateString()),
        ];
      });

      table(headers, rows);
      divider();
    });
}
