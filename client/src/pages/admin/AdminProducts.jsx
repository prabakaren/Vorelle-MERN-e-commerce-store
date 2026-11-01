import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/Loader.jsx';
import ProductImage from '../../components/ProductImage.jsx';
import { money } from '../../utils/format';

const BLANK = {
  name: '',
  description: '',
  price: '',
  category: '',
  image: '',
  tint: '#4533ff',
  stock: '',
  featured: false,
  rating: 4.5,
};

export default function AdminProducts() {
  const toast = useToast();
  const [products, setProducts] = useState(null);
  const [editing, setEditing] = useState(null); // null = closed, {} = form data
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api('/products?limit=50&sort=newest')
      .then((d) => setProducts(d.products))
      .catch((e) => toast(e.message, 'error'));
  }, [toast]);
  useEffect(load, [load]);

  const set = (k) => (e) =>
    setEditing({
      ...editing,
      [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const body = {
      ...editing,
      price: Number(editing.price),
      stock: Number(editing.stock),
      rating: Number(editing.rating),
    };
    try {
      if (editing._id) await api(`/products/${editing._id}`, { method: 'PUT', body });
      else await api('/products', { method: 'POST', body });
      toast(editing._id ? 'Product updated' : 'Product created');
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api(`/products/${p._id}`, { method: 'DELETE' });
      toast('Product deleted');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <>
      <div className="section-head">
        <h2>Products</h2>
        <button
          className="btn btn-small"
          onClick={() => {
            setError('');
            setEditing({ ...BLANK });
          }}
        >
          Add product
        </button>
      </div>

      {!products && <Loader />}
      {products && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="cell-product">
                      <ProductImage product={p} className="thumb" shape="round" />
                      {p.name} {p.featured && <span className="tag">Featured</span>}
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td>{money(p.price)}</td>
                  <td>{p.stock}</td>
                  <td className="actions">
                    <button
                      className="link-btn"
                      onClick={() => {
                        setError('');
                        setEditing({ ...p });
                      }}
                    >
                      Edit
                    </button>
                    <button className="link-btn danger" onClick={() => remove(p)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-label={editing._id ? 'Edit product' : 'Add product'}
        >
          <form className="panel modal-card" onSubmit={save}>
            <h2>{editing._id ? 'Edit product' : 'Add product'}</h2>
            {error && <p className="alert alert-error">{error}</p>}
            <div className="form-grid">
              <label className="span-2">
                Name
                <input required value={editing.name} onChange={set('name')} />
              </label>
              <label className="span-2">
                Description
                <textarea
                  required
                  rows={3}
                  value={editing.description}
                  onChange={set('description')}
                />
              </label>
              <label>
                Price (₹)
                <input
                  required
                  type="number"
                  min="0"
                  value={editing.price}
                  onChange={set('price')}
                />
              </label>
              <label>
                Stock
                <input
                  required
                  type="number"
                  min="0"
                  value={editing.stock}
                  onChange={set('stock')}
                />
              </label>
              <label>
                Category
                <input required value={editing.category} onChange={set('category')} />
              </label>
              <label>
                Rating (0 to 5)
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editing.rating}
                  onChange={set('rating')}
                />
              </label>
              <label className="span-2">
                Image URL (optional)
                <input
                  type="url"
                  value={editing.image}
                  onChange={set('image')}
                  placeholder="https://..."
                />
              </label>
              <label>
                Tile colour
                <input type="color" value={editing.tint} onChange={set('tint')} />
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={editing.featured}
                  onChange={set('featured')}
                />{' '}
                Show on the home page
              </label>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button className="btn" disabled={saving}>
                {saving ? 'Saving' : 'Save product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
