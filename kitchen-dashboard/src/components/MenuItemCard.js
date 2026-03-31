// src/components/MenuItemCard.js
import React, { useCallback, useState, memo, useEffect } from "react";
import { useCart } from "../context/CartContext";
import "../styles/MenuItemCard.css"; // Ensure you create this file in your styles folder

const FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240'%3E%3Crect width='400' height='240' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='13' fill='%23444'%3ENo Image%3C/text%3E%3C/svg%3E";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ─── Image URL resolver ────────────────────────────────────────────────────────
function resolveImageSrc(image) {
  if (!image || image.trim() === "") return FALLBACK;

  // Already a data URI (base64 stored in MongoDB)
  if (image.startsWith("data:")) return image;

  // Full external URL
  if (image.startsWith("http://") || image.startsWith("https://")) return image;

  // Frontend public folder paths  (e.g. "/images/Cheese Burger.jpg")
  if (image.startsWith("/images/")) return image;

  // Backend uploads path (e.g. "/uploads/1234-item.jpg") → prepend BASE_URL
  if (image.startsWith("/uploads/")) return `${BASE_URL}${image}`;

  // Any other absolute path starting with /
  if (image.startsWith("/")) return `${BASE_URL}${image}`;

  // Bare filename — these are pre-seeded items whose images live in /public/images/
  return `/images/${image}`;
}

// ─── Component ─────────────────────────────────────────────────────────────────
const MenuItemCard = memo(function MenuItemCard({ item, index = 0 }) {
  const { addToCart, decreaseQty, cart } = useCart();

  const [imgSrc, setImgSrc] = useState(() => resolveImageSrc(item.image));
  const [adding, setAdding] = useState(false);

  // Re-resolve when item.image changes (e.g. after socket update)
  useEffect(() => {
    setImgSrc(resolveImageSrc(item.image));
  }, [item.image]);

  const tableId  = localStorage.getItem("tableId") || "T1";
  const cartItem = cart.find((i) => i._id === item._id && i.tableId === tableId);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = useCallback(() => {
    setAdding(true);
    addToCart(item);
    setTimeout(() => setAdding(false), 300);
  }, [addToCart, item]);

  const handleDecrease = useCallback(() => decreaseQty(item._id), [decreaseQty, item._id]);

  return (
    <div
      className="menu-item-card fade-up"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* IMAGE */}
      <div className="menu-item-image-wrapper">
        <img
          src={imgSrc}
          alt={item.name}
          loading="lazy"
          decoding="async"
          onError={() => setImgSrc(FALLBACK)}
          className="menu-item-image"
        />

        {/* GRADIENT OVERLAY */}
        <div className="menu-item-gradient" />

        {/* AVAILABILITY BADGE */}
        <div className={`menu-item-badge ${item.available ? "badge-available" : "badge-sold-out"}`}>
          {item.available ? "Available" : "Sold Out"}
        </div>
      </div>

      {/* CONTENT */}
      <div className="menu-item-content">

        {/* CATEGORY */}
        <span className="menu-item-category">
          {item.category}
        </span>

        {/* NAME */}
        <h3 className="menu-item-name">
          {item.name}
        </h3>

        {/* PRICE + CONTROLS */}
        <div className="menu-item-footer">
          <span className="menu-item-price">
            ₹{item.price}
          </span>

          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!item.available}
              className={`menu-item-add-btn ${item.available ? "available" : "disabled"} ${adding ? "adding" : ""}`}
            >
              + Add
            </button>
          ) : (
            <div className="menu-item-qty-selector">
              <button onClick={handleDecrease} className="menu-item-qty-btn">
                −
              </button>

              <span className="menu-item-qty-text">
                {quantity}
              </span>

              <button onClick={handleAdd} className="menu-item-qty-btn">
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default MenuItemCard;