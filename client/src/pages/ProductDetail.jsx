import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ProductImage from '../components/ProductImage.jsx';
import Loader from '../components/Loader.jsx';
import { money } from '../utils/format';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem, busy } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setProduct(null);
    setError('');
    api(`/products/${id}`)
      .then((d) => setProduct(d.product))
      .catch((e) => setError(e.message));
  }, [id]);

  const handleAdd = async (goToCart = false) => {
    if (!user) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    try {
      await addItem(product._id, qty);
      toast(`${product.name} added to your cart`);
      if (goToCart) navigate('/cart');
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  if (error)
    return (
      <div className="container empty">
        <h1>Product not found</h1>
        <p className="muted">{error}</p>
        <Link to="/products" className="btn">
          Back to shop
        </Link>
      </div>
    );
  if (!product) return <Loader />;

  const soldOut = product.stock === 0;

  return (
    <div className="container section detail">
      <ProductImage product={product} shape="squircle" className="detail-img" />
      <div className="detail-info">
        <Link
          to={`/products?category=${encodeURIComponent(product.category)}`}
          className="card-cat"
        >
          {product.category}
        </Link>
        <h1>{product.name}</h1>
        <p className="rating">★ {product.rating.toFixed(1)}</p>
        <p className="price">{money(product.price)}</p>
        <p className="lead">{product.description}</p>

        {soldOut ? (
          <p className="tag tag-out">Sold out</p>
        ) : (
          <>
            <p className={product.stock <= 5 ? 'tag tag-low' : 'muted'}>
              {product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}
            </p>
            <div className="buy-row">
              <label className="qty">
                <span className="sr-only">Quantity</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                >
                  −
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  aria-label="Increase"
                >
                  +
                </button>
              </label>
              <button className="btn" disabled={busy} onClick={() => handleAdd(false)}>
                Add to cart
              </button>
              <button
                className="btn btn-ghost"
                disabled={busy}
                onClick={() => handleAdd(true)}
              >
                Buy now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
