import { CLEAR, BOLD, RESET, AMBER, BROWN, GREEN, RED, YELLOW, GRAY, WHITE, BG_AMBER, CYAN } from '../app.js';
import { signup, login, requestLocationToken, getLocationStatus } from '../../lib/api.js';
import { showShops } from './shops.js';

export function showLogin(stream, ctx) {
  const { navigate, session } = ctx;
  let mode = 'choose'; // 'choose', 'login', 'signup_user', 'signup_phone', 'location'
  let selected = 0; // 0 = login, 1 = signup
  let username = '';
  let phone = '';
  let pollTimer = null;

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

  async function checkLocationAndProceed() {
    try {
      const locStatus = await getLocationStatus(session.token);
      if (locStatus.hasLocation) {
        session.location = {
          lat: locStatus.location.lat,
          lng: locStatus.location.lng,
          city: locStatus.location.address || session.location?.city || '',
        };
        navigate(showShops);
        return;
      }
    } catch {
      // ignore - proceed to location capture
    }

    // No saved location - request a location token
    try {
      const tokenResult = await requestLocationToken(session.token);
      showLocationPrompt(tokenResult.url);
    } catch {
      // If location token fails, just proceed
      navigate(showShops);
    }
  }

  function showLocationPrompt(url) {
    mode = 'location';
    stream.write(CLEAR);
    stream.write(`\r\n`);
    stream.write(`  ${BOLD}${AMBER}📍 Share Your Location${RESET}\r\n`);
    stream.write(`  ${BROWN}─────────────────────────────────────────────${RESET}\r\n`);
    stream.write(`\r\n`);
    stream.write(`  ${WHITE}To find nearby coffee shops, open this link${RESET}\r\n`);
    stream.write(`  ${WHITE}on your phone or browser:${RESET}\r\n`);
    stream.write(`\r\n`);
    stream.write(`  ${CYAN}${BOLD}${url}${RESET}\r\n`);
    stream.write(`\r\n`);
    stream.write(`  ${YELLOW}Waiting for location...${RESET}\r\n`);
    stream.write(`\r\n`);
    stream.write(`  ${GRAY}[Enter] Skip and show all shops${RESET}\r\n`);

    // Poll every 3 seconds
    let attempts = 0;
    const maxAttempts = 40; // ~2 minutes

    pollTimer = setInterval(async () => {
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(pollTimer);
        pollTimer = null;
        navigate(showShops);
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
          stream.write(`\r\n  ${GREEN}✔ Location received!${RESET}\r\n`);
          setTimeout(() => navigate(showShops), 500);
        }
      } catch {
        // ignore poll errors
      }
    }, 3000);
  }

  async function doLogin() {
    stream.removeListener('data', onData);
    stream.write(`\r\n  ${YELLOW}Logging in...${RESET}\r\n`);

    try {
      const result = await login(username.trim());
      session.token = result.token;
      session.username = result.username;
      stream.write(`  ${GREEN}✔ Welcome back, ${BOLD}${result.username}${RESET}${GREEN}!${RESET}\r\n`);
      if (result.gamification && result.gamification.xpGained > 0) {
        stream.write(`  ${CYAN}⚡ +${result.gamification.xpGained} XP${RESET}  ${AMBER}Login streak: ${result.gamification.loginStreak} day${result.gamification.loginStreak !== 1 ? 's' : ''}${RESET}\r\n`);
        if (result.gamification.levelUp) {
          stream.write(`  ${AMBER}🎉 Level up! You are now Level ${result.gamification.levelUp.to} — ${result.gamification.levelUp.rank}${RESET}\r\n`);
        }
      }
      stream.on('data', onData);
      setTimeout(() => checkLocationAndProceed(), 1000);
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
      if (result.gamification && result.gamification.xpGained > 0) {
        stream.write(`  ${CYAN}⚡ +${result.gamification.xpGained} XP${RESET}  ${AMBER}Your journey begins!${RESET}\r\n`);
      }
      stream.on('data', onData);
      setTimeout(() => checkLocationAndProceed(), 1000);
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

    if (key === '\x03') {
      if (pollTimer) clearInterval(pollTimer);
      stream.write(`\r\n  ${GRAY}Goodbye! ☕${RESET}\r\n\r\n`);
      stream.end();
      return;
    }

    if (mode === 'location') {
      if (key === '\r' || key === '\n') {
        // Skip location - proceed to shops
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
        navigate(showShops);
      }
      return;
    }

    if (key === 'q' && mode === 'choose') {
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

  return () => {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    stream.removeListener('data', onData);
  };
}
