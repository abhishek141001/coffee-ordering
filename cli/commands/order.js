import chalk from 'chalk';
import inquirer from 'inquirer';
import qrcode from 'qrcode-terminal';
import { apiCall, publicApiCall } from '../lib/api.js';
import { getAuthConfig, getLocation } from '../lib/config.js';
import { success, error, divider, formatPrice, capitalize, jsonOutput } from '../lib/ui.js';

function printQRCode(url) {
  return new Promise((resolve) => {
    qrcode.generate(url, { small: true }, (qr) => {
      console.log('');
      console.log(qr);
      resolve();
    });
  });
}

const FALLBACK_ITEMS = ['cappuccino', 'latte', 'espresso'];
const FALLBACK_SIZES = ['small', 'medium', 'large'];

async function fetchNearbyShops(location) {
  const data = await publicApiCall(
    'GET',
    `/shops/nearby?lat=${location.lat}&lng=${location.lng}&radius=200`,
    { message: 'Finding nearby shops...' }
  );
  return data?.shops || [];
}

async function fetchShopMenu(shopId) {
  const menu = await publicApiCall('GET', `/shops/${shopId}/menu`, { message: 'Fetching menu...' });
  return menu;
}

async function fetchGlobalMenu() {
  const menu = await publicApiCall('GET', '/menu', { message: 'Fetching menu...' });
  return menu;
}

function buildItemChoices(menu) {
  return menu.items.map((item) => ({
    name: `${capitalize(item.name).padEnd(14)} ${chalk.gray(item.description || '')}`,
    value: item.name,
  }));
}

function buildSizeChoices(menu, itemName) {
  const item = menu.items.find((i) => i.name === itemName);
  if (!item) return FALLBACK_SIZES.map((s) => ({ name: capitalize(s), value: s }));

  return Object.entries(item.prices).map(([size, config]) => ({
    name: `${capitalize(size).padEnd(10)} ${chalk.yellow(formatPrice(config.price))}`,
    value: size,
  }));
}

function getItemPrice(menu, itemName, size) {
  const item = menu?.items?.find((i) => i.name === itemName);
  if (item?.prices?.[size]) return item.prices[size].price;
  return null;
}

function printCart(cart) {
  console.log('');
  console.log(chalk.bold('  🛒 Cart:'));
  cart.forEach((entry, i) => {
    console.log(`    ${chalk.gray(`${i + 1}.`)} ${capitalize(entry.item)} (${capitalize(entry.size)})  ${chalk.yellow(formatPrice(entry.price))}`);
  });
  const total = cart.reduce((sum, e) => sum + e.price, 0);
  console.log(`    ${chalk.bold('Total:')} ${chalk.yellow(formatPrice(total))}`);
  console.log('');
}

export function registerOrderCommand(program) {
  program
    .command('order')
    .description('Place a coffee order')
    .option('--item <item>', 'Coffee item')
    .option('--size <size>', 'Size (small, medium, large)')
    .option('--shop <shopId>', 'Shop ID (skip shop selection)')
    .action(async (options) => {
      const config = getAuthConfig();
      if (!config) {
        error('Not logged in.', 'Run: coffee login --username <name>');
        process.exit(1);
      }

      let { item, size, shop: shopId } = options;
      let menu = null;

      // Shop selection (interactive if no --shop flag)
      if (!shopId) {
        const location = getLocation();

        if (location) {
          const shops = await fetchNearbyShops(location);

          if (shops.length > 0) {
            if (shops.length === 1) {
              shopId = shops[0]._id;
              console.log(chalk.gray(`  Auto-selected: ${shops[0].name} (${shops[0].distance}m)`));
            } else {
              const { selectedShop } = await inquirer.prompt([
                {
                  type: 'list',
                  name: 'selectedShop',
                  message: 'Select a coffee shop:',
                  choices: shops.map((s) => ({
                    name: `${s.name.padEnd(20)} ${chalk.gray(`${s.distance}m`)}`,
                    value: s._id,
                  })),
                },
              ]);
              shopId = selectedShop;
            }
          }
        }
      }

      // Fetch menu (shop-specific or global)
      if (shopId) {
        menu = await fetchShopMenu(shopId);
      }
      if (!menu) {
        menu = await fetchGlobalMenu();
      }

      // Non-interactive mode (--item and --size flags)
      if (item && size) {
        const location = getLocation();
        const body = { item: item.toLowerCase(), size: size.toLowerCase() };
        if (shopId) body.shopId = shopId;
        if (location) body.userLocation = { lat: location.lat, lng: location.lng };

        const data = await apiCall('POST', '/order', body, { message: 'Placing your order...' });
        jsonOutput(data, program);

        divider();
        success('Order placed!');
        console.log('');
        if (data.shopName) {
          console.log(`  ${chalk.bold('Shop:')}     ${data.shopName}`);
        }
        console.log(`  ${chalk.bold('Item:')}     ${capitalize(data.item)}`);
        console.log(`  ${chalk.bold('Size:')}     ${capitalize(data.size)}`);
        console.log(`  ${chalk.bold('Price:')}    ${chalk.yellow(formatPrice(data.price))}`);
        console.log(`  ${chalk.bold('Order ID:')} ${chalk.gray(data.orderId)}`);
        console.log('');
        console.log(chalk.bold('  💳 Scan QR to pay:'));
        await printQRCode(data.paymentLink);
        console.log(chalk.bold('  Or open payment link:'));
        console.log(`  ${chalk.cyan.underline(data.paymentLink)}`);
        console.log('');
        console.log(chalk.gray('  After payment, run: coffee status --wait'));
        divider();
        return;
      }

      // Interactive cart flow
      const cart = [];
      let addMore = true;

      while (addMore) {
        const choices = menu
          ? buildItemChoices(menu)
          : FALLBACK_ITEMS.map((i) => ({ name: capitalize(i), value: i }));

        const itemAnswer = await inquirer.prompt([
          {
            type: 'list',
            name: 'item',
            message: 'What would you like to order?',
            choices,
          },
        ]);

        const sizeChoices = menu
          ? buildSizeChoices(menu, itemAnswer.item)
          : FALLBACK_SIZES.map((s) => ({ name: capitalize(s), value: s }));

        const sizeAnswer = await inquirer.prompt([
          {
            type: 'list',
            name: 'size',
            message: 'What size?',
            choices: sizeChoices,
            default: 'medium',
          },
        ]);

        const price = getItemPrice(menu, itemAnswer.item, sizeAnswer.size) || 0;
        cart.push({ item: itemAnswer.item, size: sizeAnswer.size, price });

        printCart(cart);

        const { more } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'more',
            message: 'Add another item?',
            default: false,
          },
        ]);
        addMore = more;
      }

      // Final confirmation
      printCart(cart);
      const total = cart.reduce((sum, e) => sum + e.price, 0);

      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Place order (${cart.length} item${cart.length > 1 ? 's' : ''}, ${formatPrice(total)})?`,
          default: true,
        },
      ]);

      if (!confirm) {
        divider();
        console.log(chalk.gray('  Order cancelled.'));
        divider();
        return;
      }

      const location = getLocation();
      const body = { items: cart.map((c) => ({ item: c.item.toLowerCase(), size: c.size.toLowerCase() })) };
      if (shopId) body.shopId = shopId;
      if (location) body.userLocation = { lat: location.lat, lng: location.lng };

      const data = await apiCall('POST', '/order', body, { message: 'Placing your order...' });
      jsonOutput(data, program);

      divider();
      success('Order placed!');
      console.log('');
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
      console.log(`  ${chalk.bold('Order ID:')} ${chalk.gray(data.orderId)}`);
      console.log('');
      console.log(chalk.bold('  💳 Scan QR to pay:'));
      await printQRCode(data.paymentLink);
      console.log(chalk.bold('  Or open payment link:'));
      console.log(`  ${chalk.cyan.underline(data.paymentLink)}`);
      console.log('');
      console.log(chalk.gray('  After payment, run: coffee status --wait'));
      divider();
    });
}
