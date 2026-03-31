// src/context/OrderContext.js
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

const OrderContext = createContext(null);

// Point this to your backend URL
const API_URL = `${process.env.REACT_APP_API_URL}/api/orders`;
const SOCKET_URL = process.env.REACT_APP_API_URL;

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);

  // ── Fetch Initial Orders ────────────────────────────────────────────────────
  const refreshOrders = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.orders)
        ? data.orders
        : [];

      setOrders(list);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  }, []);

  // ── Setup Socket.io & Initial Fetch ─────────────────────────────────────────
  useEffect(() => {
    refreshOrders(); // Fetch orders on mount

    const socket = io(SOCKET_URL);

    // Listen for new orders from Checkout
    socket.on("newOrder", (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    // Listen for status updates from Kitchen
    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    });

    return () => socket.disconnect();
  }, [refreshOrders]);

  // ── Place a new order (Called from CheckoutPage) ────────────────────────────
  const placeOrder = useCallback(
    async (cartItems, tableId, customerInfo = {}) => {
      const subtotal = cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      const tax = Math.round(subtotal * 0.05);
      const totalAmount = subtotal + tax;

      // Backend expects tableNumber as a number
      const tableNumber = parseInt(tableId.replace(/\D/g, "")) || 1;

      // Map items to match backend schema
      const items = cartItems.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tableNumber, items, totalAmount }),
        });

        if (!res.ok) throw new Error("Failed to place order");
        const data = await res.json();
        return data.order;
      } catch (error) {
        console.error("Order error:", error);
        throw error;
      }
    },
    []
  );

  // ── Update order status (Called from KitchenDashboard) ──────────────────────
  const updateStatus = useCallback(async (orderId, status) => {
    try {
      await fetch(`${API_URL}/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      // Socket will broadcast 'orderUpdated' automatically
    } catch (error) {
      console.error("Status update error:", error);
    }
  }, []);

  // ── Clear all orders (FIX FOR ADMIN PAGE) ───────────────────────────────────
  const clearAllOrders = useCallback(() => {
    setOrders([]);
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        placeOrder,
        updateStatus,
        refreshOrders,
        clearAllOrders, // ✅ Added here
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx)
    throw new Error("useOrders must be used within an OrderProvider");
  return ctx;
}