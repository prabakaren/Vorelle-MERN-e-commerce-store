import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../api';
import Loader from '../components/Loader.jsx';
import ProductImage from '../components/ProductImage.jsx';
import { money, shortDate } from '../utils/format';

export default function OrderDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/orders/${id}`)
      .then((d) => setOrder(d.order))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error)
    return (
      <div className="container empty">
        <h1>We could not open that order</h1>
        <p className="muted">{error}</p>
        <Link to="/account" className="btn">
          Your orders
        </Link>
      </div>
    );
  if (!order) return <Loader />;

  const a = order.shippingAddress;
  return (
    <div className="container section">
      {state?.justPlaced && (
        <div className="alert alert-ok">
          <strong>Order placed.</strong> We will email updates as it moves. Order
          reference: {order._id.slice(-8)}
        </div>
      )}
      <h1>Order {order._id.slice(-8)}</h1>
      <p className="muted">
        Placed {shortDate(order.createdAt)} ·{' '}
        <span className={`status status-${order.status}`}>{order.status}</span>
      </p>

      <div className="two-col">
        <ul className="lines">
          {order.items.map((i) => (
            <li key={i.product} className="line line-compact">
              <ProductImage product={i} className="line-img" shape="squircle" />
              <div className="line-info">
                <Link to={`/products/${i.product}`} className="line-name">
                  {i.name}
                </Link>
                <span className="muted">
                  {i.quantity} × {money(i.price)}
                </span>
              </div>
              <strong className="line-total">{money(i.price * i.quantity)}</strong>
            </li>
          ))}
        </ul>
        <aside className="stack">
          <div className="panel summary">
            <h2>Payment</h2>
            <dl>
              <div>
                <dt>Items</dt>
                <dd>{money(order.itemsPrice)}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>{order.shippingPrice === 0 ? 'Free' : money(order.shippingPrice)}</dd>
              </div>
              <div>
                <dt>Tax</dt>
                <dd>{money(order.taxPrice)}</dd>
              </div>
              <div className="total">
                <dt>Total</dt>
                <dd>{money(order.totalPrice)}</dd>
              </div>
            </dl>
            <p className="muted small">
              {order.paymentMethod === 'card'
                ? `Card ending ${order.cardLast4}`
                : 'Cash on delivery'}{' '}
              · {order.paymentStatus}
            </p>
          </div>
          <div className="panel">
            <h2>Shipping to</h2>
            <address>
              {a.fullName}
              <br />
              {a.address}
              <br />
              {a.city} {a.postalCode}
              <br />
              {a.country}
              <br />
              {a.phone}
            </address>
          </div>
        </aside>
      </div>
    </div>
  );
}
