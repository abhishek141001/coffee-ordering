import { CLEAR, BOLD, RESET, AMBER, BROWN, GREEN, YELLOW, GRAY, WHITE, BG_AMBER } from '../app.js';
import { fetchShopMenu } from '../../lib/api.js';
import { showOrderConfirm } from './order.js';
import { showShops } from './shops.js';

export function showMenu(stream, ctx) {
  const { navigate, session } = ctx;
  const shop = session.selectedShop;
  let items = [];
  let selected = 0;
  let phase = 'item'; // 'item', 'size', or 'cart'
  let selectedItem = null;
  const sizes = ['small', 'medium', 'large'];
  let selectedSize = 1; // default medium
  const cart = [];

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function renderItems() {
    stream.write(CLEAR);
    stream.write(`\r\n`);
    stream.write(`  ${BOLD}${AMBER}☕ ${shop.name} — Menu${RESET}\r\n`);
    stream.write(`  ${BROWN}──────────────────────────────────────────${RESET}\r\n`);
    stream.write(`\r\n`);

    if (cart.length > 0) {
      stream.write(`  ${BOLD}${GREEN}🛒 Cart (${cart.length} item${cart.length > 1 ? 's' : ''}):${RESET}\r\n`);
      cart.forEach((entry, i) => {
        stream.write(`    ${GRAY}${i + 1}.${RESET} ${cap(entry.item)} (${cap(entry.size)})  ${YELLOW}₹${entry.price}${RESET}\r\n`);
      });
      stream.write(`\r\n`);
    }

    // Header
    stream.write(`  ${GRAY}${'Item'.padEnd(18)}${'Small'.padEnd(10)}${'Medium'.padEnd(10)}${'Large'.padEnd(10)}${RESET}\r\n`);
    stream.write(`  ${GRAY}${'─'.repeat(48)}${RESET}\r\n`);

    items.forEach((item, i) => {
      const indicator = i === selected ? `${BG_AMBER} > ${RESET} ` : '    ';
      const name = cap(item.name);
      const nameStr = i === selected ? `${BOLD}${WHITE}${name}${RESET}` : `${WHITE}${name}${RESET}`;
      const s = `₹${item.prices.small.price}`;
      const m = `₹${item.prices.medium.price}`;
      const l = `₹${item.prices.large.price}`;
      stream.write(`  ${indicator}${nameStr.padEnd(30)}${YELLOW}${s.padEnd(10)}${m.padEnd(10)}${l}${RESET}\r\n`);
    });

    stream.write(`\r\n`);
    stream.write(`  ${GRAY}[↑↓] Navigate  [Enter] Select  [Backspace] Back  [q] Quit${RESET}\r\n`);
  }

  function renderSizes() {
    stream.write(CLEAR);
    stream.write(`\r\n`);
    const itemName = cap(selectedItem.name);
    stream.write(`  ${BOLD}${AMBER}Select size for ${itemName}${RESET}\r\n`);
    stream.write(`  ${BROWN}──────────────────────────────${RESET}\r\n`);
    stream.write(`\r\n`);

    sizes.forEach((size, i) => {
      const indicator = i === selectedSize ? `${BG_AMBER} > ${RESET} ` : '    ';
      const label = cap(size);
      const price = `₹${selectedItem.prices[size].price}`;
      const nameStr = i === selectedSize ? `${BOLD}${WHITE}${label}${RESET}` : `${WHITE}${label}${RESET}`;
      stream.write(`  ${indicator}${nameStr.padEnd(25)}${YELLOW}${price}${RESET}\r\n`);
    });

    stream.write(`\r\n`);
    stream.write(`  ${GRAY}[↑↓] Navigate  [Enter] Select  [Backspace] Back${RESET}\r\n`);
  }

  function renderCart() {
    stream.write(CLEAR);
    stream.write(`\r\n`);
    stream.write(`  ${BOLD}${AMBER}🛒 Your Cart${RESET}\r\n`);
    stream.write(`  ${BROWN}──────────────────────────────────────${RESET}\r\n`);
    stream.write(`\r\n`);

    cart.forEach((entry, i) => {
      stream.write(`  ${GRAY}${i + 1}.${RESET} ${cap(entry.item)} (${cap(entry.size)})  ${YELLOW}₹${entry.price}${RESET}\r\n`);
    });
    const total = cart.reduce((sum, e) => sum + e.price, 0);
    stream.write(`\r\n`);
    stream.write(`  ${BOLD}Total: ${YELLOW}₹${total}${RESET}\r\n`);
    stream.write(`\r\n`);
    stream.write(`  ${GREEN}[a]${RESET} Add another item  ${GREEN}[Enter]${RESET} Checkout  ${GRAY}[Backspace] Remove last  [q] Quit${RESET}\r\n`);
  }

  async function load() {
    stream.write(CLEAR);
    stream.write(`\r\n  ${YELLOW}Loading menu...${RESET}\r\n`);

    try {
      const data = await fetchShopMenu(shop._id);
      items = data.items || [];
      renderItems();
    } catch (error) {
      stream.write(`  ${GRAY}Error: ${error.message}${RESET}\r\n`);
    }
  }

  load();

  const onData = (data) => {
    const key = data.toString();

    if (phase === 'item') {
      if (key === '\x1b[A') {
        selected = Math.max(0, selected - 1);
        renderItems();
      } else if (key === '\x1b[B') {
        selected = Math.min(items.length - 1, selected + 1);
        renderItems();
      } else if (key === '\r' || key === '\n') {
        if (items.length > 0) {
          selectedItem = items[selected];
          phase = 'size';
          selectedSize = 1;
          renderSizes();
        }
      } else if (key === '\x7f' || key === '\x1b[D') {
        if (cart.length > 0) {
          // If cart has items, go to cart view instead of leaving
          phase = 'cart';
          renderCart();
        } else {
          navigate(showShops);
        }
      } else if (key === 'q' || key === '\x03') {
        stream.write(`\r\n  ${GRAY}Goodbye! ☕${RESET}\r\n\r\n`);
        stream.end();
      }
    } else if (phase === 'size') {
      if (key === '\x1b[A') {
        selectedSize = Math.max(0, selectedSize - 1);
        renderSizes();
      } else if (key === '\x1b[B') {
        selectedSize = Math.min(sizes.length - 1, selectedSize + 1);
        renderSizes();
      } else if (key === '\r' || key === '\n') {
        const size = sizes[selectedSize];
        const price = selectedItem.prices[size].price;
        cart.push({ item: selectedItem.name, size, price });
        phase = 'cart';
        renderCart();
      } else if (key === '\x7f') {
        phase = 'item';
        renderItems();
      } else if (key === 'q' || key === '\x03') {
        stream.write(`\r\n  ${GRAY}Goodbye! ☕${RESET}\r\n\r\n`);
        stream.end();
      }
    } else if (phase === 'cart') {
      if (key === 'a' || key === 'A') {
        // Add another item
        phase = 'item';
        selected = 0;
        renderItems();
      } else if (key === '\r' || key === '\n') {
        // Proceed to checkout
        session.cart = cart.map((c) => ({ ...c }));
        session.orderDetails = {
          shopId: shop._id,
          shopName: shop.name,
          item: cart[0].item,
          size: cart[0].size,
          price: cart[0].price,
        };
        navigate(showOrderConfirm);
      } else if (key === '\x7f') {
        // Remove last item
        cart.pop();
        if (cart.length === 0) {
          phase = 'item';
          selected = 0;
          renderItems();
        } else {
          renderCart();
        }
      } else if (key === 'q' || key === '\x03') {
        stream.write(`\r\n  ${GRAY}Goodbye! ☕${RESET}\r\n\r\n`);
        stream.end();
      }
    }
  };

  stream.on('data', onData);

  return () => stream.removeListener('data', onData);
}
