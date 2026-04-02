import { CLEAR, BOLD, RESET, AMBER, BROWN, GREEN, RED, YELLOW, GRAY, WHITE, BG_AMBER } from '../app.js';
import { fetchNearbyShops } from '../../lib/api.js';
import { showMenu } from './menu.js';
import { showStatus } from './status.js';
import { showHistory } from './history.js';
import { showHelp } from './help.js';

export function showShops(stream, ctx) {
  const { navigate, session } = ctx;
  let shops = [];
  let selected = 0;

  function render() {
    stream.write(CLEAR);
    stream.write(`\r\n`);
    stream.write(`  ${BOLD}${AMBER}☕ Nearby Coffee Shops${RESET}  ${GRAY}(within 200m)${RESET}\r\n`);
    stream.write(`  ${BROWN}──────────────────────────────────────────${RESET}\r\n`);

    if (session.location?.city) {
      stream.write(`  ${GRAY}📍 ${session.location.city}${RESET}\r\n`);
    }
    stream.write(`\r\n`);

    if (shops.length === 0) {
      stream.write(`  ${RED}No coffee shops found nearby.${RESET}\r\n`);
      stream.write(`\r\n`);
      stream.write(`  ${GRAY}Press q to quit${RESET}\r\n`);
      return;
    }

    shops.forEach((shop, i) => {
      const indicator = i === selected ? `${BG_AMBER} > ${RESET} ` : '    ';
      const name = i === selected ? `${BOLD}${WHITE}${shop.name}${RESET}` : `${WHITE}${shop.name}${RESET}`;
      const distance = `${GRAY}${shop.distance}m${RESET}`;
      const status = shop._isOpen ? `${GREEN}OPEN${RESET}` : `${RED}CLOSED${RESET}`;
      stream.write(`  ${indicator}${name.padEnd(35)}${distance.padEnd(18)}${status}\r\n`);
    });

    stream.write(`\r\n`);
    stream.write(`  ${GRAY}[↑↓] Navigate  [Enter] Select  [s] Status  [h] History  [?] Help  [q] Quit${RESET}\r\n`);
  }

  // Load shops
  async function load() {
    stream.write(CLEAR);
    stream.write(`\r\n  ${YELLOW}Finding nearby shops...${RESET}\r\n`);

    try {
      const data = await fetchNearbyShops(session.location.lat, session.location.lng);
      shops = (data.shops || []).map((s) => {
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const isOpen = !s.operatingHours || (time >= s.operatingHours.open && time <= s.operatingHours.close);
        return { ...s, _isOpen: isOpen };
      });
      render();
    } catch (error) {
      stream.write(`  ${RED}Error: ${error.message}${RESET}\r\n`);
    }
  }

  load();

  const onData = (data) => {
    const key = data.toString();

    if (key === '\x1b[A') {
      // Up arrow
      selected = Math.max(0, selected - 1);
      render();
    } else if (key === '\x1b[B') {
      // Down arrow
      selected = Math.min(shops.length - 1, selected + 1);
      render();
    } else if (key === '\r' || key === '\n') {
      if (shops.length > 0) {
        session.selectedShop = shops[selected];
        navigate(showMenu);
      }
    } else if (key === 's') {
      navigate(showStatus);
    } else if (key === 'h') {
      navigate(showHistory);
    } else if (key === '?') {
      navigate(showHelp);
    } else if (key === 'q' || key === '\x03') {
      stream.write(`\r\n  ${GRAY}Goodbye! ☕${RESET}\r\n\r\n`);
      stream.end();
    }
  };

  stream.on('data', onData);

  return () => stream.removeListener('data', onData);
}
