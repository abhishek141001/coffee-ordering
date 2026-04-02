import { getFullMenu } from '../config/menu.js';

export const getMenu = (req, res) => {
  res.json(getFullMenu());
};
