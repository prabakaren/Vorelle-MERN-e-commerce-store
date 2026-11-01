import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <p className="logo logo-lg">vorelle</p>
          <p className="muted">
            Small-batch things for the home, the commute and the desk.
          </p>
        </div>
        <nav aria-label="Shop">
          <h4>Shop</h4>
          <Link to="/products">All products</Link>
          <Link to="/products?category=Home">Home</Link>
          <Link to="/products?category=Kitchen">Kitchen</Link>
          <Link to="/products?category=Tech">Tech</Link>
        </nav>
        <nav aria-label="Account">
          <h4>Account</h4>
          <Link to="/account">Your orders</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/login">Log in</Link>
        </nav>
      </div>
      <p className="container footer-end muted">
        © {new Date().getFullYear()} Vorelle. Built as a MERN stack project.
      </p>
    </footer>
  );
}
