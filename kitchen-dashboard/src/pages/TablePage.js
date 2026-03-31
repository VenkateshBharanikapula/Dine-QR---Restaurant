// src/pages/TablePage.js
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../styles/TablePage.css"; // Added CSS import

export default function TablePage() {
  const { tableId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (tableId) {
      // ✅ Save tableId to localStorage before redirecting
      localStorage.setItem("tableId", tableId);
      navigate("/menu", { replace: true }); // replace: true so back button doesn't loop
    } else {
      navigate("/login", { replace: true });
    }
  }, [tableId, navigate]);

  return (
    <div className="table-page-container">
      <div className="table-page-icon">🍽️</div>
      <h2 className="table-page-title">Loading Table {tableId}...</h2>
      <p className="table-page-subtitle">Please wait while we open the menu</p>
    </div>
  );
}