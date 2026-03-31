import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  // ✅ Order info
  orderId: {
    type: String,
  },

  tableNumber: {
    type: Number,
    required: true,
  },

  // ✅ Customer
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
  },

  // ✅ Items
  items: [
    {
      id: String,
      name: String,
      price: Number,
      quantity: Number,
      itemTotal: Number, // 🔥 REQUIRED for kitchen UI
    },
  ],

  // ✅ Pricing (match dashboard)
  totalAmount: {
    type: Number,
    required: true,
  },

  // Breakdown
  subtotal: Number,
  gst: Number,
  serviceCharge: Number,
  discount: Number,

  // ✅ Payment
  paymentMethod: String,
  paymentStatus: {
    type: String,
    default: "PAID",
  },

  // ✅ Notes
  specialInstructions: String,

  // ✅ STATUS
  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "PREPARING", "READY", "SERVED"],
    default: "PENDING",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", orderSchema);