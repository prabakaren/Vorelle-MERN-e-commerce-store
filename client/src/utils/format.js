const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

// Formats a number as Indian rupees, e.g. 2499 -> "₹2,499". Change the currency here.
export const money = (n) => inr.format(Number(n) || 0);

export const shortDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
