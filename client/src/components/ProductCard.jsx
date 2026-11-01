import { Link } from 'react-router-dom';
import { money } from '../utils/format';
import ProductImage from './ProductImage.jsx';

export default function ProductCard({ product }) {
  const soldOut = product.stock === 0;
  return (
    <Link to={`/products/${product._id}`} className="card">
      <ProductImage product={product} className="card-img" />
      <div className="card-body">
        <p className="card-cat">{product.category}</p>
        <h3 className="card-title">{product.name}</h3>
        <p className="card-desc">{product.description}</p>
        <div className="card-foot">
          <strong>{money(product.price)}</strong>
          {soldOut ? (
            <span className="tag tag-out">Sold out</span>
          ) : product.stock <= 5 ? (
            <span className="tag tag-low">{product.stock} left</span>
          ) : (
            <span className="rating">★ {product.rating.toFixed(1)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
