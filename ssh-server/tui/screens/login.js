import { CLEAR, BOLD, RESET, AMBER, BROWN, GREEN, RED, YELLOW, GRAY, WHITE, BG_AMBER } from '../app.js';
import { signup, login } from '../../lib/api.js';
import { showShops } from './shops.js';

export function showLogin(stream, ctx) {
  const { navigate, session } = ctx;
  let mode = 'choose'; // 'choose', 'login', 'signup_user', 'signup_phone'
  let selected = 0; // 0 = login, 1 = signup
  let username = '';
  let phone = '';

  function renderChoose() {
    stream.write(CLEAR);
    stream.write(`\r\n`);
    stream.write(`  ${BOLD}${AMBER}☕ Welcome${RESET}\r\n`);
    stream.write(`  ${BROWN}─────────────────────────────${RESET}\r\n`);
    stream.write(`\r\n`);

    const options = ['Log in (existing account)', 'Sign up (new account)'];
    options.forEach((opt, i) => {
      const indicator = i === selected ? `${BG_AMBER} > ${RESET} ` : '    ';
      const text = i === selected ? `${BOLD}${WHITE}${opt}${RESET}` : `${WHITE}${opt}${RESET}`;
      stream.write(`  ${indicator}${text}\r\n`);
    });

    stream.write(`\r\n`);
    stream.write(`  ${GRAY}[↑↓] Navigate  [Enter] Select  [q] Quit${RESET}\r\n`);
  }

  function renderLogin() {
    stream.write(CLEAR);
    stream.write(`\r\n`);
    stream.write(`  ${BOLD}${AMBER}☕ Log In${RESET}\r\n`);
    stream.write(`  ${BROWN}─────────────────────────────${RESET}\r\n`);
    stream.write(`\r\n`);
    stream.write(`  ${WHITE}Enter your username:${RESET}\r\n`);
    stream.write(`\r\n`);
    stream.write(`  ${BOLD}> ${GREEN}${username}${RESET}\r\n`);
    stream.write(`\r\n`);
    stream.write(`  ${GRAY}[Enter] Submit  [Backspace] Back${RESET}\r\n`);
  }

  function renderSignupUser() {
    stream.write(CLEAR);
    stream.write(`\r\n`);
    stream.write(`  ${BOLD}${AMBER}☕ Sign Up ${GRAY}(1/2)${RESET}\r\n`);
    stream.write(`  ${BROWN}─────────────────────────────${RESET}\r\n`);
    stream.write(`\r\n`);
    stream.write(`  ${WHITE}Choose a username:${RESET}\r\n`);
    stream.write(`\r\n`);
    stream.write(`  ${BOLD}> ${GREEN}${username}${RESET}\r\n`);
    stream.write(`\r\n`);
    stream.write(`  ${GRAY}[Enter] Next  [Backspace] Back${RESET}\r\n`);
  }

  function renderSignupPhone() {
    stream.write(CLEAR);
    stream.write(`\r\n`);
    stream.write(`  ${BOLD}${AMBER}☕ Sign Up ${GRAY}(2/2)${RESET}\r\n`);
    stream.write(`  ${BROWN}─────────────────────────────${RESET}\r\n`);
    stream.write(`\r\n`);
    stream.write(`  ${GRAY}Username: ${username}${RESET}\r\n`);
    stream.write(`\r\n`);
    stream.write(`  ${WHITE}Enter your phone number:${RESET}\r\n`);
    stream.write(`  ${GRAY}(shared with shop for delivery)${RESET}\r\n`);
    stream.write(`\r\n`);
    stream.write(`  ${BOLD}> ${GREEN}${phone}${RESET}\r\n`);
    stream.write(`\r\n`);
    stream.write(`  ${GRAY}[Enter] Create account  [Backspace] Back${RESET}\r\n`);
  }

  function render() {
    if (mode === 'choose') renderChoose();
    else if (mode === 'login') renderLogin();
    else if (mode === 'signup_user') renderSignupUser();
    else if (mode === 'signup_phone') renderSignupPhone();
  }

  render();

  async function doLogin() {
    stream.removeListener('data', onData);
    stream.write(`\r\n  ${YELLOW}Logging in...${RESET}\r\n`);

    try {
      const result = await login(username.trim());
      session.token = result.token;
      session.username = result.username;
      stream.write(`  ${GREEN}✔ Welcome back, ${BOLD}${result.username}${RESET}${GREEN}!${RESET}\r\n`);
      setTimeout(() => navigate(showShops), 500);
    } catch (err) {
      stream.write(`  ${RED}✖ ${err.message}${RESET}\r\n`);
      stream.write(`  ${GRAY}Press any key to try again${RESET}\r\n`);
      stream.once('data', () => {
        username = '';
        mode = 'choose';
        stream.on('data', onData);
        render();
      });
    }
  }

  async function doSignup() {
    stream.removeListener('data', onData);
    stream.write(`\r\n  ${YELLOW}Creating account...${RESET}\r\n`);

    try {
      const result = await signup(username.trim(), phone.trim());
      session.token = result.token;
      session.username = result.username;
      stream.write(`  ${GREEN}✔ Account created! Welcome, ${BOLD}${result.username}${RESET}${GREEN}!${RESET}\r\n`);
      setTimeout(() => navigate(showShops), 500);
    } catch (err) {
      stream.write(`  ${RED}✖ ${err.message}${RESET}\r\n`);
      stream.write(`  ${GRAY}Press any key to try again${RESET}\r\n`);
      stream.once('data', () => {
        username = '';
        phone = '';
        mode = 'choose';
        stream.on('data', onData);
        render();
      });
    }
  }

  const onData = (data) => {
    const key = data.toString();

    if (key === 'q' && mode === 'choose') {
      stream.write(`\r\n  ${GRAY}Goodbye! ☕${RESET}\r\n\r\n`);
      stream.end();
      return;
    }

    if (key === '\x03') {
      stream.write(`\r\n  ${GRAY}Goodbye! ☕${RESET}\r\n\r\n`);
      stream.end();
      return;
    }

    if (mode === 'choose') {
      if (key === '\x1b[A') {
        selected = 0;
        render();
      } else if (key === '\x1b[B') {
        selected = 1;
        render();
      } else if (key === '\r' || key === '\n') {
        username = '';
        phone = '';
        mode = selected === 0 ? 'login' : 'signup_user';
        render();
      }
    } else if (mode === 'login') {
      if (key === '\r' || key === '\n') {
        if (username.trim()) doLogin();
      } else if (key === '\x7f' || key === '\b') {
        if (username.length === 0) { mode = 'choose'; render(); }
        else { username = username.slice(0, -1); render(); }
      } else if (key.charCodeAt(0) >= 32) {
        username += key;
        render();
      }
    } else if (mode === 'signup_user') {
      if (key === '\r' || key === '\n') {
        if (username.trim()) { mode = 'signup_phone'; render(); }
      } else if (key === '\x7f' || key === '\b') {
        if (username.length === 0) { mode = 'choose'; render(); }
        else { username = username.slice(0, -1); render(); }
      } else if (key.charCodeAt(0) >= 32) {
        username += key;
        render();
      }
    } else if (mode === 'signup_phone') {
      if (key === '\r' || key === '\n') {
        if (phone.trim()) doSignup();
      } else if (key === '\x7f' || key === '\b') {
        if (phone.length === 0) { mode = 'signup_user'; render(); }
        else { phone = phone.slice(0, -1); render(); }
      } else if (key.charCodeAt(0) >= 32) {
        phone += key;
        render();
      }
    }
  };

  stream.on('data', onData);

  return () => stream.removeListener('data', onData);
}
