import chalk from 'chalk';

const brown = chalk.hex('#D2691E');
const amber = chalk.hex('#FFBF00');
const cream = chalk.hex('#FFFDD0');

export function banner() {
  console.log('');
  console.log(brown('    ╭──────────────────────────────╮'));
  console.log(brown('    │') + amber('  ☕  ') + chalk.bold.white('Terminal Coffee') + amber('  ☕') + brown('   │'));
  console.log(brown('    │') + cream('    Order coffee from your    ') + brown('│'));
  console.log(brown('    │') + cream('        terminal.             ') + brown('│'));
  console.log(brown('    ╰──────────────────────────────╯'));
  console.log('');
}

export function success(message) {
  console.log(chalk.green('  ✔ ') + message);
}

export function error(message, suggestion) {
  console.log('');
  console.log(chalk.red('  ✖ ') + chalk.red.bold(message));
  if (suggestion) {
    console.log(chalk.gray(`    → ${suggestion}`));
  }
  console.log('');
}

export function info(message) {
  console.log(chalk.blue('  ℹ ') + message);
}

export function warn(message) {
  console.log(chalk.yellow('  ⚠ ') + message);
}

export function formatPrice(amount) {
  return `₹${amount}`;
}

export function statusBadge(status) {
  const badges = {
    pending_payment: chalk.bgYellow.black(' PENDING PAYMENT '),
    paid: chalk.bgBlue.white(' PAID '),
    accepted: chalk.bgGreen.black(' ACCEPTED '),
    rejected: chalk.bgRed.white(' REJECTED '),
    refunded: chalk.bgCyan.black(' REFUNDED '),
  };
  return badges[status] || chalk.bgGray.white(` ${status.toUpperCase()} `);
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function table(headers, rows) {
  const colWidths = headers.map((h, i) => {
    const maxRow = rows.reduce((max, row) => Math.max(max, String(row[i] || '').length), 0);
    return Math.max(h.length, maxRow) + 2;
  });

  const headerLine = headers.map((h, i) => chalk.bold.gray(h.padEnd(colWidths[i]))).join('');
  const separator = chalk.gray('─'.repeat(colWidths.reduce((a, b) => a + b, 0)));

  console.log(`  ${headerLine}`);
  console.log(`  ${separator}`);
  rows.forEach((row) => {
    const line = row.map((cell, i) => String(cell).padEnd(colWidths[i])).join('');
    console.log(`  ${line}`);
  });
}

export function jsonOutput(data, program) {
  if (program.opts().json) {
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  }
}

export function divider() {
  console.log('');
}
