// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/ProtectedRoute.css"; // Added CSS import

/**
 * ProtectedRoute ensures that only authenticated users can access certain pages.
 * Optionally, you can pass a `requiredRole` prop to restrict access to specific roles.
 *
 * Props:
 * - children: React node(s) to render if access is allowed
 * - requiredRole (optional): string, e.g., "admin" or "kitchen"
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  // 1️⃣ Show loading state while checking authentication
  if (loading) {
    return (
      <div className="protected-loading-container">
        <p className="protected-loading-text">Loading...</p>
      </div>
    );
  }

  // 2️⃣ Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3️⃣ Redirect if user does not have the required role
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="protected-access-denied">
        <h2>❌ Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  // 4️⃣ If all checks pass, render children
  return children;
}