// src/controllers/ordercontroller.js
import Order from "../models/Order.js";

// ── Create Order ─────────────────────────────────────────────────────────────
export const createOrder = async (data) => {
  const {
    tableNumber,
    items,
    customer,
    instructions,
    paymentMethod,
    subtotal,
    gst,
    discount,
    totalAmount,
  } = data;

  if (!items || !items.length) {
    throw new Error("Cart is empty");
  }

  // Ensure each item has itemTotal
  const itemsWithTotal = items.map((item) => ({
    ...item,
    itemTotal: item.price * item.quantity,
  }));

  // Calculate totals if not provided
  const orderSubtotal =
    subtotal ?? itemsWithTotal.reduce((acc, i) => acc + i.itemTotal, 0);
  const orderGst = gst ?? Math.round(orderSubtotal * 0.05); // 5% GST
  const orderDiscount = discount ?? 0;
  const orderTotal = totalAmount ?? orderSubtotal + orderGst - orderDiscount;

  // Create order instance
  let order = new Order({
    tableNumber,
    items: itemsWithTotal,
    customer,
    specialInstructions: instructions,
    paymentMethod,
    subtotal: orderSubtotal,
    gst: orderGst,
    discount: orderDiscount,
    totalAmount: orderTotal,
  });

  // Save first to generate _id
  order = await order.save();

  // Generate a human-readable orderId if not already present
  if (!order.orderId) {
    const randomPart = order._id.toString().slice(-8); // last 8 chars of _id
    order.orderId = `ORD-${randomPart}`;
    await order.save(); // save the updated orderId
  }

  return order;
};

// ── Get All Orders ───────────────────────────────────────────────────────────
export const getAllOrders = async () => {
  return await Order.find().sort({ createdAt: -1 });
};

// ── Update Order Status ──────────────────────────────────────────────────────
export const updateOrderStatus = async (id, status) => {
  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  if (!order) throw new Error("Order not found");
  return order;
};