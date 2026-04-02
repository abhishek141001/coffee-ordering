import chalk from 'chalk';
import { saveLocation, getLocation } from '../lib/config.js';
import { success, error, info, divider } from '../lib/ui.js';

export function registerLocationCommand(program) {
  program
    .command('location')
    .description('Set your location for finding nearby shops')
    .option('--lat <latitude>', 'Latitude')
    .option('--lng <longitude>', 'Longitude')
    .action((options) => {
      if (options.lat && options.lng) {
        const lat = parseFloat(options.lat);
        const lng = parseFloat(options.lng);

        if (isNaN(lat) || isNaN(lng)) {
          error('Invalid coordinates.', 'Provide valid numbers: coffee location --lat 12.97 --lng 77.59');
          process.exit(1);
        }

        saveLocation(lat, lng);
        divider();
        success(`Location set: ${lat}, ${lng}`);
        divider();
      } else {
        const location = getLocation();
        if (location) {
          divider();
          info(`Current location: ${location.lat}, ${location.lng}`);
          console.log(chalk.gray('    Update with: coffee location --lat <lat> --lng <lng>'));
          divider();
        } else {
          divider();
          info('No location set.');
          console.log(chalk.gray('    Set with: coffee location --lat 12.97 --lng 77.59'));
          divider();
        }
      }
    });
}
