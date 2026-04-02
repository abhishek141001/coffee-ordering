import chalk from 'chalk';
import ora from 'ora';
import { apiCall } from '../lib/api.js';
import { getAuthConfig } from '../lib/config.js';
import { error, divider, formatPrice, statusBadge, capitalize, jsonOutput } from '../lib/ui.js';

function printOrder(data) {
  divider();
  console.log(chalk.bold('  ☕  Order Status'));
  console.log('');
  console.log(`  ${chalk.bold('Order ID:')} ${chalk.gray(data.orderId)}`);
  if (data.shopName) {
    console.log(`  ${chalk.bold('Shop:')}     ${data.shopName}`);
  }
  if (data.items && data.items.length > 1) {
    console.log(chalk.bold('  Items:'));
    data.items.forEach((entry, i) => {
      console.log(`    ${chalk.gray(`${i + 1}.`)} ${capitalize(entry.item)} (${capitalize(entry.size)})  ${chalk.yellow(formatPrice(entry.price))}`);
    });
    console.log(`  ${chalk.bold('Total:')}    ${chalk.yellow(formatPrice(data.totalPrice))}`);
  } else {
    console.log(`  ${chalk.bold('Item:')}     ${capitalize(data.item)}`);
    console.log(`  ${chalk.bold('Size:')}     ${capitalize(data.size)}`);
    console.log(`  ${chalk.bold('Price:')}    ${chalk.yellow(formatPrice(data.totalPrice || data.price))}`);
  }
  console.log(`  ${chalk.bold('Status:')}   ${statusBadge(data.status)}`);
  if (data.status === 'rejected' && data.refundStatus === 'processed') {
    console.log(`  ${chalk.bold('Refund:')}   ${statusBadge('refunded')}  ${chalk.gray('Amount will be credited in 5-7 business days.')}`);
  } else if (data.status === 'rejected' && data.refundStatus === 'failed') {
    console.log(`  ${chalk.bold('Refund:')}   ${chalk.red('Failed')}  ${chalk.gray('Please contact support for a manual refund.')}`);
  }
  if (data.eta) {
    console.log(`  ${chalk.bold('ETA:')}      ${chalk.cyan(`${data.eta} minutes`)}`);
  }
  if (data.shopPhone) {
    console.log(`  ${chalk.bold('Phone:')}    ${chalk.cyan(data.shopPhone)}`);
  }
  console.log(`  ${chalk.bold('Date:')}     ${chalk.gray(new Date(data.createdAt).toLocaleString())}`);
  divider();
}

export function registerStatusCommand(program) {
  program
    .command('status')
    .description('Check your latest order status')
    .option('--wait', 'Wait for shop confirmation (polls for 2 minutes)')
    .action(async (options) => {
      const config = getAuthConfig();
      if (!config) {
        error('Not logged in.', 'Run: coffee login --username <name>');
        process.exit(1);
      }

      const data = await apiCall('GET', '/order/status', null, { message: 'Fetching order status...' });

      jsonOutput(data, program);

      // If --wait flag and order is paid (waiting for shop), poll
      if (options.wait && data.status === 'paid') {
        const spinner = ora({
          text: 'Waiting for shop to confirm your order...',
          color: 'yellow',
        }).start();

        const startTime = Date.now();
        const TIMEOUT = 2 * 60 * 1000; // 2 minutes
        const POLL_INTERVAL = 3000; // 3 seconds

        while (Date.now() - startTime < TIMEOUT) {
          await new Promise((r) => setTimeout(r, POLL_INTERVAL));

          try {
            const updated = await fetch(
              `${config.apiUrl || 'http://localhost:5000'}/order/status`,
              { headers: { Authorization: `Bearer ${config.token}` } }
            ).then((r) => r.json());

            const elapsed = Math.round((Date.now() - startTime) / 1000);
            spinner.text = `Waiting for shop confirmation... (${elapsed}s)`;

            if (updated.status === 'accepted') {
              spinner.succeed(chalk.green('Order confirmed by the shop!'));
              printOrder(updated);
              return;
            } else if (updated.status === 'rejected') {
              spinner.fail(chalk.red('Order was rejected by the shop.'));
              printOrder(updated);
              return;
            }
          } catch {
            // Ignore polling errors, keep trying
          }
        }

        spinner.fail('Shop did not respond within 2 minutes. Order auto-rejected.');
        const final = await apiCall('GET', '/order/status', null, { message: '' });
        printOrder(final);
        return;
      }

      printOrder(data);
    });
}
