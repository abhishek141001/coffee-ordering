import { showWelcome } from './screens/welcome.js';
import { showLogin } from './screens/login.js';
import { showShops } from './screens/shops.js';
import { showMenu } from './screens/menu.js';
import { showOrderConfirm } from './screens/order.js';
import { showStatus } from './screens/status.js';
import { showHistory } from './screens/history.js';
import { showHelp } from './screens/help.js';

// ANSI helpers — standard bright colors for maximum terminal compatibility
const BG_DARK = '\x1b[40m';         // standard black background
export const CLEAR = `${BG_DARK}\x1b[2J\x1b[H`;
export const BOLD = '\x1b[1m';
export const RESET = `\x1b[0m${BG_DARK}\x1b[37m`;
export const DIM = '\x1b[2m';
export const RED = '\x1b[91m';      // bright red
export const GREEN = '\x1b[92m';    // bright green
export const YELLOW = '\x1b[93m';   // bright yellow
export const BLUE = '\x1b[94m';     // bright blue
export const CYAN = '\x1b[96m';     // bright cyan
export const AMBER = '\x1b[93m';    // bright yellow (closest to amber)
export const BROWN = '\x1b[33m';    // standard yellow (muted, for borders)
export const GRAY = '\x1b[37m';     // white (standard, readable)
export const WHITE = '\x1b[97m';    // bright white
export const BG_AMBER = '\x1b[43m\x1b[30m';   // yellow bg, black text
export const BG_GREEN = '\x1b[42m\x1b[30m';   // green bg, black text
export const BG_RED = '\x1b[41m\x1b[97m';     // red bg, bright white text
export const BG_CYAN = '\x1b[46m\x1b[30m';    // cyan bg, black text

export function createApp(stream, { location }) {
  const session = {
    token: null,
    username: null,
    location,
    selectedShop: null,
  };

  // Clean up function to remove all listeners
  let cleanup = null;

  function navigate(screenFn, args = {}) {
    if (cleanup) cleanup();
    cleanup = screenFn(stream, { ...session, ...args, navigate, session });
  }

  navigate(showWelcome, { location });

  stream.on('error', () => {});
  stream.on('close', () => {
    if (cleanup) cleanup();
  });
}
