import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/Loader.jsx';
import { money, shortDate } from '../utils/format';

export default function Account() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState(null);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    currentPassword: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/orders/mine')
      .then((d) => setOrders(d.orders))
      .catch(() => setOrders([]));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const changes = { name: form.name, email: form.email };
      if (form.password)
        Object.assign(changes, {
          password: form.password,
          currentPassword: form.currentPassword,
        });
      await updateProfile(changes);
      setForm((f) => ({ ...f, currentPassword: '', password: '' }));
      toast('Details saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container section">
      <h1>Your account</h1>
      <div className="two-col two-col-even">
        <section>
          <h2>Order history</h2>
          {!orders && <Loader />}
          {orders?.length === 0 && (
            <div className="panel">
              <p className="muted">You have not placed any orders yet.</p>
              <Link to="/products" className="btn">
                Start shopping
              </Link>
            </div>
          )}
          <ul className="order-list">
            {orders?.map((o) => (
              <li key={o._id}>
                <Link to={`/orders/${o._id}`} className="order-row">
                  <span>
                    <strong>{o._id.slice(-8)}</strong>
                    <span className="muted">
                      {' '}
                      · {shortDate(o.createdAt)} · {o.items.length}{' '}
                      {o.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </span>
                  <span>
                    <span className={`status status-${o.status}`}>{o.status}</span>{' '}
                    <strong>{money(o.totalPrice)}</strong>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Your details</h2>
          <form className="panel" onSubmit={save}>
            {error && <p className="alert alert-error">{error}</p>}
            <label>
              Name
              <input required value={form.name} onChange={set('name')} />
            </label>
            <label>
              Email
              <input required type="email" value={form.email} onChange={set('email')} />
            </label>
            <label>
              Current password
              <input
                type="password"
                value={form.currentPassword}
                onChange={set('currentPassword')}
                autoComplete="current-password"
                placeholder="Only needed to change password"
              />
            </label>
            <label>
              New password
              <input
                type="password"
                minLength={6}
                value={form.password}
                onChange={set('password')}
                autoComplete="new-password"
              />
            </label>
            <button className="btn" disabled={saving}>
              {saving ? 'Saving' : 'Save changes'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
