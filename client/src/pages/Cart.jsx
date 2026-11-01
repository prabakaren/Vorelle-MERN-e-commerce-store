import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ProductImage from '../components/ProductImage.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import { money } from '../utils/format';

export default function Cart() {
  const { cart, busy, setQuantity, removeItem } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const change = async (fn, ...args) => {
    try {
      await fn(...args);
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container empty">
        <h1>Your cart is empty</h1>
        <p className="muted">Add something you like and it will wait for you here.</p>
        <Link to="/products" className="btn">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1>Your cart</h1>
      <div className="two-col">
        <ul className="lines">
          {cart.items.map(({ product, quantity, lineTotal }) => (
            <li key={product._id} className="line">
              <ProductImage product={product} className="line-img" shape="squircle" />
              <div className="line-info">
                <Link to={`/products/${product._id}`} className="line-name">
                  {product.name}
                </Link>
                <span className="muted">{money(product.price)} each</span>
                <button
                  className="link-btn danger"
                  disabled={busy}
                  onClick={() => change(removeItem, product._id)}
                >
                  Remove
                </button>
              </div>
              <div className="qty">
                <button
                  disabled={busy || quantity <= 1}
                  aria-label="Decrease"
                  onClick={() => change(setQuantity, product._id, quantity - 1)}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  disabled={busy || quantity >= product.stock}
                  aria-label="Increase"
                  onClick={() => change(setQuantity, product._id, quantity + 1)}
                >
                  +
                </button>
              </div>
              <strong className="line-total">{money(lineTotal)}</strong>
            </li>
          ))}
        </ul>

        <aside>
          <OrderSummary itemsPrice={cart.subtotal} />
          <button className="btn btn-block" onClick={() => navigate('/checkout')}>
            Go to checkout
          </button>
        </aside>
      </div>
    </div>
  );
}
