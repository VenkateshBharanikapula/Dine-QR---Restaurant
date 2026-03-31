// src/pages/RegisterPage.js
import React, { useState } from "react";
import { useAuth }    from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/RegisterPage.css"; 

// ─── Password strength ────────────────────────────────────────────────────────
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8)   score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const label = score <= 1 ? "Weak" : score <= 2 ? "Fair" : score === 3 ? "Good" : "Strong";
  return { score, label };
}

// ─── FloatingInput ────────────────────────────────────────────────────────────
function FloatingInput({ label, type = "text", value, onChange, error, autoComplete }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value;
  return (
    <div className="rp-field">
      <input
        type={type} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        className={`rp-input${error ? " error" : ""}`}
      />
      <label className={`rp-label${active ? " active" : ""}`}>{label}</label>
      {error && <p className="rp-field-error"><span>⚠</span> {error}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { register }  = useAuth();
  const navigate      = useNavigate();

  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [errors,       setErrors]       = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading,      setLoading]      = useState(false);
  
  const [passwordFocused, setPasswordFocused] = useState(false);
  const passwordActive = passwordFocused || password;

  const strength = getPasswordStrength(password);

  const validate = () => {
    const e = {};
    if (!name.trim() || name.trim().length < 2) e.name = "Full name is required (min 2 chars)";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleRegister = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setGeneralError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = register(name.trim(), email.trim(), password);
    setLoading(false);
    if (!result.success) { setGeneralError(result.error); return; }
    navigate("/menu", { replace: true });
  };

  const strengthClass = (i) => {
    if (i >= strength.score) return "rp-strength-bar";
    if (strength.score <= 1) return "rp-strength-bar filled-weak";
    if (strength.score <= 2) return "rp-strength-bar filled-medium";
    return "rp-strength-bar filled-strong";
  };

  return (
    <div className="rp-page">
      <div className="rp-card">
        {/* Logo */}
        <div className="rp-logo">
          <div className="rp-logo-icon">🍽</div>
          <span className="rp-logo-name">Dine<span>QR</span></span>
        </div>

        <h1 className="rp-title">Create account</h1>
        <p className="rp-subtitle">Join and start ordering in seconds</p>

        {generalError && (
          <div className="rp-general-error"><span>⚠</span> {generalError}</div>
        )}

        <FloatingInput
          label="Full Name" value={name}
          onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })); }}
          error={errors.name} autoComplete="name"
        />
        
        <FloatingInput
          label="Email address" value={email}
          onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
          error={errors.email} autoComplete="email"
        />

        {/* Password with strength indicator */}
        <div className="rp-field">
          <input
            type="password" value={password}
            onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
            onFocus={() => setPasswordFocused(true)} 
            onBlur={() => setPasswordFocused(false)}
            className={`rp-input${errors.password ? " error" : ""}`}
            autoComplete="new-password"
          />
          {/* Label is outside the input but inside rp-field, just like FloatingInput */}
          <label className={`rp-label${passwordActive ? " active" : ""}`}>Password</label>
          
          {errors.password && <p className="rp-field-error"><span>⚠</span> {errors.password}</p>}
          
          {password && (
            <>
              <div className="rp-strength-bar-wrap">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={strengthClass(i)} />
                ))}
              </div>
              <p className="rp-strength-label">{strength.label} password</p>
            </>
          )}
        </div>

        <button className="rp-btn" onClick={handleRegister} disabled={loading}>
          {loading ? <><div className="rp-spinner" /> Creating account…</> : "Create Account"}
        </button>

        <div className="rp-divider"><span className="rp-divider-text">or</span></div>

        <div className="rp-footer">
          Already have an account?{" "}
          <span className="rp-footer-link" onClick={() => navigate("/login")}>Sign in</span>
        </div>
      </div>
    </div>
  );
}