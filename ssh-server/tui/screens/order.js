import QRCode from 'qrcode';
import { CLEAR, BOLD, RESET, AMBER, BROWN, GREEN, RED, YELLOW, CYAN, GRAY, WHITE } from '../app.js';
import { createOrder, requestLocationToken, getLocationStatus } from '../../lib/api.js';
import { showStatus } from './status.js';
import { showMenu } from './menu.js';

export function showOrderConfirm(stream, ctx) {
  const { navigate, session } = ctx;
  const cart = session.cart || [];
  const order = session.orderDetails;
  const shopName = order.shopName;
  const shopId = order.shopId;
  let mode = 'confirm'; // 'confirm' | 'location_update'
  let pollTimer = null;

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

    // Show location
    const locLabel = session.location?.city || session.location?.address || '';
    if (locLabel) {
      stream.write(`  ${BOLD}📍${RESET}      ${GRAY}${locLabel}${RESET}  ${GRAY}[u] update${RESET}\r\n`);
    } else {
      stream.write(`  ${BOLD}📍${RESET}      ${YELLOW}No location set${RESET}  ${GRAY}[u] set location${RESET}\r\n`);
    }

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
    stream.write(`  ${GREEN}[Enter]${RESET} Confirm Order  ${GRAY}[Backspace] Back  [u] Update location  [q] Quit${RESET}\r\n`);
  }

  render();

  async function startLocationUpdate() {
    mode = 'location_update';
    try {
      const tokenResult = await requestLocationToken(session.token);
      stream.write(CLEAR);
      stream.write(`\r\n`);
      stream.write(`  ${BOLD}${AMBER}📍 Update Location${RESET}\r\n`);
      stream.write(`  ${BROWN}─────────────────────────────────────────────${RESET}\r\n`);
      stream.write(`\r\n`);
      stream.write(`  ${WHITE}Open this link on your phone or browser:${RESET}\r\n`);
      stream.write(`\r\n`);
      stream.write(`  ${CYAN}${BOLD}${tokenResult.url}${RESET}\r\n`);
      stream.write(`\r\n`);
      stream.write(`  ${YELLOW}Waiting for location...${RESET}\r\n`);
      stream.write(`\r\n`);
      stream.write(`  ${GRAY}[Enter] Skip${RESET}\r\n`);

      let attempts = 0;
      pollTimer = setInterval(async () => {
        attempts++;
        if (attempts >= 40) {
          clearInterval(pollTimer);
          pollTimer = null;
          mode = 'confirm';
          render();
          return;
        }

        try {
          const locStatus = await getLocationStatus(session.token);
          if (locStatus.hasLocation) {
            clearInterval(pollTimer);
            pollTimer = null;
            session.location = {
              lat: locStatus.location.lat,
              lng: locStatus.location.lng,
              city: locStatus.location.address || '',
            };
            stream.write(`\r\n  ${GREEN}✔ Location updated!${RESET}\r\n`);
            setTimeout(() => { mode = 'confirm'; render(); }, 500);
          }
        } catch {
          // ignore poll errors
        }
      }, 3000);
    } catch {
      mode = 'confirm';
      render();
    }
  }

  const onData = async (data) => {
    const key = data.toString();

    if (key === '\x03') {
      if (pollTimer) clearInterval(pollTimer);
      stream.write(`\r\n  ${GRAY}Goodbye! ☕${RESET}\r\n\r\n`);
      stream.end();
      return;
    }

    if (mode === 'location_update') {
      if (key === '\r' || key === '\n') {
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
        mode = 'confirm';
        render();
      }
      return;
    }

    if (key === 'u') {
      startLocationUpdate();
      return;
    }

    if (key === '\r' || key === '\n') {
      stream.removeListener('data', onData);
      stream.write(`\r\n  ${YELLOW}Placing order...${RESET}\r\n`);

      try {
        const itemsPayload = cart.length > 0
          ? cart.map((c) => ({ item: c.item, size: c.size }))
          : [{ item: order.item, size: order.size }];

        const orderPayload = { items: itemsPayload, shopId };
        if (session.location?.lat && session.location?.lng) {
          orderPayload.userLocation = {
            lat: session.location.lat,
            lng: session.location.lng,
            address: session.location.city || session.location.address || '',
          };
        }

        const result = await createOrder(session.token, orderPayload);

        stream.write(CLEAR);
        stream.write(`\r\n`);
        stream.write(`  ${GREEN}${BOLD}✔ Order placed!${RESET}\r\n`);
        stream.write(`\r\n`);
        stream.write(`  ${BOLD}Order ID:${RESET} ${GRAY}${result.orderId}${RESET}\r\n`);
        stream.write(`  ${BOLD}Total:${RESET}    ${YELLOW}₹${result.totalPrice || result.price}${RESET}\r\n`);
        stream.write(`\r\n`);
        stream.write(`  ${BOLD}💳 Scan QR to pay:${RESET}\r\n`);

        try {
          const qrString = await QRCode.toString(result.paymentLink, { type: 'terminal', small: true });
          // Convert newlines to \r\n for SSH stream and indent
          const qrLines = qrString.split('\n').map((line) => `  ${line}`).join('\r\n');
          stream.write(`${qrLines}\r\n`);
        } catch {
          // QR generation failed, skip
        }

        stream.write(`  ${BOLD}Or open payment link:${RESET}\r\n`);
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
    } else if (key === 'q') {
      stream.write(`\r\n  ${GRAY}Goodbye! ☕${RESET}\r\n\r\n`);
      stream.end();
    }
  };

  stream.on('data', onData);

  return () => {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    stream.removeListener('data', onData);
  };
}
