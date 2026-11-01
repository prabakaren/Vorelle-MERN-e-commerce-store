import { useEffect, useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/Loader.jsx';
import { shortDate } from '../../utils/format';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState(null);

  useEffect(() => {
    api('/admin/users')
      .then((d) => setUsers(d.users))
      .catch((e) => toast(e.message, 'error'));
  }, [toast]);

  const setRole = async (u, role) => {
    try {
      const { user } = await api(`/admin/users/${u._id}/role`, {
        method: 'PUT',
        body: { role },
      });
      setUsers((list) => list.map((x) => (x._id === u._id ? user : x)));
      toast(`${u.name} is now ${role === 'admin' ? 'an admin' : 'a customer'}`);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}'s account?`)) return;
    try {
      await api(`/admin/users/${u._id}`, { method: 'DELETE' });
      setUsers((list) => list.filter((x) => x._id !== u._id));
      toast('User deleted');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  if (!users) return <Loader />;

  return (
    <>
      <h2>Users</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{shortDate(u.createdAt)}</td>
                <td>
                  <select
                    value={u.role}
                    disabled={u._id === me._id}
                    aria-label={`Role for ${u.name}`}
                    onChange={(e) => setRole(u, e.target.value)}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="actions">
                  {u._id !== me._id && (
                    <button className="link-btn danger" onClick={() => remove(u)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
