import { CLEAR, BOLD, RESET, AMBER, BROWN, GREEN, YELLOW, GRAY, WHITE, CYAN } from '../app.js';
import { showShops } from './shops.js';

export function showHelp(stream, ctx) {
  const { navigate } = ctx;

  stream.write(CLEAR);
  stream.write(`\r\n`);
  stream.write(`  ${BOLD}${AMBER}☕ Terminal Coffee — Help${RESET}\r\n`);
  stream.write(`  ${BROWN}──────────────────────────────────────────${RESET}\r\n`);
  stream.write(`\r\n`);

  stream.write(`  ${BOLD}${WHITE}HOW IT WORKS${RESET}\r\n`);
  stream.write(`  ${GRAY}1. Browse nearby shops and pick one${RESET}\r\n`);
  stream.write(`  ${GRAY}2. Select items and sizes to build your cart${RESET}\r\n`);
  stream.write(`  ${GRAY}3. Pay via the Razorpay link${RESET}\r\n`);
  stream.write(`  ${GRAY}4. Shop confirms your order (or auto-rejects in 2 min)${RESET}\r\n`);
  stream.write(`  ${GRAY}5. If rejected, you get an automatic refund${RESET}\r\n`);
  stream.write(`\r\n`);

  stream.write(`  ${BOLD}${WHITE}NAVIGATION${RESET}\r\n`);
  stream.write(`  ${CYAN}↑ ↓${RESET}         ${GRAY}Navigate lists${RESET}\r\n`);
  stream.write(`  ${CYAN}Enter${RESET}       ${GRAY}Select / Confirm${RESET}\r\n`);
  stream.write(`  ${CYAN}Backspace${RESET}   ${GRAY}Go back${RESET}\r\n`);
  stream.write(`  ${CYAN}q${RESET}           ${GRAY}Quit${RESET}\r\n`);
  stream.write(`\r\n`);

  stream.write(`  ${BOLD}${WHITE}SHOPS SCREEN${RESET}\r\n`);
  stream.write(`  ${CYAN}s${RESET}           ${GRAY}Check latest order status${RESET}\r\n`);
  stream.write(`  ${CYAN}h${RESET}           ${GRAY}View order history${RESET}\r\n`);
  stream.write(`  ${CYAN}?${RESET}           ${GRAY}Show this help screen${RESET}\r\n`);
  stream.write(`\r\n`);

  stream.write(`  ${BOLD}${WHITE}CART (MENU SCREEN)${RESET}\r\n`);
  stream.write(`  ${CYAN}a${RESET}           ${GRAY}Add another item to cart${RESET}\r\n`);
  stream.write(`  ${CYAN}Backspace${RESET}   ${GRAY}Remove last item from cart${RESET}\r\n`);
  stream.write(`  ${CYAN}Enter${RESET}       ${GRAY}Proceed to checkout${RESET}\r\n`);
  stream.write(`\r\n`);

  stream.write(`  ${BOLD}${WHITE}STATUS SCREEN${RESET}\r\n`);
  stream.write(`  ${CYAN}r${RESET}           ${GRAY}Refresh status${RESET}\r\n`);
  stream.write(`  ${CYAN}b${RESET}           ${GRAY}Back to shops${RESET}\r\n`);
  stream.write(`  ${GRAY}Auto-refreshes every 3 seconds${RESET}\r\n`);
  stream.write(`\r\n`);

  stream.write(`  ${GRAY}[b] Back to shops  [q] Quit${RESET}\r\n`);

  const onData = (data) => {
    const key = data.toString();

    if (key === 'b' || key === '\x7f' || key === '\r' || key === '\n') {
      navigate(showShops);
    } else if (key === 'q' || key === '\x03') {
      stream.write(`\r\n  ${GRAY}Goodbye! ☕${RESET}\r\n\r\n`);
      stream.end();
    }
  };

  stream.on('data', onData);

  return () => stream.removeListener('data', onData);
}
