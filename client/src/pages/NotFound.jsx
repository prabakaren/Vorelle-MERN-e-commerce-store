import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container empty">
      <h1>This page wandered off</h1>
      <p className="muted">The link may be old or mistyped.</p>
      <Link to="/products" className="btn">
        Browse the shop
      </Link>
    </div>
  );
}
