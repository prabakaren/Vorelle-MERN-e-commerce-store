import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart, reset } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    reset();
    close();
    navigate('/');
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo" onClick={close}>
          vorelle
        </Link>

        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>

        <nav
          id="nav-menu"
          className={`nav-menu ${open ? 'is-open' : ''}`}
          aria-label="Main"
        >
          <NavLink to="/products" onClick={close}>
            Shop
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" onClick={close}>
              Admin
            </NavLink>
          )}
          {user ? (
            <>
              <NavLink to="/account" onClick={close}>
                Hi, {user.name.split(' ')[0]}
              </NavLink>
              <button className="link-btn" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>
                Log in
              </NavLink>
              <Link to="/register" className="btn btn-small" onClick={close}>
                Sign up
              </Link>
            </>
          )}
          <NavLink to="/cart" className="cart-link" onClick={close}>
            Cart
            {cart.itemsCount > 0 && <span className="cart-count">{cart.itemsCount}</span>}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
