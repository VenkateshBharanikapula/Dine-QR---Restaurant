// src/pages/OrderConfirmationPage.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useOrders } from "../context/OrderContext";
import { io } from "socket.io-client";
import "../styles/OrderConfirmationPage.css";

function formatINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

const STATUS_MAP = {
  PAYMENT_CONFIRMED: 0,
  ACCEPTED: 1,
  PREPARING: 2,
  READY: 3,
  SERVED: 4,
};

const STEPS = [
  { icon: "✓", label: "Payment\nConfirmed" },
  { icon: "🪑", label: "Accepted" },
  { icon: "🍳", label: "Preparing" },
  { icon: "🔔", label: "Ready to\nServe" },
  { icon: "🏁", label: "Served" },
];

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orders } = useOrders();

  const orderId = location.state?.order?.id;

  const initialOrder =
    orders.find((o) => o.id === orderId) || location.state?.order;

  const [liveOrder, setLiveOrder] = useState(initialOrder);

  useEffect(() => {
    if (!initialOrder) return;

    const socket = io(process.env.REACT_APP_API_URL);

    socket.on("connect", () => {
      console.log("🟢 Connected to socket:", socket.id);
    });

    socket.on("orderUpdated", (updatedOrder) => {
      if (
        updatedOrder._id === (initialOrder._id || initialOrder.id)
      ) {
        setLiveOrder(updatedOrder);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    return () => socket.disconnect();
  }, [initialOrder]);

  if (!liveOrder) {
    return (
      <div className="oc-page">
        <div className="oc-empty">
          <div className="oc-empty-icon">🛒</div>
          <h2 className="oc-empty-title">No order found</h2>
          <p className="oc-empty-desc">
            Place an order to see your confirmation here.
          </p>
          <button
            className="oc-btn-primary"
            style={{ maxWidth: 220, margin: "0 auto" }}
            onClick={() => navigate("/menu")}
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  const activeStep = STATUS_MAP[liveOrder.status] ?? 0;

  const payLabel = {
    card: "Card / UPI",
    upi: "UPI",
    wallet: "Wallet",
    cod: "Cash on Delivery",
  }[liveOrder.paymentMethod] ?? liveOrder.paymentMethod;

  const subtotal = liveOrder.items?.reduce(
    (sum, item) =>
      sum + (item.price ?? 0) * (item.quantity ?? 0),
    0
  );
  const gst = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + gst - (liveOrder.discount ?? 0);

  return (
    <div className="oc-page">
      <div className="oc-wrap">

        <div className="oc-ring-wrap">
          <div className="oc-ring">✓</div>
        </div>

        <h1 className="oc-heading">Order Confirmed!</h1>
        <p className="oc-subhead">
          {liveOrder.customer?.name
            ? `${liveOrder.customer.name}, your`
            : "Your"}{" "}
          food is being prepared. Show this ID at the counter.
        </p>

        <div className="oc-ticket">
          <p className="oc-ticket-label">Your Order ID</p>
          <p className="oc-ticket-id">
            {liveOrder.orderId || liveOrder._id}
          </p>
          <p className="oc-ticket-hint">
            Screenshot this or note it down
          </p>
        </div>

        <div className="oc-steps">
          {STEPS.map((step, i) => (
            <div key={step.label} className="oc-step">
              {i < STEPS.length - 1 && (
                <div
                  className={`oc-step-connector${
                    i < activeStep ? " active" : ""
                  }`}
                />
              )}
              <div
                className={`oc-step-icon${
                  i <= activeStep ? " active" : ""
                }`}
              >
                {step.icon}
              </div>
              <p
                className={`oc-step-label${
                  i <= activeStep ? " active" : ""
                }`}
              >
                {step.label}
              </p>
            </div>
          ))}
        </div>

        <div className="oc-card">
          <p className="oc-card-title">Order Details</p>

          {liveOrder.customer?.name && (
            <div className="oc-info-row">
              <span className="oc-info-label">Customer</span>
              <span className="oc-info-val">
                {liveOrder.customer.name}
              </span>
            </div>
          )}

          {liveOrder.customer?.phone && (
            <div className="oc-info-row">
              <span className="oc-info-label">Phone</span>
              <span className="oc-info-val">
                {liveOrder.customer.phone}
              </span>
            </div>
          )}

          <div className="oc-info-row">
            <span className="oc-info-label">Payment</span>
            <span className="oc-info-val">{payLabel}</span>
          </div>

          <div className="oc-items">
            {liveOrder.items.map((item, idx) => (
              <div
                key={item._id || item.id || idx}
                className="oc-item-row"
              >
                <div>
                  <p className="oc-item-name">{item.name}</p>
                  <p className="oc-item-meta">
                    {formatINR(item.price)} × {item.quantity}
                  </p>
                </div>
                <span className="oc-item-price">
                  {formatINR(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="oc-price-row">
            <span className="oc-price-label">Subtotal</span>
            <span className="oc-price-val">
              {formatINR(subtotal)}
            </span>
          </div>

          <div className="oc-price-row">
            <span className="oc-price-label">GST (5%)</span>
            <span className="oc-price-val">
              {formatINR(gst)}
            </span>
          </div>

          {(liveOrder.discount ?? 0) > 0 && (
            <div className="oc-price-row">
              <span className="oc-price-label">
                Promo discount
              </span>
              <span
                className="oc-price-val"
                style={{ color: "#4caf7d" }}
              >
                −{formatINR(liveOrder.discount)}
              </span>
            </div>
          )}

          <div className="oc-divider" />

          <div className="oc-total-row">
            <span>Total</span>
            <span className="oc-total-val">
              {formatINR(totalAmount)}
            </span>
          </div>
        </div>

        <div className="oc-actions">
          <button
            className="oc-btn-primary"
            onClick={() => navigate("/menu")}
          >
            ✓ Order More Items
          </button>
          <button
            className="oc-btn-secondary"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}