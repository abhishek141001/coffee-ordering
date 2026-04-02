import chalk from 'chalk';
import { publicApiCall } from '../lib/api.js';
import { getLocation } from '../lib/config.js';
import { error, info, divider, table, jsonOutput } from '../lib/ui.js';

function isOpen(hours) {
  if (!hours) return true;
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return currentTime >= hours.open && currentTime <= hours.close;
}

export function registerShopsCommand(program) {
  program
    .command('shops')
    .description('Find nearby coffee shops')
    .option('--radius <meters>', 'Search radius in meters', '200')
    .action(async (options) => {
      const location = getLocation();

      if (!location) {
        error('Location not set.', 'Run: coffee location --lat <lat> --lng <lng>');
        process.exit(1);
      }

      const data = await publicApiCall(
        'GET',
        `/shops/nearby?lat=${location.lat}&lng=${location.lng}&radius=${options.radius}`,
        { message: 'Finding nearby shops...' }
      );

      if (!data || !data.shops) {
        error('Could not fetch shops.', 'Is the backend running?');
        process.exit(1);
      }

      jsonOutput(data, program);

      divider();

      if (data.shops.length === 0) {
        info(`No coffee shops found within ${options.radius}m of your location.`);
        divider();
        return;
      }

      console.log(chalk.bold(`  ☕  Nearby Coffee Shops (within ${options.radius}m)`));
      console.log('');

      const headers = ['#', 'Shop', 'Distance', 'Status', 'Address'];
      const rows = data.shops.map((shop, i) => {
        const open = isOpen(shop.operatingHours);
        return [
          chalk.gray(String(i + 1)),
          chalk.bold.white(shop.name),
          `${shop.distance}m`,
          open ? chalk.green('OPEN') : chalk.red('CLOSED'),
          chalk.gray(shop.address || '—'),
        ];
      });

      table(headers, rows);
      console.log('');
      info(`Use shop ID to order: coffee order --shop <shop_id>`);
      divider();
    });
}
