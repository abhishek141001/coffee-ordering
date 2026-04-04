import { CLEAR, BOLD, RESET, AMBER, BROWN, GREEN, RED, YELLOW, GRAY, WHITE, CYAN, DIM } from '../app.js';
import { getGamificationProfile, getLeaderboard } from '../../lib/api.js';
import { showShops } from './shops.js';

function progressBar(progress, width = 20) {
  const filled = Math.round((progress / 100) * width);
  const empty = width - filled;
  return `${CYAN}[${'█'.repeat(filled)}${GRAY}${'░'.repeat(empty)}${CYAN}]${RESET}`;
}

function formatXP(xp) {
  return xp >= 1000 ? `${(xp / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(xp);
}

export function showProfile(stream, ctx) {
  const { navigate, session } = ctx;
  let mode = 'profile'; // 'profile' or 'leaderboard'
  let profileData = null;
  let leaderboardData = null;
  let error = null;

  function renderProfile() {
    stream.write(CLEAR);
    stream.write(`\r\n`);
    stream.write(`  ${BOLD}${AMBER}☕ Your Profile${RESET}\r\n`);
    stream.write(`  ${BROWN}──────────────────────────────────────────${RESET}\r\n`);
    stream.write(`\r\n`);

    if (error) {
      stream.write(`  ${RED}${error}${RESET}\r\n`);
      stream.write(`\r\n`);
      stream.write(`  ${GRAY}[b] Back  [q] Quit${RESET}\r\n`);
      return;
    }

    if (!profileData) {
      stream.write(`  ${YELLOW}Loading profile...${RESET}\r\n`);
      return;
    }

    const p = profileData;

    // Username and rank
    const nameStr = `  ${BOLD}${WHITE}${session.username}${RESET}`;
    const rankStr = `${BOLD}${AMBER}${p.rank}${RESET}`;
    stream.write(`${nameStr}                    ${rankStr}\r\n`);
    stream.write(`\r\n`);

    // Level and XP bar
    stream.write(`  ${WHITE}Level ${BOLD}${p.level}${RESET}${WHITE}         ${YELLOW}${formatXP(p.totalXP - p.xpForNext + p.xpNeeded)}${RESET} ${GRAY}/${RESET} ${YELLOW}${formatXP(p.xpForNext)}${RESET} ${GRAY}XP${RESET}\r\n`);
    stream.write(`  ${progressBar(p.progress)}  ${WHITE}${p.progress}%${RESET}\r\n`);
    stream.write(`\r\n`);

    // Streaks
    if (p.currentStreak > 0) {
      const mult = p.currentStreak >= 14 ? '3x' : p.currentStreak >= 7 ? '2x' : p.currentStreak >= 3 ? '1.5x' : '1x';
      stream.write(`  ${RED}🔥${RESET} ${WHITE}Order Streak:${RESET} ${BOLD}${GREEN}${p.currentStreak} days${RESET}  ${GRAY}(${mult} multiplier)${RESET}\r\n`);
    } else {
      stream.write(`  ${GRAY}🔥 Order Streak: 0 days${RESET}\r\n`);
    }
    if (p.loginStreak > 0) {
      stream.write(`  ${CYAN}📅${RESET} ${WHITE}Login Streak:${RESET} ${BOLD}${GREEN}${p.loginStreak} days${RESET}\r\n`);
    } else {
      stream.write(`  ${GRAY}📅 Login Streak: 0 days${RESET}\r\n`);
    }
    stream.write(`\r\n`);

    // Stats line
    stream.write(`  ${GRAY}${p.totalOrders} orders  ·  ${p.triedItems} items  ·  ${p.triedShops} shops${RESET}\r\n`);
    stream.write(`\r\n`);

    // Achievements
    stream.write(`  ${BROWN}── ${WHITE}Achievements (${p.achievementCount}/${p.achievementTotal})${RESET} ${BROWN}──────────────${RESET}\r\n`);
    stream.write(`\r\n`);

    for (const a of p.achievements) {
      if (a.unlocked) {
        stream.write(`  ${GREEN}✅ ${BOLD}${a.name}${RESET}${GREEN}${RESET}         ${GRAY}${a.description}${RESET}\r\n`);
      } else {
        stream.write(`  ${DIM}☐  ${a.name}              ${a.description}${RESET}\r\n`);
      }
    }

    stream.write(`\r\n`);
    stream.write(`  ${GRAY}[l] Leaderboard  [r] Refresh  [b] Back  [q] Quit${RESET}\r\n`);
  }

  function renderLeaderboard() {
    stream.write(CLEAR);
    stream.write(`\r\n`);
    stream.write(`  ${BOLD}${AMBER}🏆 Leaderboard${RESET}\r\n`);
    stream.write(`  ${BROWN}──────────────────────────────────────────${RESET}\r\n`);
    stream.write(`\r\n`);

    if (!leaderboardData) {
      stream.write(`  ${YELLOW}Loading leaderboard...${RESET}\r\n`);
      return;
    }

    if (leaderboardData.length === 0) {
      stream.write(`  ${GRAY}No one on the leaderboard yet. Be the first!${RESET}\r\n`);
      stream.write(`\r\n`);
      stream.write(`  ${GRAY}[p] Profile  [b] Back  [q] Quit${RESET}\r\n`);
      return;
    }

    // Header
    stream.write(`  ${BOLD}${WHITE}#    Player              XP       Rank${RESET}\r\n`);
    stream.write(`  ${BROWN}────────────────────────────────────────────${RESET}\r\n`);

    for (const entry of leaderboardData) {
      const isMe = session.username === entry.username;
      const posStr = String(entry.position).padEnd(4);
      const prefix = entry.position === 1 ? '★ ' : isMe ? '→ ' : '  ';
      const nameColor = isMe ? GREEN : WHITE;
      const name = `${prefix}${entry.username}`.padEnd(20);
      const xp = formatXP(entry.totalXP).padStart(6);
      const rank = entry.rank;

      if (isMe) {
        stream.write(`  ${BOLD}${GREEN}${posStr}${name}${YELLOW}${xp}${RESET}    ${GREEN}${rank}${RESET}\r\n`);
      } else if (entry.position === 1) {
        stream.write(`  ${BOLD}${YELLOW}${posStr}${AMBER}${name}${YELLOW}${xp}${RESET}    ${AMBER}${rank}${RESET}\r\n`);
      } else {
        stream.write(`  ${GRAY}${posStr}${nameColor}${name}${YELLOW}${xp}${RESET}    ${GRAY}${rank}${RESET}\r\n`);
      }
    }

    stream.write(`\r\n`);
    stream.write(`  ${GRAY}[p] Profile  [r] Refresh  [b] Back  [q] Quit${RESET}\r\n`);
  }

  function render() {
    if (mode === 'profile') renderProfile();
    else renderLeaderboard();
  }

  async function loadProfile() {
    try {
      profileData = await getGamificationProfile(session.token);
      if (mode === 'profile') render();
    } catch (err) {
      error = err.message;
      render();
    }
  }

  async function loadLeaderboard() {
    try {
      const data = await getLeaderboard(20);
      leaderboardData = data.leaderboard;
      if (mode === 'leaderboard') render();
    } catch (err) {
      error = err.message;
      render();
    }
  }

  // Initial load
  render();
  loadProfile();

  const onData = (data) => {
    const key = data.toString();

    if (key === 'l' && mode === 'profile') {
      mode = 'leaderboard';
      error = null;
      render();
      if (!leaderboardData) loadLeaderboard();
      else render();
    } else if (key === 'p' && mode === 'leaderboard') {
      mode = 'profile';
      error = null;
      render();
    } else if (key === 'r') {
      error = null;
      if (mode === 'profile') {
        profileData = null;
        render();
        loadProfile();
      } else {
        leaderboardData = null;
        render();
        loadLeaderboard();
      }
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
