import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/Loader.jsx';
import { money, shortDate } from '../../utils/format';

const STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api('/orders')
      .then((d) => setOrders(d.orders))
      .catch((e) => toast(e.message, 'error'));
  }, [toast]);

  const changeStatus = async (order, status) => {
    try {
      const { order: updated } = await api(`/orders/${order._id}/status`, {
        method: 'PUT',
        body: { status },
      });
      setOrders((list) =>
        list.map((o) => (o._id === order._id ? { ...o, ...updated, user: o.user } : o)),
      );
      toast(`Order marked ${status.toLowerCase()}`);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  if (!orders) return <Loader />;
  if (orders.length === 0)
    return (
      <p className="muted">
        No orders yet. They will show up here as customers check out.
      </p>
    );

  return (
    <>
      <h2>Orders</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>
                  <Link to={`/orders/${o._id}`} className="text-link">
                    {o._id.slice(-8)}
                  </Link>
                </td>
                <td>
                  {o.user?.name || 'Deleted user'}
                  <br />
                  <span className="muted small">{o.user?.email}</span>
                </td>
                <td>{shortDate(o.createdAt)}</td>
                <td>{money(o.totalPrice)}</td>
                <td>
                  {o.paymentMethod === 'card' ? 'Card' : 'COD'} · {o.paymentStatus}
                </td>
                <td>
                  <select
                    value={o.status}
                    aria-label={`Status for order ${o._id.slice(-8)}`}
                    onChange={(e) => changeStatus(o, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
