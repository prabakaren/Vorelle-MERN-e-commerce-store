// Store-wide pricing rules. Change them here and the whole app follows.
export const FREE_SHIPPING_OVER = 2000;
export const SHIPPING_FEE = 99;
export const TAX_RATE = 0.05;

const round = (n) => Math.round(n * 100) / 100;

export function calculateTotals(itemsPrice) {
  const shippingPrice =
    itemsPrice === 0 || itemsPrice >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const taxPrice = round(itemsPrice * TAX_RATE);
  return {
    itemsPrice: round(itemsPrice),
    shippingPrice,
    taxPrice,
    totalPrice: round(itemsPrice + shippingPrice + taxPrice),
  };
}
