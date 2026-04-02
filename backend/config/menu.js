export const MENU = {
  cappuccino: { base: 200, description: 'Classic Italian espresso with steamed milk foam' },
  latte: { base: 180, description: 'Smooth espresso with extra steamed milk' },
  espresso: { base: 150, description: 'Strong concentrated single shot' },
};

export const SIZES = {
  small: { multiplier: 0.8, label: 'Small (180ml)' },
  medium: { multiplier: 1.0, label: 'Medium (240ml)' },
  large: { multiplier: 1.2, label: 'Large (360ml)' },
};

export function getPrice(item, size) {
  const menuItem = MENU[item];
  const sizeConfig = SIZES[size];
  if (!menuItem || !sizeConfig) return null;
  return Math.round(menuItem.base * sizeConfig.multiplier);
}

export function getFullMenu() {
  const items = Object.entries(MENU).map(([name, config]) => {
    const prices = {};
    for (const [size, sizeConfig] of Object.entries(SIZES)) {
      prices[size] = {
        label: sizeConfig.label,
        price: Math.round(config.base * sizeConfig.multiplier),
      };
    }
    return { name, description: config.description, prices };
  });
  return { items, sizes: Object.keys(SIZES) };
}
