import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import { money } from '../utils/format';

// Luhn checksum: catches mistyped card numbers before we continue.
function validCardNumber(num) {
  const digits = num.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  [...digits].reverse().forEach((d, i) => {
    let n = Number(d);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  });
  return sum % 10 === 0;
}

export default function Checkout() {
  const { user } = useAuth();
  const { cart, reset } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
  });
  const [method, setMethod] = useState('card');
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvc: '' });
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  if (cart.items.length === 0 && !placing) return <Navigate to="/cart" replace />;

  const setA = (k) => (e) => setAddress({ ...address, [k]: e.target.value });
  const setC = (k) => (e) => setCard({ ...card, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (method === 'card') {
      if (!validCardNumber(card.number))
        return setError('That card number does not look right');
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry))
        return setError('Enter the expiry date as MM/YY');
      if (!/^\d{3,4}$/.test(card.cvc))
        return setError('Enter the 3 or 4 digit security code');
    }

    setPlacing(true);
    try {
      // Only the last 4 digits are sent. This is a demo payment: no real charge happens.
      const { order } = await api('/orders', {
        method: 'POST',
        body: {
          shippingAddress: address,
          paymentMethod: method,
          cardLast4:
            method === 'card' ? card.number.replace(/\s/g, '').slice(-4) : undefined,
        },
      });
      reset();
      toast('Order placed. Thank you!');
      navigate(`/orders/${order._id}`, { replace: true, state: { justPlaced: true } });
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  };

  return (
    <div className="container section">
      <h1>Checkout</h1>
      <form className="two-col" onSubmit={submit}>
        <div className="stack">
          <fieldset className="panel">
            <legend>Where should we send it?</legend>
            <div className="form-grid">
              <label>
                Full name
                <input
                  required
                  value={address.fullName}
                  onChange={setA('fullName')}
                  autoComplete="name"
                />
              </label>
              <label>
                Phone
                <input
                  required
                  type="tel"
                  value={address.phone}
                  onChange={setA('phone')}
                  autoComplete="tel"
                />
              </label>
              <label className="span-2">
                Address
                <input
                  required
                  value={address.address}
                  onChange={setA('address')}
                  autoComplete="street-address"
                />
              </label>
              <label>
                City
                <input
                  required
                  value={address.city}
                  onChange={setA('city')}
                  autoComplete="address-level2"
                />
              </label>
              <label>
                Postal code
                <input
                  required
                  value={address.postalCode}
                  onChange={setA('postalCode')}
                  autoComplete="postal-code"
                />
              </label>
              <label className="span-2">
                Country
                <input
                  required
                  value={address.country}
                  onChange={setA('country')}
                  autoComplete="country-name"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="panel">
            <legend>How would you like to pay?</legend>
            <div className="choice-row">
              <label className={`choice ${method === 'card' ? 'is-on' : ''}`}>
                <input
                  type="radio"
                  name="pay"
                  checked={method === 'card'}
                  onChange={() => setMethod('card')}
                />
                Card
              </label>
              <label className={`choice ${method === 'cod' ? 'is-on' : ''}`}>
                <input
                  type="radio"
                  name="pay"
                  checked={method === 'cod'}
                  onChange={() => setMethod('cod')}
                />
                Cash on delivery
              </label>
            </div>

            {method === 'card' ? (
              <div className="form-grid">
                <label className="span-2">
                  Name on card
                  <input
                    required
                    value={card.name}
                    onChange={setC('name')}
                    autoComplete="cc-name"
                  />
                </label>
                <label className="span-2">
                  Card number
                  <input
                    required
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    value={card.number}
                    onChange={setC('number')}
                    autoComplete="cc-number"
                  />
                </label>
                <label>
                  Expiry
                  <input
                    required
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={setC('expiry')}
                    autoComplete="cc-exp"
                  />
                </label>
                <label>
                  Security code
                  <input
                    required
                    inputMode="numeric"
                    value={card.cvc}
                    onChange={setC('cvc')}
                    autoComplete="cc-csc"
                  />
                </label>
                <p className="muted small span-2">
                  Demo store: use any valid test number such as 4242 4242 4242 4242.
                  Nothing is charged.
                </p>
              </div>
            ) : (
              <p className="muted">Pay in cash when your order arrives.</p>
            )}
          </fieldset>
        </div>

        <aside>
          <OrderSummary itemsPrice={cart.subtotal} />
          <ul className="mini-lines">
            {cart.items.map(({ product, quantity, lineTotal }) => (
              <li key={product._id}>
                <span>
                  {quantity} × {product.name}
                </span>
                <span>{money(lineTotal)}</span>
              </li>
            ))}
          </ul>
          {error && <p className="alert alert-error">{error}</p>}
          <button className="btn btn-block" disabled={placing}>
            {placing ? 'Placing order' : 'Place order'}
          </button>
          <Link to="/cart" className="text-link center block">
            Back to cart
          </Link>
        </aside>
      </form>
    </div>
  );
}
