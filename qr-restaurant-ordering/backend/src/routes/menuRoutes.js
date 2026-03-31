// backend/routes/menuRoutes.js
//
// FIXES:
// 1. POST route now accepts base64 image strings sent as JSON.
//    The image field is stored directly in MongoDB as a base64 data URI
//    (suitable for typical menu item photos under ~500KB).
//    For larger images, swap to Multer + disk/cloud storage later.
// 2. Socket emit happens AFTER save, returning the complete saved document
//    (with _id) so the frontend can identify it and avoid duplicates.
// 3. All routes return proper JSON with consistent shape.

import express from "express";
import MenuItem from "../models/MenuItem.js";

const router = express.Router();

// ── GET all menu items ────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const menu = await MenuItem.find().sort({ createdAt: 1 });
    res.status(200).json(menu);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu", error: error.message });
  }
});

// ── POST new menu item ────────────────────────────────────────────────────────
// Accepts JSON body: { name, price, category, image (base64 or ""), available }
// Returns the full saved document so the frontend can use the real _id.
router.post("/", async (req, res) => {
  try {
    const { name, price, category, image, available } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "name, price and category are required" });
    }

    const newItem = new MenuItem({
      name:      name.trim(),
      price:     Number(price),
      category:  category.trim(),
      image:     image || "",          // base64 data URI or empty string
      available: available !== undefined ? Boolean(available) : true,
    });

    const saved = await newItem.save();

    // Emit to other connected clients ONLY (the sender adds the item from
    // the POST response, not from the socket, to prevent duplication)
    const io = req.app.get("io");
    if (io) io.emit("menuUpdated", saved);

    // Return the full saved document (includes _id, createdAt, etc.)
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Error adding menu item", error: error.message });
  }
});

// ── DELETE a menu item ────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Deleted successfully", _id: deleted._id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete item", error: err.message });
  }
});

// ── PATCH toggle availability ─────────────────────────────────────────────────
router.patch("/:id", async (req, res) => {
  try {
    const { available } = req.body;
    if (available === undefined) {
      return res.status(400).json({ message: "available field is required" });
    }

    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { available: Boolean(available) },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Item not found" });

    const io = req.app.get("io");
    if (io) io.emit("menuUpdated", updated);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update item", error: err.message });
  }
});

export default router;