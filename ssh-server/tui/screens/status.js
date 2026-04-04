import { CLEAR, BOLD, RESET, AMBER, BROWN, GREEN, RED, BLUE, YELLOW, GRAY, WHITE, CYAN, BG_GREEN, BG_AMBER, BG_RED } from '../app.js';
import { getOrderStatus } from '../../lib/api.js';
import { showShops } from './shops.js';

function getStatusDisplay(status) {
  const map = {
    pending_payment: `${BG_AMBER} PENDING PAYMENT ${RESET}`,
    paid: `${BLUE}${BOLD} PAID ${RESET}`,
    accepted: `${BG_GREEN} ACCEPTED ${RESET}`,
    rejected: `${BG_RED} REJECTED ${RESET}`,
  };
  return map[status] || status;
}

export function showStatus(stream, ctx) {
  const { navigate, session } = ctx;
  let interval = null;
  let xpShownForOrder = null; // track which orderId we already showed XP for

  async function render() {
    try {
      const data = await getOrderStatus(session.token);
      const status = getStatusDisplay(data.status);
      const date = new Date(data.createdAt).toLocaleString();
      const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

      stream.write(CLEAR);
      stream.write(`\r\n`);
      stream.write(`  ${BOLD}${AMBER}☕ Order Status${RESET}  ${GRAY}(auto-refreshing)${RESET}\r\n`);
      stream.write(`  ${BROWN}──────────────────────────────────────${RESET}\r\n`);
      stream.write(`\r\n`);
      stream.write(`  ${BOLD}Order:${RESET}  ${GRAY}${data.orderId}${RESET}\r\n`);
      if (data.shopName) {
        stream.write(`  ${BOLD}Shop:${RESET}   ${data.shopName}\r\n`);
      }
      if (data.items && data.items.length > 1) {
        stream.write(`  ${BOLD}Items:${RESET}\r\n`);
        data.items.forEach((entry, i) => {
          stream.write(`    ${GRAY}${i + 1}.${RESET} ${cap(entry.item)} (${cap(entry.size)})  ${YELLOW}₹${entry.price}${RESET}\r\n`);
        });
        stream.write(`  ${BOLD}Total:${RESET}  ${YELLOW}₹${data.totalPrice}${RESET}\r\n`);
      } else {
        stream.write(`  ${BOLD}Item:${RESET}   ${cap(data.item)}\r\n`);
        stream.write(`  ${BOLD}Size:${RESET}   ${cap(data.size)}\r\n`);
        stream.write(`  ${BOLD}Price:${RESET}  ${YELLOW}₹${data.totalPrice || data.price}${RESET}\r\n`);
      }
      stream.write(`  ${BOLD}Status:${RESET} ${status}\r\n`);
      if (data.eta) {
        stream.write(`  ${BOLD}ETA:${RESET}    ${GREEN}${data.eta} minutes${RESET}\r\n`);
      }
      if (data.shopPhone) {
        stream.write(`  ${BOLD}Phone:${RESET}  ${GREEN}${data.shopPhone}${RESET}\r\n`);
      }
      stream.write(`  ${BOLD}Date:${RESET}   ${GRAY}${date}${RESET}\r\n`);

      if (data.status === 'paid') {
        stream.write(`\r\n`);
        stream.write(`  ${YELLOW}⏳ Waiting for shop confirmation...${RESET}\r\n`);
      } else if (data.status === 'accepted') {
        stream.write(`\r\n`);
        stream.write(`  ${GREEN}✅ Your order is being prepared!${RESET}\r\n`);
        // Show gamification data once per order
        if (data.gamification && xpShownForOrder !== String(data.orderId)) {
          xpShownForOrder = String(data.orderId);
          const g = data.gamification;
          stream.write(`\r\n`);
          stream.write(`  ${CYAN}⚡${RESET} ${BOLD}${WHITE}${g.rank}${RESET}  ${YELLOW}Level ${g.level}${RESET}  ${GRAY}${g.totalXP} XP${RESET}\r\n`);
          if (g.currentStreak > 0) {
            stream.write(`  ${RED}🔥${RESET} ${WHITE}Streak: ${GREEN}${g.currentStreak} day${g.currentStreak !== 1 ? 's' : ''}${RESET}\r\n`);
          }
        }
      } else if (data.status === 'rejected') {
        stream.write(`\r\n`);
        stream.write(`  ${RED}❌ Order was rejected by the shop.${RESET}\r\n`);
      }

      stream.write(`\r\n`);
      stream.write(`  ${GRAY}[r] Refresh  [b] Back to shops  [q] Quit${RESET}\r\n`);
    } catch (error) {
      stream.write(`\r\n  ${RED}Error: ${error.message}${RESET}\r\n`);
    }
  }

  render();
  interval = setInterval(render, 3000);

  const onData = (data) => {
    const key = data.toString();

    if (key === 'r') {
      render();
    } else if (key === 'b' || key === '\x7f') {
      clearInterval(interval);
      navigate(showShops);
    } else if (key === 'q' || key === '\x03') {
      clearInterval(interval);
      stream.write(`\r\n  ${GRAY}Goodbye! ☕${RESET}\r\n\r\n`);
      stream.end();
    }
  };

  stream.on('data', onData);

  return () => {
    if (interval) clearInterval(interval);
    stream.removeListener('data', onData);
  };
}
