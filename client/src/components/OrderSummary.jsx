import { calculateTotals, FREE_SHIPPING_OVER } from '../utils/pricing';
import { money } from '../utils/format';

// Price breakdown used by the cart and checkout pages.
export default function OrderSummary({ itemsPrice }) {
  const t = calculateTotals(itemsPrice);
  return (
    <div className="panel summary">
      <h2>Order summary</h2>
      <dl>
        <div>
          <dt>Items</dt>
          <dd>{money(t.itemsPrice)}</dd>
        </div>
        <div>
          <dt>Shipping</dt>
          <dd>{t.shippingPrice === 0 ? 'Free' : money(t.shippingPrice)}</dd>
        </div>
        <div>
          <dt>Tax (5%)</dt>
          <dd>{money(t.taxPrice)}</dd>
        </div>
        <div className="total">
          <dt>Total</dt>
          <dd>{money(t.totalPrice)}</dd>
        </div>
      </dl>
      {t.shippingPrice > 0 && (
        <p className="muted small">
          Add {money(FREE_SHIPPING_OVER - itemsPrice)} more for free shipping.
        </p>
      )}
    </div>
  );
}
