// src/pages/CheckoutPage.js
import React, { useState, useCallback } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../styles/CheckoutPage.css"; // Added CSS import

// ─── Constants (Enhanced for Styling) ─────────────────────────────────────────
const TAX_RATE = 0.05;
const SERVICE_RATE = 0;
const PAYMENT_METHODS = ["upi", "card", "wallet"];

const PAYMENT_CONFIG = {
  upi: { label: "UPI", sublabel: "Instant transfer", icon: "📱" },
  card: { label: "Card", sublabel: "Debit / Credit", icon: "💳" },
  wallet: { label: "Wallet", sublabel: "Paytm · Amazon", icon: "👛" },
};

const UPI_APPS = [
  { id: "gpay", name: "GPay", initial: "G", color: "#4285F4" },
  { id: "phonepe", name: "PhonePe", initial: "P", color: "#5f259f" },
  { id: "bhim", name: "BHIM", initial: "B", color: "#00875a" },
  { id: "paytm", name: "Paytm", initial: "P", color: "#00baf2" },
];

const WALLET_APPS = [
  { id: "paytm", name: "Paytm", initial: "P", color: "#00baf2" },
  { id: "amazon", name: "Amazon Pay", initial: "A", color: "#ff9900" },
  { id: "mobikwik", name: "Mobikwik", initial: "M", color: "#3d5afe" },
  { id: "freecharge", name: "Freecharge", initial: "F", color: "#00c853" },
];

// ─── Validation ───────────────────────────────────────────────────────────────
const VALIDATORS = {
  name(v) {
    if (!v.trim()) return "Full name is required";
    if (v.trim().length < 2) return "Name must be at least 2 characters";
    return null;
  },
  phone(v) {
    if (!v.trim()) return "Phone number is required";
    if (!/^\+?[\d\s\-]{10,14}$/.test(v.trim())) return "Enter a valid phone number";
    return null;
  },
  upiId(v) {
    if (!v.trim()) return "UPI ID is required";
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(v.trim())) return "Invalid format";
    return null;
  },
  cardNumber(v) {
    const cleaned = v.replace(/\s/g, "");
    if (!cleaned) return "Card number is required";
    if (!/^\d{16}$/.test(cleaned)) return "Must be 16 digits";
    return null;
  },
  expiry(v) {
    if (!v.trim()) return "Expiry required";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v.trim())) return "Use MM/YY";
    return null;
  },
  cvv(v) {
    if (!v.trim()) return "CVV required";
    if (!/^\d{3,4}$/.test(v.trim())) return "3–4 digits";
    return null;
  },
  nameOnCard(v) {
    if (!v.trim()) return "Required";
    return null;
  },
};

function validateAll(fields) {
  const errors = {};
  let hasError = false;
  for (const [key, value] of Object.entries(fields)) {
    const fn = VALIDATORS[key];
    if (fn) {
      const error = fn(value);
      if (error) {
        errors[key] = error;
        hasError = true;
      }
    }
  }
  return { errors, isValid: !hasError };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatINR = (amount) => `₹${amount}`;

function formatCardNumber(raw) {
  return raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

// ─── UI Micro-components ──────────────────────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="checkout__field-error" role="alert">
      <span aria-hidden="true">⚠</span> {message}
    </p>
  );
}

function InputField({ label, required, error, hint, rightSlot, className = "", ...inputProps }) {
  return (
    <div className={`checkout__field ${className}`}>
      <label className="checkout__field-label">
        {label}
        {required && <span className="checkout__required" aria-hidden="true"> *</span>}
      </label>
      <div className="checkout__input-wrap">
        <input
          className={`checkout__input${error ? " checkout__input--error" : ""}`}
          {...inputProps}
        />
        {rightSlot && <div className="checkout__input-slot">{rightSlot}</div>}
      </div>
      {error && <FieldError message={error} />}
      {hint && !error && <p className="checkout__field-hint">{hint}</p>}
    </div>
  );
}

function PaymentTabBar({ active, onChange }) {
  return (
    <div className="checkout__pay-tabs" role="tablist">
      {PAYMENT_METHODS.map((method) => {
        const cfg = PAYMENT_CONFIG[method];
        const isActive = active === method;
        return (
          <button
            key={method}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(method)}
            className={`checkout__pay-tab${isActive ? " checkout__pay-tab--active" : ""}`}
          >
            <span className="checkout__pay-tab-icon">{cfg.icon}</span>
            <span className="checkout__pay-tab-label">{cfg.label}</span>
            <span className="checkout__pay-tab-sub">{cfg.sublabel}</span>
          </button>
        );
      })}
    </div>
  );
}

function SummaryRow({ label, value, muted, bold, large }) {
  return (
    <div className={`checkout__summary-row${bold ? " checkout__summary-row--bold" : ""}${muted ? " checkout__summary-row--muted" : ""}`}>
      <span className={large ? "checkout__summary-total-label" : ""}>{label}</span>
      <span className={`checkout__summary-value${large ? " checkout__summary-total-value" : ""}`}>{value}</span>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="checkout__spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { cart, getTotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [payMethod, setPayMethod] = useState("upi");
  const [payFields, setPayFields] = useState({
    upiId: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    nameOnCard: "",
  });
  const [instructions, setInstructions] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Totals
  const subtotal = getTotal();
  const gst = Math.round(subtotal * TAX_RATE);
  const serviceCharge = Math.round(subtotal * SERVICE_RATE);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + gst + serviceCharge - discount;

  const updatePayField = (key, value) => {
    setPayFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = useCallback(() => {
    const contactFields = { name, phone };
    let paymentFields = {};
    if (payMethod === "upi") paymentFields = { upiId: payFields.upiId };
    if (payMethod === "card") {
      paymentFields = {
        cardNumber: payFields.cardNumber,
        expiry: payFields.expiry,
        cvv: payFields.cvv,
        nameOnCard: payFields.nameOnCard,
      };
    }
    const { errors: allErrors, isValid } = validateAll({ ...contactFields, ...paymentFields });
    setErrors(allErrors);
    return isValid;
  }, [name, phone, payMethod, payFields]);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "DINE10") {
      setPromoApplied(true);
      setErrors((prev) => ({ ...prev, promoCode: undefined }));
    } else {
      setErrors((prev) => ({ ...prev, promoCode: "Invalid promo" }));
    }
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        tableNumber: 1, // <--- ADDED THIS DEFAULT VALUE BACK IN
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          itemTotal: item.price * item.quantity,
        })),
        customer: { name, phone },
        specialInstructions: instructions,
        paymentMethod: payMethod,
        subtotal,
        gst,
        serviceCharge,
        discount,
        totalAmount: total,
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      clearCart();
      navigate("/order-confirmation", { state: { order: data.order } });

    } catch (err) {
      setErrors((prev) => ({ ...prev, _submit: err.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cart.length) {
    return (
      <div className="checkout__empty">
        <div className="checkout__empty-icon">🛒</div>
        <h2 className="checkout__empty-title">Your cart is empty</h2>
        <p className="checkout__empty-desc">Add some dishes from our menu to get started.</p>
        <button className="checkout__btn-primary checkout__btn--lg" onClick={() => navigate("/menu")}>
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <>
      <main className="checkout">
        {/* Header */}
        <header className="checkout__header">
          <button className="checkout__back-btn" onClick={() => navigate(-1)} aria-label="Go back">←</button>
          <h1 className="checkout__title">Checkout</h1>
        </header>

        <div className="checkout__body">
          {/* ════════════ LEFT — Forms ════════════ */}
          <div className="checkout__left">

            {/* ── Contact Details ── */}
            <section className="checkout__card">
              <h2 className="checkout__section-title">Contact Details</h2>
              <div className="checkout__fields">
                <InputField
                  label="Full Name"
                  required
                  placeholder="Your name"
                  value={name}
                  error={errors.name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                />
                <InputField
                  label="Phone Number"
                  required
                  placeholder="+91 98765 43210"
                  type="tel"
                  value={phone}
                  error={errors.phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })); }}
                />
              </div>
            </section>

            {/* ── Payment Method ── */}
            <section className="checkout__card">
              <h2 className="checkout__section-title">Payment Method</h2>
              <PaymentTabBar active={payMethod} onChange={setPayMethod} />

              {/* UPI Form */}
              {payMethod === "upi" && (
                <div className="checkout__pay-panel">
                  <InputField
                    label="UPI ID"
                    required
                    placeholder="yourname@upi"
                    value={payFields.upiId}
                    error={errors.upiId}
                    onChange={(e) => updatePayField("upiId", e.target.value)}
                  />
                  <p className="checkout__app-grid-label">Or quick select</p>
                  <div className="checkout__app-grid">
                    {UPI_APPS.map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => updatePayField("upiId", `${name ? name.toLowerCase().replace(/\s/g, "") : "name"}@${app.id}`)}
                        className="checkout__app-btn"
                      >
                        <span className="checkout__app-avatar" style={{ background: app.color + "22", color: app.color }}>
                          {app.initial}
                        </span>
                        <span className="checkout__app-name">{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Form */}
              {payMethod === "card" && (
                <div className="checkout__pay-panel">
                  <InputField
                    label="Card Number"
                    required
                    placeholder="1234 5678 9012 3456"
                    value={payFields.cardNumber}
                    error={errors.cardNumber}
                    onChange={(e) => updatePayField("cardNumber", formatCardNumber(e.target.value))}
                  />
                  <div className="checkout__field-row">
                    <InputField
                      label="Expiry"
                      required
                      placeholder="MM/YY"
                      value={payFields.expiry}
                      error={errors.expiry}
                      onChange={(e) => updatePayField("expiry", formatExpiry(e.target.value))}
                    />
                    <InputField
                      label="CVV"
                      required
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={payFields.cvv}
                      error={errors.cvv}
                      onChange={(e) => updatePayField("cvv", e.target.value.replace(/\D/g, ""))}
                      rightSlot={<span className="checkout__lock-icon">🔒</span>}
                    />
                  </div>
                  <InputField
                    label="Name on Card"
                    required
                    placeholder="As printed on card"
                    value={payFields.nameOnCard}
                    error={errors.nameOnCard}
                    onChange={(e) => updatePayField("nameOnCard", e.target.value)}
                  />
                </div>
              )}

              {/* Wallet Form */}
              {payMethod === "wallet" && (
                <div className="checkout__pay-panel">
                  <p className="checkout__app-grid-label">Choose your wallet</p>
                  <div className="checkout__app-grid">
                    {WALLET_APPS.map((w) => (
                      <button key={w.id} type="button" className="checkout__app-btn">
                        <span className="checkout__app-avatar" style={{ background: w.color + "22", color: w.color }}>
                          {w.initial}
                        </span>
                        <span className="checkout__app-name">{w.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

          </div>

          {/* ════════════ RIGHT — Order Summary ════════════ */}
          <aside className="checkout__right">
            
            {/* Items Card */}
            <div className="checkout__card checkout__card--summary">
              <h2 className="checkout__section-title">Order Summary</h2>
              <ul className="checkout__items">
                {cart.map((item) => (
                  <li key={item.id} className="checkout__item">
                    <div className="checkout__item-info">
                      <span className="checkout__item-name">{item.name}</span>
                      <span className="checkout__item-meta">{formatINR(item.price)} × {item.quantity}</span>
                    </div>
                    <span className="checkout__item-price">{formatINR(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              {/* Promo Code */}
              <div className="checkout__promo">
                <div className="checkout__promo-row">
                  <input
                    className="checkout__promo-input"
                    placeholder="Promo Code (DINE10)"
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setErrors((p) => ({ ...p, promoCode: undefined })); }}
                    disabled={promoApplied}
                  />
                  {promoApplied ? (
                    <span className="checkout__promo-applied">Applied ✓</span>
                  ) : (
                    <button type="button" className="checkout__promo-btn" onClick={handleApplyPromo}>Apply</button>
                  )}
                </div>
                {errors.promoCode && <FieldError message={errors.promoCode} />}
              </div>
            </div>

            {/* Pricing Breakdown Card */}
            <div className="checkout__card checkout__card--pricing">
              <SummaryRow label="Subtotal" value={formatINR(subtotal)} />
              <SummaryRow label="GST (5%)" value={formatINR(gst)} />
              {serviceCharge > 0 && <SummaryRow label="Service charge" value={formatINR(serviceCharge)} />}
              {discount > 0 && <SummaryRow label="Promo discount" value={`−${formatINR(discount)}`} muted />}
              
              <div className="checkout__divider" />
              <SummaryRow label="Total" value={formatINR(total)} bold large />

              {errors._submit && (
                <div className="checkout__submit-error" role="alert">
                  <span aria-hidden="true">⚠</span> {errors._submit}
                </div>
              )}

              <button
                className="checkout__btn-primary checkout__btn--full"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Spinner /> Processing…</>
                ) : (
                  <>Pay {formatINR(total)}</>
                )}
              </button>
            </div>

            <button className="checkout__edit-cart" onClick={() => navigate("/menu")}>
              ← Edit cart
            </button>
          </aside>
        </div>
      </main>
    </>
  );
}