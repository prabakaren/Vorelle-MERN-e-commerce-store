import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import Loader from '../../components/Loader.jsx';
import { money } from '../../utils/format';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/stats')
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="alert alert-error">{error}</p>;
  if (!stats) return <Loader />;

  return (
    <>
      <div className="stats">
        <div className="panel stat">
          <span className="muted">Revenue</span>
          <strong>{money(stats.revenue)}</strong>
        </div>
        <div className="panel stat">
          <span className="muted">Orders</span>
          <strong>{stats.orders}</strong>
        </div>
        <div className="panel stat">
          <span className="muted">Products</span>
          <strong>{stats.products}</strong>
        </div>
        <div className="panel stat">
          <span className="muted">Customers</span>
          <strong>{stats.users}</strong>
        </div>
      </div>

      <div className="panel">
        <h2>Running low</h2>
        {stats.lowStock.length === 0 ? (
          <p className="muted">Every product has more than 5 in stock.</p>
        ) : (
          <ul className="mini-lines">
            {stats.lowStock.map((p) => (
              <li key={p._id}>
                <Link to="/admin/products" className="text-link">
                  {p.name}
                </Link>
                <span className={p.stock === 0 ? 'tag tag-out' : 'tag tag-low'}>
                  {p.stock === 0 ? 'Sold out' : `${p.stock} left`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
