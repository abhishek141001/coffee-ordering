import { CLEAR, BOLD, RESET, AMBER, BROWN, GREEN, RED, YELLOW, CYAN, GRAY, WHITE } from '../app.js';
import { createOrder } from '../../lib/api.js';
import { showStatus } from './status.js';
import { showMenu } from './menu.js';

export function showOrderConfirm(stream, ctx) {
  const { navigate, session } = ctx;
  const cart = session.cart || [];
  const order = session.orderDetails;
  const shopName = order.shopName;
  const shopId = order.shopId;

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function render() {
    stream.write(CLEAR);
    stream.write(`\r\n`);
    stream.write(`  ${BOLD}${AMBER}☕ Order Summary${RESET}\r\n`);
    stream.write(`  ${BROWN}──────────────────────────────${RESET}\r\n`);
    stream.write(`\r\n`);
    stream.write(`  ${BOLD}Shop:${RESET}   ${shopName}\r\n`);

    if (cart.length > 1) {
      stream.write(`  ${BOLD}Items:${RESET}\r\n`);
      cart.forEach((entry, i) => {
        stream.write(`    ${GRAY}${i + 1}.${RESET} ${cap(entry.item)} (${cap(entry.size)})  ${YELLOW}₹${entry.price}${RESET}\r\n`);
      });
      const total = cart.reduce((sum, e) => sum + e.price, 0);
      stream.write(`  ${BOLD}Total:${RESET}  ${YELLOW}₹${total}${RESET}\r\n`);
    } else {
      const item = cart.length === 1 ? cart[0] : order;
      stream.write(`  ${BOLD}Item:${RESET}   ${cap(item.item)}\r\n`);
      stream.write(`  ${BOLD}Size:${RESET}   ${cap(item.size)}\r\n`);
      stream.write(`  ${BOLD}Price:${RESET}  ${YELLOW}₹${item.price}${RESET}\r\n`);
    }

    stream.write(`\r\n`);
    stream.write(`  ${GREEN}[Enter]${RESET} Confirm Order  ${GRAY}[Backspace] Back  [q] Quit${RESET}\r\n`);
  }

  render();

  const onData = async (data) => {
    const key = data.toString();

    if (key === '\r' || key === '\n') {
      stream.removeListener('data', onData);
      stream.write(`\r\n  ${YELLOW}Placing order...${RESET}\r\n`);

      try {
        const itemsPayload = cart.length > 0
          ? cart.map((c) => ({ item: c.item, size: c.size }))
          : [{ item: order.item, size: order.size }];

        const result = await createOrder(session.token, {
          items: itemsPayload,
          shopId,
        });

        stream.write(CLEAR);
        stream.write(`\r\n`);
        stream.write(`  ${GREEN}${BOLD}✔ Order placed!${RESET}\r\n`);
        stream.write(`\r\n`);
        stream.write(`  ${BOLD}Order ID:${RESET} ${GRAY}${result.orderId}${RESET}\r\n`);
        stream.write(`  ${BOLD}Total:${RESET}    ${YELLOW}₹${result.totalPrice || result.price}${RESET}\r\n`);
        stream.write(`\r\n`);
        stream.write(`  ${BOLD}💳 Complete payment:${RESET}\r\n`);
        stream.write(`  ${CYAN}${result.paymentLink}${RESET}\r\n`);
        stream.write(`\r\n`);
        stream.write(`  ${GRAY}[Enter] Check status  [q] Quit${RESET}\r\n`);

        stream.on('data', (d) => {
          const k = d.toString();
          if (k === '\r' || k === '\n') {
            navigate(showStatus);
          } else if (k === 'q' || k === '\x03') {
            stream.write(`\r\n  ${GRAY}Goodbye! ☕${RESET}\r\n\r\n`);
            stream.end();
          }
        });
      } catch (error) {
        stream.write(`  ${RED}✖ ${error.message}${RESET}\r\n`);
        stream.write(`  ${GRAY}Press any key to go back${RESET}\r\n`);
        stream.once('data', () => navigate(showMenu));
      }
    } else if (key === '\x7f') {
      navigate(showMenu);
    } else if (key === 'q' || key === '\x03') {
      stream.write(`\r\n  ${GRAY}Goodbye! ☕${RESET}\r\n\r\n`);
      stream.end();
    }
  };

  stream.on('data', onData);

  return () => stream.removeListener('data', onData);
}
