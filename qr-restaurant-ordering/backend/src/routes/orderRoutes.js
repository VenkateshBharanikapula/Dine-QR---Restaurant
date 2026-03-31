import express from "express";
import Order from "../models/Order.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// ===============================
// STATUS FLOW (MATCH DASHBOARD)
// ===============================
const ORDER_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  PREPARING: "PREPARING",
  READY: "READY",
  SERVED: "SERVED",
};

const STATUS_FLOW = {
  PENDING: ["ACCEPTED"],
  ACCEPTED: ["PREPARING"],
  PREPARING: ["READY"],
  READY: ["SERVED"],
  SERVED: [],
};

// ===============================
// CREATE ORDER ✅ FIXED
// ===============================
router.post("/", async (req, res) => {
  try {
    const {
      tableNumber,
      items,
      customer,
      instructions,
      paymentMethod,
    } = req.body;

    if (!tableNumber || !items || !items.length) {
      return res.status(400).json({
        message: "tableNumber and items are required",
      });
    }

    // ✅ calculate totals properly
    let totalAmount = 0;

    const processedItems = items.map((item) => {
      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;

      return {
        ...item,
        itemTotal,
      };
    });

    const newOrder = new Order({
      orderId: "ORD-" + uuidv4().slice(0, 8),

      tableNumber,
      customer,

      items: processedItems,

      totalAmount,
      paymentMethod,
      instructions,

      paymentStatus: "PAID",
      status: ORDER_STATUS.PENDING,
    });

    await newOrder.save();

    // 🔥 socket (optional)
    const io = req.app.get("io");
    if (io) {
      io.emit("newOrder", newOrder);
    }

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error creating order",
      error: error.message,
    });
  }
});

// ===============================
// GET ALL ORDERS
// ===============================
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
});

// ===============================
// UPDATE STATUS (MATCH FRONTEND)
// ===============================
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const allowedNext = STATUS_FLOW[order.status];

    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        message: `Invalid transition ${order.status} → ${status}`,
      });
    }

    order.status = status;
    await order.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("orderUpdated", order);
    }

    res.json({ order });

  } catch (error) {
    res.status(500).json({
      message: "Error updating order",
      error: error.message,
    });
  }
});

export default router;