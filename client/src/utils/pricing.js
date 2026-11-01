// Mirrors server/src/utils/pricing.js. The server is the source of truth: it recalculates
// everything when the order is placed. These values only power the live summary in the UI.
export const FREE_SHIPPING_OVER = 2000;
export const SHIPPING_FEE = 99;
export const TAX_RATE = 0.05;

export function calculateTotals(itemsPrice) {
  const shippingPrice =
    itemsPrice === 0 || itemsPrice >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const taxPrice = Math.round(itemsPrice * TAX_RATE * 100) / 100;
  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice: itemsPrice + shippingPrice + taxPrice,
  };
}
