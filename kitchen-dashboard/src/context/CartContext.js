import { createContext, useContext, useState, useCallback, useMemo } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // ✅ Falls back to "T1" during dev/testing (before QR codes are set up)
  const getTableId = useCallback(() => {
    const stored = localStorage.getItem("tableId");
    if (stored) return stored;
    // Set a default so cart works without a QR scan during development
    localStorage.setItem("tableId", "T1");
    return "T1";
  }, []);

  // ✅ ADD ITEM
  const addToCart = useCallback((item) => {
    const tableId = getTableId(); // will never be null now

    setCart((prev) => {
      const existing = prev.find(
        (i) => i._id === item._id && i.tableId === tableId
      );

      if (existing) {
        return prev.map((i) =>
          i._id === item._id && i.tableId === tableId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [
        ...prev,
        {
          ...item,
          _id: item._id,
          quantity: 1,
          tableId,
        },
      ];
    });
  }, [getTableId]);

  // ✅ REMOVE ITEM COMPLETELY
  const removeFromCart = useCallback((id) => {
    const tableId = getTableId();
    setCart((prev) =>
      prev.filter((item) => !(item._id === id && item.tableId === tableId))
    );
  }, [getTableId]);

  // ✅ DECREASE QTY (removes if qty hits 0)
  const decreaseQty = useCallback((id) => {
    const tableId = getTableId();
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === id && item.tableId === tableId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, [getTableId]);

  // ✅ TOTAL — memoized so it doesn't recalculate on every render
  const getTotal = useCallback(() => {
    const tableId = getTableId();
    return cart.reduce((sum, item) => {
      if (item.tableId !== tableId) return sum;
      return sum + item.price * item.quantity;
    }, 0);
  }, [cart, getTableId]);

  // ✅ CLEAR CART for current table only
  const clearCart = useCallback(() => {
    const tableId = getTableId();
    setCart((prev) => prev.filter((item) => item.tableId !== tableId));
  }, [getTableId]);

  // ✅ CART COUNT — memoized badge count for navbar
  const cartCount = useMemo(() => {
    const tableId = getTableId();
    return cart
      .filter((item) => item.tableId === tableId)
      .reduce((sum, item) => sum + item.quantity, 0);
  }, [cart, getTableId]);

  // ✅ Memoized context value — prevents unnecessary re-renders in all consumers
  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    decreaseQty,
    getTotal,
    clearCart,
    cartCount,
    setCart,
  }), [cart, addToCart, removeFromCart, decreaseQty, getTotal, clearCart, cartCount]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);