import Order from "../models/Order.js";

// Create Order
export const createOrder = async (data) => {
  const order = new Order(data);
  return await order.save();
};

// Get All Orders
export const getAllOrders = async () => {
  return await Order.find().sort({ createdAt: -1 });
};

// Update Order Status with FLOW CONTROL
export const updateOrderStatus = async (id, newStatus) => {
  const order = await Order.findById(id);

  if (!order) {
    throw new Error("Order not found");
  }

  const flow = {
    pending: ["accepted"],
    accepted: ["preparing"],
    preparing: ["ready"],
    ready: ["delivered"],
    delivered: [],
  };

  if (!flow[order.status].includes(newStatus)) {
    throw new Error(`Invalid transition from ${order.status} → ${newStatus}`);
  }

  order.status = newStatus;
  return await order.save();
};