// src/services/api.js
// Central API service — all backend calls go through here.
// addMenuItem sends JSON (including base64 image).
// Backend returns the full saved document with _id.

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ===== MENU =====

export const fetchMenu = async () => {
  const res = await fetch(`${BASE_URL}/api/menu`);
  if (!res.ok) throw new Error("Failed to fetch menu");
  return res.json();
};

// Sends item as JSON. image field is a base64 data URI string or "".
// Backend returns the full saved MenuItem document (including _id).
export const addMenuItem = async (itemData) => {
  const res = await fetch(`${BASE_URL}/api/menu`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      name:      itemData.name,
      price:     Number(itemData.price),
      category:  itemData.category,
      image:     itemData.image || "",    // base64 string or ""
      available: itemData.available !== undefined ? itemData.available : true,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add menu item");
  return data; // full saved document with _id
};

export const deleteMenuItem = async (itemId) => {
  const res  = await fetch(`${BASE_URL}/api/menu/${itemId}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete menu item");
  return data;
};

export const toggleMenuItemAvailability = async (itemId, available) => {
  const res = await fetch(`${BASE_URL}/api/menu/${itemId}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ available }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update menu item");
  return data;
};

// ===== ORDERS =====

export const fetchOrders = async () => {
  const res = await fetch(`${BASE_URL}/api/orders`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
};

export const createOrder = async (orderData) => {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(orderData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create order");
  return data;
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update order status");
  return data;
};