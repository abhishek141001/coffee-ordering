import { CLEAR, BOLD, RESET, AMBER, BROWN, GREEN, RED, BLUE, YELLOW, GRAY, WHITE, BG_GREEN, BG_AMBER, BG_RED } from '../app.js';
import { getOrderHistory } from '../../lib/api.js';
import { showShops } from './shops.js';

function getStatusDisplay(status) {
  const map = {
    pending_payment: `${BG_AMBER} PENDING ${RESET}`,
    paid: `${BLUE}${BOLD} PAID ${RESET}`,
    accepted: `${BG_GREEN} ACCEPTED ${RESET}`,
    rejected: `${BG_RED} REJECTED ${RESET}`,
  };
  return map[status] || status;
}

export function showHistory(stream, ctx) {
  const { navigate, session } = ctx;
  let orders = [];
  let selected = 0;
  let scrollOffset = 0;
  const PAGE_SIZE = 8;

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function render() {
    stream.write(CLEAR);
    stream.write(`\r\n`);
    stream.write(`  ${BOLD}${AMBER}☕ Order History${RESET}  ${GRAY}(${orders.length} order${orders.length !== 1 ? 's' : ''})${RESET}\r\n`);
    stream.write(`  ${BROWN}──────────────────────────────────────────────────${RESET}\r\n`);
    stream.write(`\r\n`);

    if (orders.length === 0) {
      stream.write(`  ${GRAY}No orders yet. Go order some coffee!${RESET}\r\n`);
      stream.write(`\r\n`);
      stream.write(`  ${GRAY}[b] Back to shops  [q] Quit${RESET}\r\n`);
      return;
    }

    // Header
    stream.write(`  ${GRAY}${'#'.padEnd(4)}${'Item'.padEnd(26)}${'Price'.padEnd(10)}${'Status'}${RESET}\r\n`);
    stream.write(`  ${GRAY}${'─'.repeat(52)}${RESET}\r\n`);

    const visible = orders.slice(scrollOffset, scrollOffset + PAGE_SIZE);
    visible.forEach((order, i) => {
      const idx = scrollOffset + i;
      const indicator = idx === selected ? `${BG_AMBER} > ${RESET}` : '   ';
      const num = `${idx + 1}.`.padEnd(4);

      const hasMultiple = order.items && order.items.length > 1;
      const itemDisplay = hasMultiple
        ? `${order.items.length} items`
        : `${cap(order.item)} (${cap(order.size)})`;

      const price = `₹${order.totalPrice || order.price}`;
      const status = getStatusDisplay(order.status);
      const date = new Date(order.createdAt).toLocaleDateString();

      const nameStr = idx === selected ? `${BOLD}${WHITE}${itemDisplay}${RESET}` : `${WHITE}${itemDisplay}${RESET}`;
      stream.write(`  ${indicator}${GRAY}${num}${RESET}${nameStr.padEnd(38)}${YELLOW}${price.padEnd(10)}${RESET}${status} ${GRAY}${date}${RESET}\r\n`);

      // Show items detail for selected multi-item order
      if (idx === selected && hasMultiple) {
        order.items.forEach((entry) => {
          stream.write(`       ${GRAY}• ${cap(entry.item)} (${cap(entry.size)}) — ₹${entry.price}${RESET}\r\n`);
        });
      }
    });

    if (orders.length > PAGE_SIZE) {
      stream.write(`\r\n  ${GRAY}Showing ${scrollOffset + 1}-${Math.min(scrollOffset + PAGE_SIZE, orders.length)} of ${orders.length}${RESET}\r\n`);
    }

    stream.write(`\r\n`);
    stream.write(`  ${GRAY}[↑↓] Navigate  [b] Back to shops  [q] Quit${RESET}\r\n`);
  }

  async function load() {
    stream.write(CLEAR);
    stream.write(`\r\n  ${YELLOW}Loading order history...${RESET}\r\n`);

    try {
      const data = await getOrderHistory(session.token);
      orders = data.orders || [];
      render();
    } catch (error) {
      stream.write(`  ${RED}✖ ${error.message}${RESET}\r\n`);
      stream.write(`  ${GRAY}Press any key to go back${RESET}\r\n`);
      stream.once('data', () => navigate(showShops));
    }
  }

  load();

  const onData = (data) => {
    const key = data.toString();

    if (key === '\x1b[A') {
      selected = Math.max(0, selected - 1);
      if (selected < scrollOffset) scrollOffset = selected;
      render();
    } else if (key === '\x1b[B') {
      selected = Math.min(orders.length - 1, selected + 1);
      if (selected >= scrollOffset + PAGE_SIZE) scrollOffset = selected - PAGE_SIZE + 1;
      render();
    } else if (key === 'b' || key === '\x7f') {
      navigate(showShops);
    } else if (key === 'q' || key === '\x03') {
      stream.write(`\r\n  ${GRAY}Goodbye! ☕${RESET}\r\n\r\n`);
      stream.end();
    }
  };

  stream.on('data', onData);

  return () => stream.removeListener('data', onData);
}
