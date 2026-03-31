// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar                from "./components/Navbar";
import ProtectedRoute        from "./components/ProtectedRoute";

import MenuPage              from "./pages/MenuPage";
import CartPage              from "./pages/CartPage";
import CheckoutPage          from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import LoginPage             from "./pages/LoginPage";
import RegisterPage          from "./pages/RegisterPage";
import TablePage             from "./pages/TablePage";
import KitchenDashboard      from "./pages/KitchenDashboard";
import AdminPage             from "./pages/AdminPage";

import { useAuth }    from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// ─── Role-based root redirect ─────────────────────────────────────────────────
function RootRedirect() {
  const { user } = useAuth();
  if (!user)                return <Navigate to="/login"   replace />;
  if (user.role === "admin")   return <Navigate to="/admin"   replace />;
  if (user.role === "kitchen") return <Navigate to="/kitchen" replace />;
  return <Navigate to="/menu" replace />;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <CartProvider>
        {/* Navbar shown for all logged-in users; it adapts by role internally */}
        {user && <Navbar />}

        <Routes>
          {/* Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* ── Public auth routes ── */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── QR scan entry point ── */}
          <Route path="/table/:tableId" element={<TablePage />} />

          {/* ── Customer routes (customer + admin can both access) ── */}
          <Route path="/menu"
            element={
              <ProtectedRoute>
                <MenuPage />
              </ProtectedRoute>
            }
          />
          <Route path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route path="/order-confirmation"
            element={
              <ProtectedRoute>
                <OrderConfirmationPage />
              </ProtectedRoute>
            }
          />

          {/* ── Kitchen route — kitchen staff AND admin ── */}
          <Route path="/kitchen"
            element={
              <ProtectedRoute anyStaff>
                <KitchenDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Admin-only routes ── */}
          <Route path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
