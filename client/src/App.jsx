import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Loader from './components/Loader.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Account from './pages/Account.jsx';
import { Login, Register } from './pages/AuthPages.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';

// Sends visitors to /login (remembering where they wanted to go) if they are not signed in.
function RequireAuth({ admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
  window.scrollTo(0, 0);
}, [pathname]);

  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<RequireAuth />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/account" element={<Account />} />
          </Route>

          <Route element={<RequireAuth admin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
