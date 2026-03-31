// src/pages/CartPage.js
import React, { useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../styles/CartPage.css"; // Added CSS import

const FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%23444'%3ENo Img%3C/text%3E%3C/svg%3E";

export default function CartPage() {
  const { cart, addToCart, decreaseQty, removeFromCart, getTotal } = useCart();
  const navigate = useNavigate();
  //const tableId = localStorage.getItem("tableId") || "T1";

  const tableCart = useMemo(
    () => cart,
    [cart]
  );

  const total = getTotal();
  const itemCount = tableCart.reduce((s, i) => s + i.quantity, 0);
  const tax = Math.round(total * 0.05);
  const grandTotal = total + tax;

  return (
    <div className="cart-page-container">
      <div className="cart-page-wrapper">

        {/* HEADER */}
        <div className="cart-header-section">
          <button
            onClick={() => navigate("/menu")}
            className="cart-back-btn"
          >
            ← Back to Menu
          </button>

          <div className="cart-title-row">
            <div>
              <h1 className="cart-title">
                Your Order
              </h1>
              {tableCart.length > 0 && (
                <p className="cart-subtitle">
                  {itemCount} item{itemCount > 1 ? "s" : ""} {/*· Table {tableId}*/}
                </p>
              )}
            </div>

            {tableCart.length > 0 && (
              <div className="cart-table-badge">
                {/*🪑 Table {tableId}*/}
              </div>
            )}
          </div>
        </div>

        {/* EMPTY STATE */}
        {tableCart.length === 0 && (
          <div className="cart-empty-state">
            <div className="cart-empty-icon">🛒</div>
            <h2 className="cart-empty-title">
              Your cart is empty
            </h2>
            <p className="cart-empty-text">
              Browse our menu and add your favourite dishes
            </p>
            <button
              onClick={() => navigate("/menu")}
              className="cart-empty-btn"
            >
              Browse Menu
            </button>
          </div>
        )}

        {/* CART CONTENT */}
        {tableCart.length > 0 && (
          <div className="cart-content-grid">

            {/* ITEMS LIST */}
            <div className="cart-items-list">
              {tableCart.map((item, index) => (
                <div
                  key={item._id}
                  className={`cart-item-row ${index < tableCart.length - 1 ? "has-border" : ""}`}
                >
                  {/* IMAGE */}
                  <img
                    src={item.image || FALLBACK}
                    alt={item.name}
                    loading="eager"
                    onError={(e) => e.target.src = FALLBACK}
                    className="cart-item-image"
                  />

                  {/* INFO */}
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">
                      {item.name}
                    </h3>
                    <div className="cart-item-price-row">
                      <span className="cart-item-unit-price">
                        ₹{item.price}
                      </span>
                      <span className="cart-item-multiply">×</span>
                      <span className="cart-item-calc">
                        {item.quantity} = <strong>₹{item.price * item.quantity}</strong>
                      </span>
                    </div>
                  </div>

                  {/* CONTROLS */}
                  <div className="cart-item-controls">
                    <div className="cart-qty-selector">
                      <button
                        onClick={() => decreaseQty(item._id)}
                        className="cart-qty-btn"
                      >−</button>
                      <span className="cart-qty-value">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="cart-qty-btn"
                      >+</button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="cart-remove-btn"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ORDER SUMMARY */}
            <div className="cart-summary-card">
              <h3 className="cart-summary-title">
                Order Summary
              </h3>

              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="cart-summary-value">₹{total}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Tax (5%)</span>
                  <span className="cart-summary-value">₹{tax}</span>
                </div>
                <div className="cart-summary-divider" />
                <div className="cart-summary-total-row">
                  <span className="cart-summary-total-lbl">Total</span>
                  <span className="cart-summary-total-val">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="cart-checkout-btn"
              >
                Proceed to Checkout →
              </button>

              <p className="cart-secure-text">
                🔒 Secure payment · {/*Table {tableId}*/}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}