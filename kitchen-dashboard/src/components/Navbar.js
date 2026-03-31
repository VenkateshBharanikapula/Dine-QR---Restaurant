// src/components/Navbar.js
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import "../styles/Navbar.css";

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMobileMenu(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const goTo = (path) => {
    navigate(path);
    setDropdownOpen(false);
    setMobileMenu(false);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const navLinks = [
    { to: "/menu", label: "Menu", icon: "✦" },
    { to: "/kitchen", label: "Kitchen", icon: "✦" },
    { to: "/admin", label: "Admin", icon: "✦" },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="navbar-container">
          {/* LOGO */}
          <div className="navbar-logo" onClick={() => goTo("/menu")}>
            <div className="navbar-logo-icon">🍽️</div>
            <span className="navbar-logo-text">
              QR<span className="navbar-logo-highlight">Restaurant</span>
            </span>
          </div>

          {/* DESKTOP NAV */}
          {!isMobile && (
            <div className="navbar-links">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `navbar-link ${isActive ? "active" : ""}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          )}

          {/* RIGHT SIDE */}
          <div className="navbar-right">
            {/* CART */}
            <div className="navbar-cart-icon" onClick={() => goTo("/cart")}>
              🛒
              {cartCount > 0 && (
                <span className="navbar-cart-badge">{cartCount}</span>
              )}
            </div>

            {/* PROFILE */}
            {user && (
              <div className="navbar-profile" ref={dropdownRef}>
                <div
                  className={`navbar-avatar ${dropdownOpen ? "open" : ""}`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {getInitials(user.name)}
                </div>

                {/* DROPDOWN */}
                {dropdownOpen && (
                  <div className="navbar-dropdown">
                    {/* USER HEADER */}
                    <div className="navbar-dropdown-header">
                      <div className="navbar-dropdown-avatar">
                        {getInitials(user.name)}
                      </div>
                      <div className="navbar-dropdown-name">
                        {user.name || "User"}
                      </div>
                      <div className="navbar-dropdown-email">{user.email}</div>
                    </div>

                    {/* MENU ITEMS */}
                    {[
                      { icon: "🍴", label: "Menu", path: "/menu" },
                      { icon: "🛒", label: "My Cart", path: "/cart", badge: cartCount },
                      { icon: "👨‍🍳", label: "Kitchen", path: "/kitchen" },
                      { icon: "⚙️", label: "Admin Panel", path: "/admin" },
                    ].map(({ icon, label, path, badge }) => (
                      <div
                        key={path}
                        className="navbar-dropdown-item"
                        onClick={() => goTo(path)}
                      >
                        <span className="navbar-dropdown-icon">{icon}</span>
                        <span className="navbar-dropdown-label">{label}</span>
                        {badge > 0 && (
                          <span className="navbar-dropdown-badge">{badge}</span>
                        )}
                      </div>
                    ))}

                    {/* LOGOUT */}
                    <div
                      className="navbar-dropdown-logout"
                      onClick={handleLogout}
                    >
                      <span>🚪</span> Logout
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* HAMBURGER */}
            {isMobile && (
              <div
                className={`navbar-hamburger ${mobileMenu ? "open" : ""}`}
                onClick={() => setMobileMenu(!mobileMenu)}
              >
                <div className="hamburger-line line1" />
                <div className="hamburger-line line2" />
                <div className="hamburger-line line3" />
              </div>
            )}
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMobile && mobileMenu && (
          <div className="navbar-mobile-menu">
            {[
              { label: "Menu", path: "/menu" },
              { label: "Kitchen", path: "/kitchen" },
              { label: "Admin", path: "/admin" },
              { label: `Cart ${cartCount > 0 ? `(${cartCount})` : ""}`, path: "/cart" },
            ].map(({ label, path }) => (
              <div
                key={path}
                className="navbar-mobile-item"
                onClick={() => goTo(path)}
              >
                {label}
              </div>
            ))}
            <div className="navbar-mobile-logout" onClick={handleLogout}>
              Logout
            </div>
          </div>
        )}
      </nav>
    </>
  );
}