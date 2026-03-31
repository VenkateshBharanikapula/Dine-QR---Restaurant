// src/pages/LoginPage.js
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

// ─── FloatingInput ────────────────────────────────────────────────────────────
function FloatingInput({ label, type = "text", value, onChange, error, autoComplete }) {
  const [focused, setFocused] = useState(false);

  // Label floats up when the field is focused OR has a value typed in
  const isActive = focused || value.length > 0;

  return (
    <div className="lp-field">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        className={`lp-input${error ? " error" : ""}`}
        // Prevent browser autofill from hiding our custom label
        placeholder=" "
      />
      {/* Label animates from center of input up to top-left corner */}
      <label className={`lp-label${isActive ? " active" : ""}`}>
        {label}
      </label>
      {error && (
        <p className="lp-error">
          <span aria-hidden>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// ─── LoginPage ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login }     = useAuth();
  const { clearCart } = useCart();
  const navigate      = useNavigate();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading,      setLoading]      = useState(false);

  const handleLogin = async () => {
    setGeneralError("");

    if (!email.trim() || !password.trim()) {
      setGeneralError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    // Small UX delay so the spinner is visible
    await new Promise(r => setTimeout(r, 400));
    const result = login(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      setGeneralError(result.error);
      return;
    }

    // Clear previous user's cart on successful login
    clearCart();

    // Role-based redirect
    if (result.role === "admin")   { navigate("/admin",   { replace: true }); return; }
    if (result.role === "kitchen") { navigate("/kitchen", { replace: true }); return; }
    navigate("/menu", { replace: true });
  };

  const handleKeyDown = e => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">🍽</div>
          <span className="login-logo-name">
            Dine<span>QR</span>
          </span>
        </div>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to continue</p>

        {/* Demo credentials hint */}
        <div className="lp-hint">
          <div className="lp-hint-title">Demo Accounts</div>
          <div className="lp-hint-row">
            <span className="lp-hint-label">Admin</span>
            <span className="lp-hint-val">admin@dineqr.com / admin123</span>
          </div>
          <div className="lp-hint-row">
            <span className="lp-hint-label">Kitchen</span>
            <span className="lp-hint-val">kitchen@dineqr.com / kitchen123</span>
          </div>
          <div className="lp-hint-row">
            <span className="lp-hint-label">Customer</span>
            <span className="lp-hint-val">Register a new account below</span>
          </div>
        </div>

        {/* General error banner */}
        {generalError && (
          <div className="lp-general-error">
            <span>⚠</span> {generalError}
          </div>
        )}

        {/* Email field */}
        <FloatingInput
          label="Email address"
          value={email}
          onChange={e => { setEmail(e.target.value); setGeneralError(""); }}
          autoComplete="email"
        />

        {/* Password field */}
        <FloatingInput
          label="Password"
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setGeneralError(""); }}
          autoComplete="current-password"
        />

        {/* Submit */}
        <button
          className="lp-btn"
          onClick={handleLogin}
          onKeyDown={handleKeyDown}
          disabled={loading}
        >
          {loading
            ? <><div className="lp-spinner" /> Signing in…</>
            : "Sign In"
          }
        </button>

        <div className="lp-divider">
          <span className="lp-divider-text">or</span>
        </div>

        <div className="lp-footer">
          Don't have an account?{" "}
          <span className="lp-footer-link" onClick={() => navigate("/register")}>
            Create one
          </span>
        </div>

      </div>
    </div>
  );
}