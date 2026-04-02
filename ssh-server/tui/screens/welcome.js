import { CLEAR, BOLD, RESET, AMBER, BROWN, GREEN, YELLOW, GRAY, WHITE } from '../app.js';
import { showLogin } from './login.js';

export function showWelcome(stream, ctx) {
  const { location, navigate } = ctx;

  const locationLine = location?.city
    ? `${GREEN}📍 Location: ${location.city}${RESET}`
    : `${YELLOW}📍 Using default location${RESET}`;

  stream.write(CLEAR);
  stream.write(`\r\n`);
  stream.write(`  ${BROWN}╔══════════════════════════════════════════╗${RESET}\r\n`);
  stream.write(`  ${BROWN}║${RESET}                                          ${BROWN}║${RESET}\r\n`);
  stream.write(`  ${BROWN}║${RESET}     ${AMBER}☕  CaffeineOperator  ☕${RESET}          ${BROWN}║${RESET}\r\n`);
  stream.write(`  ${BROWN}║${RESET}                                          ${BROWN}║${RESET}\r\n`);
  stream.write(`  ${BROWN}║${RESET}     ${WHITE}Order coffee from your terminal${RESET}     ${BROWN}║${RESET}\r\n`);
  stream.write(`  ${BROWN}║${RESET}                                          ${BROWN}║${RESET}\r\n`);
  stream.write(`  ${BROWN}╚══════════════════════════════════════════╝${RESET}\r\n`);
  stream.write(`\r\n`);
  stream.write(`  ${locationLine}\r\n`);
  stream.write(`\r\n`);
  stream.write(`  ${GRAY}Press ${BOLD}Enter${RESET}${GRAY} to continue, ${BOLD}q${RESET}${GRAY} to quit${RESET}\r\n`);
  stream.write(`\r\n`);

  const onData = (data) => {
    const key = data.toString();
    if (key === '\r' || key === '\n') {
      navigate(showLogin);
    } else if (key === 'q' || key === '\x03') {
      stream.write(`\r\n  ${GRAY}Goodbye! ☕${RESET}\r\n\r\n`);
      stream.end();
    }
  };

  stream.on('data', onData);

  return () => stream.removeListener('data', onData);
}
