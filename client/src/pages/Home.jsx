import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard.jsx';
import ProductImage from '../components/ProductImage.jsx';
import Loader from '../components/Loader.jsx';
import { FREE_SHIPPING_OVER } from '../utils/pricing';
import { money } from '../utils/format';

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/products?featured=true&limit=8'), api('/products/categories')])
      .then(([p, c]) => {
        setFeatured(p.products);
        setCategories(c.categories);
      })
      .catch((e) => setError(e.message));
  }, []);

  const collage = (featured || []).slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1>Things worth bringing home.</h1>
            <p className="lead">
              Vorelle makes and finds small-batch pieces for the home, the commute and the
              desk. Free delivery on orders over {money(FREE_SHIPPING_OVER)}.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-lg">
                Shop the collection
              </Link>
              <Link to="/products?sort=rating" className="btn btn-ghost btn-lg">
                Top rated
              </Link>
            </div>
          </div>

          <div className="collage" aria-hidden={collage.length === 0}>
            {collage.map((p, i) => (
              <Link
                key={p._id}
                to={`/products/${p._id}`}
                className={`collage-item c${i}`}
              >
                <ProductImage
                  product={p}
                  shape={['arch', 'round', 'pill', 'squircle'][i]}
                />
                <span className="collage-label">{p.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container cats">
          {categories.map((c) => (
            <Link
              key={c}
              to={`/products?category=${encodeURIComponent(c)}`}
              className="chip"
            >
              {c}
            </Link>
          ))}
        </section>
      )}

      <section className="container section">
        <div className="section-head">
          <h2>Featured this week</h2>
          <Link to="/products" className="text-link">
            See everything
          </Link>
        </div>
        {error && <p className="alert alert-error">{error}</p>}
        {!featured && !error && <Loader />}
        {featured && featured.length === 0 && (
          <p className="muted">
            No featured products yet. Run the seed script or add some in the admin area.
          </p>
        )}
        <div className="grid">
          {featured?.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      <section className="container promise">
        <div>
          <h3>Delivered in 3 to 5 days</h3>
          <p className="muted">Tracked shipping on every order.</p>
        </div>
        <div>
          <h3>30-day returns</h3>
          <p className="muted">Changed your mind? Send it back, no questions.</p>
        </div>
        <div>
          <h3>Pay your way</h3>
          <p className="muted">Card online or cash on delivery.</p>
        </div>
      </section>
    </>
  );
}
