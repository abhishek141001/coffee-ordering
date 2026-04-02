import chalk from 'chalk';
import { publicApiCall } from '../lib/api.js';
import { divider, formatPrice, warn, table, jsonOutput, capitalize } from '../lib/ui.js';

const FALLBACK_MENU = {
  items: [
    { name: 'cappuccino', description: 'Classic Italian espresso with steamed milk foam', prices: { small: { price: 160 }, medium: { price: 200 }, large: { price: 240 } } },
    { name: 'latte', description: 'Smooth espresso with extra steamed milk', prices: { small: { price: 144 }, medium: { price: 180 }, large: { price: 216 } } },
    { name: 'espresso', description: 'Strong concentrated single shot', prices: { small: { price: 120 }, medium: { price: 150 }, large: { price: 180 } } },
  ],
  sizes: ['small', 'medium', 'large'],
};

export function registerMenuCommand(program) {
  program
    .command('menu')
    .description('View the coffee menu with prices')
    .action(async () => {
      let menu = await publicApiCall('GET', '/menu', { message: 'Fetching menu...' });
      let usingFallback = false;

      if (!menu) {
        menu = FALLBACK_MENU;
        usingFallback = true;
      }

      jsonOutput(menu, program);

      divider();
      console.log(chalk.bold('  ☕  Coffee Menu'));
      divider();

      if (usingFallback) {
        warn('Could not reach server. Showing cached menu (prices may differ).');
        console.log('');
      }

      const headers = ['Item', 'Small', 'Medium', 'Large', ''];
      const rows = menu.items.map((item) => [
        chalk.bold.white(capitalize(item.name)),
        formatPrice(item.prices.small.price),
        formatPrice(item.prices.medium.price),
        formatPrice(item.prices.large.price),
        chalk.gray(item.description),
      ]);

      table(headers, rows);
      divider();
    });
}
