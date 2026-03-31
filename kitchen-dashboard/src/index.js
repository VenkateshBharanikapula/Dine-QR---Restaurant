// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import App from "./App";

import { AuthProvider }  from "./context/AuthContext";
import { OrderProvider } from "./context/OrderContext";

// CartProvider is inside App.js (inside BrowserRouter) so cart can use useNavigate.
// AuthProvider and OrderProvider go outside since they don't need router context.

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <OrderProvider>
        <App />
      </OrderProvider>
    </AuthProvider>
  </React.StrictMode>
);
