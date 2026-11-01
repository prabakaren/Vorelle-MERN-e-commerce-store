import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState(params.get('search') || '');

  const search = params.get('search') || '';
  const category = params.get('category') || 'all';
  const sort = params.get('sort') || 'newest';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const page = params.get('page') || '1';

  // Updates one or more URL params (the URL is the single source of truth for filters).
  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) =>
      v && v !== 'all' ? next.set(k, v) : next.delete(k),
    );
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  useEffect(() => {
    api('/products/categories')
      .then((d) => setCategories(d.categories))
      .catch(() => {});
  }, []);

  // Wait 350ms after typing stops before searching.
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchText !== search) {
        const next = new URLSearchParams(params);
        if (searchText) next.set('search', searchText);
        else next.delete('search');
        next.delete('page');
        setParams(next);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [searchText]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setData(null);
    setError('');
    const q = new URLSearchParams({ sort, page, limit: '12' });
    if (search) q.set('search', search);
    if (category !== 'all') q.set('category', category);
    if (minPrice) q.set('minPrice', minPrice);
    if (maxPrice) q.set('maxPrice', maxPrice);
    api(`/products?${q}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [search, category, sort, minPrice, maxPrice, page]);

  const clearAll = () => {
    setSearchText('');
    setParams({});
  };

  return (
    <div className="container section">
      <h1>Shop</h1>

      <div className="filters">
        <input
          type="search"
          placeholder="Search products"
          aria-label="Search products"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select
          aria-label="Category"
          value={category}
          onChange={(e) => update({ category: e.target.value })}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort"
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
        <input
          type="number"
          min="0"
          placeholder="Min ₹"
          aria-label="Minimum price"
          value={minPrice}
          onChange={(e) => update({ minPrice: e.target.value })}
        />
        <input
          type="number"
          min="0"
          placeholder="Max ₹"
          aria-label="Maximum price"
          value={maxPrice}
          onChange={(e) => update({ maxPrice: e.target.value })}
        />
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {!data && !error && <Loader />}

      {data && (
        <>
          <p className="muted result-count">
            {data.total} {data.total === 1 ? 'product' : 'products'}
          </p>
          {data.products.length === 0 ? (
            <div className="empty">
              <h2>Nothing matches those filters</h2>
              <button className="btn" onClick={clearAll}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid">
              {data.products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
          {data.pages > 1 && (
            <div className="pager">
              <button
                className="btn btn-ghost"
                disabled={data.page <= 1}
                onClick={() => update({ page: String(data.page - 1) })}
              >
                Previous
              </button>
              <span>
                Page {data.page} of {data.pages}
              </span>
              <button
                className="btn btn-ghost"
                disabled={data.page >= data.pages}
                onClick={() => update({ page: String(data.page + 1) })}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
