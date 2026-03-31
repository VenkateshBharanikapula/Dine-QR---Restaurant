// src/pages/MenuPage.js
import React, { useState, useMemo, useEffect, useCallback } from "react";
import MenuItemCard from "../components/MenuItemCard";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { fetchMenu } from "../services/api";
import io from "socket.io-client";
import "../styles/MenuPage.css"; // Added CSS import

const CATEGORY_ICONS = {
  All: "✦",
  Burgers: "🍔",
  Pizza: "🍕",
  Snacks: "🍟",
  Pasta: "🍝",
  Salads: "🥗",
  Wraps: "🌯",
  Beverages: "🥤",
  Desserts: "🍰",
};

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="menu-skeleton-card">
      <div className="menu-skeleton-img" />
      <div className="menu-skeleton-content">
        <div className="menu-skeleton-line1" />
        <div className="menu-skeleton-line2" />
        <div className="menu-skeleton-line3" />
      </div>
    </div>
  );
}

export default function MenuPage() {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const loadMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMenu();
      setMenuData(data);
    } catch {
      setError("Could not load menu. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMenu(); }, [loadMenu]);

  const categories = useMemo(() => {
    const cats = menuData.map((i) => i.category).filter(Boolean);
    return ["All", ...new Set(cats)];
  }, [menuData]);

  const filteredItems = useMemo(() => {
    let items = activeCategory === "All" ? menuData : menuData.filter((i) => i.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q));
    }
    return items;
  }, [activeCategory, menuData, search]);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL || "http://localhost:5000");

    socket.on("menuUpdated", (updatedItem) => {
      setMenuData((prev) => {
        const exists = prev.find((i) => i._id === updatedItem._id);

        if (exists) {
          return prev.map((i) =>
            i._id === updatedItem._id ? updatedItem : i
          );
        }

        return [updatedItem, ...prev];
      });
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="menu-page-container">

      {/* HERO HEADER */}
      <div className="menu-hero-header">
        <div className="menu-hero-content">

          {/* TOP ROW */}
          <div className="menu-top-row">
            <div>
              <h1 className="menu-title">
                What would you<br />
                <span className="menu-title-highlight">like to order?</span>
              </h1>
            </div>

            {/* CART BUTTON */}
            <button
              onClick={() => navigate("/cart")}
              className={`menu-cart-btn ${cartCount > 0 ? "active" : ""}`}
            >
              🛒
              {cartCount > 0 ? (
                <span>{cartCount} item{cartCount > 1 ? "s" : ""} in cart</span>
              ) : (
                <span>View Cart</span>
              )}
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="menu-search-wrapper">
            <span className="menu-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search dishes, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="menu-search-input"
            />
          </div>

          {/* CATEGORY PILLS */}
          <div className="menu-category-scroll">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`menu-category-pill ${activeCategory === cat ? "active" : ""}`}
              >
                <span>{CATEGORY_ICONS[cat] || "•"}</span>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="menu-main-content">

        {/* RESULTS COUNT */}
        {!loading && !error && (
          <div className="menu-results-count-wrap">
            <p className="menu-results-count">
              {filteredItems.length} {filteredItems.length === 1 ? "dish" : "dishes"}
              {activeCategory !== "All" && ` in ${activeCategory}`}
              {search && ` matching "${search}"`}
            </p>
          </div>
        )}

        {/* LOADING SKELETONS */}
        {loading && (
          <div className="menu-grid">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div className="menu-error-state">
            <div className="menu-state-icon">⚠️</div>
            <h3 className="menu-state-title">{error}</h3>
            <button onClick={loadMenu} className="menu-state-btn">
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="menu-empty-state">
            <div className="menu-state-icon">🔍</div>
            <h3 className="menu-state-title">Nothing found</h3>
            <p className="menu-empty-text">
              Try a different category or search term
            </p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="menu-empty-btn-outline"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* MENU GRID */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="menu-grid">
            {filteredItems.map((item, index) => (
              <MenuItemCard key={item._id} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}