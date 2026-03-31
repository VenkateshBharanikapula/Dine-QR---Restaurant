// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── Seed accounts — in production these come from the backend ────────────────
// Customers who self-register get role: "customer" automatically.
// Admin and kitchen accounts are pre-seeded here for demo purposes.
const SEED_ACCOUNTS = [
  { name: "Admin User",   email: "admin@dineqr.com",   password: "admin123",   role: "admin"   },
  { name: "Kitchen Staff", email: "kitchen@dineqr.com", password: "kitchen123", role: "kitchen" },
];

const AuthContext = createContext(null);

const STORAGE_KEY = "dineqr_user";

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Hydrate from localStorage on app start ──────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // Corrupted storage — start fresh
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Persist user to localStorage whenever it changes ───────────────────────
  useEffect(() => {
    if (user) {
      // Never persist the password field
      const { password: _pw, ...safeUser } = user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // ── Register — always creates a customer account ────────────────────────────
  const register = useCallback((name, email, password) => {
    // Check if email already exists in seed accounts
    if (SEED_ACCOUNTS.find(a => a.email === email)) {
      return { success: false, error: "Email already in use." };
    }

    // Check localStorage for existing registered customers
    const allUsers = JSON.parse(localStorage.getItem("dineqr_all_users") || "[]");
    if (allUsers.find(u => u.email === email)) {
      return { success: false, error: "Email already registered." };
    }

    const newUser = { name, email, password, role: "customer" };
    localStorage.setItem("dineqr_all_users", JSON.stringify([...allUsers, newUser]));

    const { password: _pw, ...safeUser } = newUser;
    setUser(safeUser);
    return { success: true };
  }, []);

  // ── Login — checks seed accounts first, then registered customers ───────────
  const login = useCallback((email, password) => {
    // 1. Check privileged seed accounts (admin, kitchen)
    const seed = SEED_ACCOUNTS.find(
      a => a.email === email && a.password === password
    );
    if (seed) {
      const { password: _pw, ...safeUser } = seed;
      setUser(safeUser);
      return { success: true, role: safeUser.role };
    }

    // 2. Check registered customer accounts
    const allUsers = JSON.parse(localStorage.getItem("dineqr_all_users") || "[]");
    const found = allUsers.find(
      u => u.email === email && u.password === password
    );
    if (found) {
      const { password: _pw, ...safeUser } = found;
      setUser(safeUser);
      return { success: true, role: safeUser.role };
    }

    return { success: false, error: "Incorrect email or password." };
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // ── Role helpers ────────────────────────────────────────────────────────────
  const isAdmin    = user?.role === "admin";
  const isKitchen  = user?.role === "kitchen";
  const isCustomer = user?.role === "customer";
  const isStaff    = isAdmin || isKitchen;

  return (
    <AuthContext.Provider value={{
      user, loading,
      register, login, logout,
      isAdmin, isKitchen, isCustomer, isStaff,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
