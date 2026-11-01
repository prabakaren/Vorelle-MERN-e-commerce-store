import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const EMPTY = { items: [], itemsCount: 0, subtotal: 0 };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  // Load the cart from the server whenever the logged-in user changes.
  useEffect(() => {
    if (!user) {
      setCart(EMPTY);
      return;
    }
    api('/cart')
      .then(setCart)
      .catch(() => setCart(EMPTY));
  }, [user]);

  // Runs a cart request and stores the updated cart it returns.
  const run = useCallback(async (path, options) => {
    setBusy(true);
    try {
      const data = await api(path, options);
      setCart(data);
      return data;
    } finally {
      setBusy(false);
    }
  }, []);

  const addItem = useCallback(
    (productId, quantity = 1) =>
      run('/cart', { method: 'POST', body: { productId, quantity } }),
    [run],
  );
  const setQuantity = useCallback(
    (productId, quantity) =>
      run(`/cart/${productId}`, { method: 'PUT', body: { quantity } }),
    [run],
  );
  const removeItem = useCallback(
    (productId) => run(`/cart/${productId}`, { method: 'DELETE' }),
    [run],
  );
  const reset = useCallback(() => setCart(EMPTY), []);

  const value = useMemo(
    () => ({ cart, busy, addItem, setQuantity, removeItem, reset }),
    [cart, busy, addItem, setQuantity, removeItem, reset],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
