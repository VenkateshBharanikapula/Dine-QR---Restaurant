// src/pages/KitchenDashboard.js
// Talks directly to Express backend. No context. No localStorage.
// Status: PENDING -> ACCEPTED -> PREPARING -> READY -> SERVED
// Polls every 1 second. Shows totalAmount and per-item costs.

import { useEffect, useState, useCallback, useRef } from "react";
import "../styles/KitchenDashboard.css"; // Added CSS import

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API  = BASE + "/api/orders";

const NEXT = {
  PENDING:   "ACCEPTED",
  ACCEPTED:  "PREPARING",
  PREPARING: "READY",
  READY:     "SERVED",
  SERVED:    null,
};

const LABEL = {
  PENDING:"New", ACCEPTED:"Accepted", PREPARING:"Preparing", READY:"Ready", SERVED:"Served"
};

const ACTION_CFG = {
  PENDING:   { lbl:"Accept Order",  cls:"kd-accept"  },
  ACCEPTED:  { lbl:"Start Cooking", cls:"kd-cook"    },
  PREPARING: { lbl:"Mark Ready",    cls:"kd-prep"    },
  READY:     { lbl:"Mark Served",   cls:"kd-serve"   },
  SERVED:    { lbl:"Served",        cls:"kd-done"    },
};

const FLIST = [
  {id:"ALL",lbl:"All"},{id:"PENDING",lbl:"New"},{id:"ACCEPTED",lbl:"Accepted"},
  {id:"PREPARING",lbl:"Preparing"},{id:"READY",lbl:"Ready"},{id:"SERVED",lbl:"Served"},
];

function rupees(n){
  const v=Number(n);
  if(!isFinite(v))return "₹0";
  return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:0,maximumFractionDigits:0}).format(v);
}

function ago(iso){
  try{
    const m=Math.floor((Date.now()-new Date(iso))/60000);
    if(m<1)return "just now";
    if(m<60)return m+"m ago";
    return Math.floor(m/60)+"h "+m%60+"m ago";
  }catch{return "";}
}

export default function KitchenDashboard() {
  const [orders,      setOrders]     = useState([]);
  const [filter,      setFilter]     = useState("ALL");
  const [loading,     setLoading]    = useState(true);
  const [apiError,    setApiError]   = useState(null);
  const [toast,       setToast]      = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const timerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const loadOrders = useCallback(async (manual) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (Array.isArray(data.orders) ? data.orders : []);
      setOrders(list);
      setApiError(null);
    } catch (err) {
      setApiError(err.message || "Cannot reach server");
    } finally {
      setLoading(false);
      if (manual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    timerRef.current = setInterval(() => loadOrders(), 1000);
    return () => clearInterval(timerRef.current);
  }, [loadOrders]);

  const handleAction = useCallback(async (order) => {
    const next = NEXT[order.status];
    if (!next || updatingId) return;
    setUpdatingId(order._id);
    try {
      const res = await fetch(API + "/" + order._id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.message || "Update failed");
      }
      const { order: updated } = await res.json();
      setOrders(prev => prev.map(o => o._id === order._id ? updated : o));
      const msgs = { ACCEPTED:"Order accepted", PREPARING:"Cooking started", READY:"Order is ready!", SERVED:"Order served" };
      showToast(msgs[next] || next);
    } catch (err) {
      showToast("Error: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  }, [updatingId, showToast]);

  const filtered = filter === "ALL" ? orders : orders.filter(o => o.status === filter);
  const counts = {
    PENDING:   orders.filter(o => o.status === "PENDING").length,
    ACCEPTED:  orders.filter(o => o.status === "ACCEPTED").length,
    PREPARING: orders.filter(o => o.status === "PREPARING").length,
    READY:     orders.filter(o => o.status === "READY").length,
  };

  return (
    <>
      <div className="kd">
        <div className="kd-hdr">
          <div>
            <h1>Kitchen Dashboard</h1>
            <p className="kd-live">
              <span className={"kd-dot" + (apiError ? " err" : "")} />
              {apiError
                ? "Disconnected — " + apiError
                : "Live · " + orders.length + " orders · " + (counts.PENDING+counts.ACCEPTED+counts.PREPARING+counts.READY) + " active"}
            </p>
          </div>
          <button className="kd-rbtn" onClick={() => loadOrders(true)} disabled={refreshing}>
            <svg className={refreshing ? "kd-spin" : ""} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"/><path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
            </svg>
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {apiError && <div className="kd-err">⚠ {apiError} — auto-retrying every second</div>}

        <div className="kd-stats">
          {[
            {lbl:"New",       val:counts.PENDING,   c:counts.PENDING   >0?"#3b82f6":"#555"},
            {lbl:"Accepted",  val:counts.ACCEPTED,  c:counts.ACCEPTED  >0?"#a855f7":"#555"},
            {lbl:"Preparing", val:counts.PREPARING, c:counts.PREPARING >0?"#f97316":"#555"},
            {lbl:"Ready",     val:counts.READY,     c:counts.READY     >0?"#22c55e":"#555"},
            {lbl:"Total",     val:orders.length,    c:"#fff"},
          ].map(s => (
            <div key={s.lbl} className="kd-stat">
              <div className="kd-slbl">{s.lbl}</div>
              <div className="kd-snum" style={{color:s.c}}>{s.val}</div>
            </div>
          ))}
        </div>

        <div className="kd-pills">
          {FLIST.map(f => (
            <button key={f.id} className={"kd-pill"+(filter===f.id?" on":"")} onClick={()=>setFilter(f.id)}>
              {f.lbl}
              {f.id!=="ALL" && orders.filter(o=>o.status===f.id).length>0 && (
                <span style={{marginLeft:4,opacity:0.7}}>({orders.filter(o=>o.status===f.id).length})</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="kd-loading">
            <div className="kd-spinner"/>
            <p style={{color:"#555",fontSize:14}}>Connecting to server…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="kd-list">
            <div className="kd-empty">
              <div className="kd-ei">🍽</div>
              <p className="kd-eh">{orders.length===0?"No orders yet":"No matching orders"}</p>
              <p className="kd-ep">{orders.length===0?"Orders will appear here as customers place them":"Try a different filter"}</p>
            </div>
          </div>
        ) : (
          <div className="kd-list">
            {filtered.map(order => {
              const ac = ACTION_CFG[order.status] || ACTION_CFG.SERVED;
              const isTerminal = order.status === "SERVED";
              const isBusy = updatingId === order._id;
              
              // Calculate itemSub safely
              let itemSub = 0;
              if (order.items && Array.isArray(order.items)) {
                itemSub = order.items.reduce((s,i) => s + (Number(i.itemTotal) || (Number(i.price) * Number(i.quantity)) || 0), 0);
              }
              const grand = Number(order.totalAmount) || itemSub;
              
              return (
                <div key={order._id} className={"kd-card "+order.status}>
                  <div className="kd-chead">
                    <div>
                      <div className="kd-oid">{order.orderId||order._id}</div>
                      <div className="kd-meta">
                        <span>🪑 Table {order.tableNumber}</span>
                        <span>🕐 {ago(order.createdAt)}</span>
                        {order.paymentStatus && (
                          <span style={{color:order.paymentStatus==="PAID"?"#22c55e":"#ef4444"}}>
                            💳 {order.paymentStatus}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={"kd-badge "+order.status}>{LABEL[order.status]||order.status}</span>
                  </div>
                  <div className="kd-cbody">
                    <div className="kd-ilist">
                      {(order.items||[]).map((item,i)=>{
                        const line=Number(item.itemTotal)||Number(item.price)*Number(item.quantity)||0;
                        return (
                          <div key={i} className="kd-irow">
                            <div className="kd-ileft">
                              <span className="kd-iqty">×{item.quantity}</span>
                              <span className="kd-iname">{item.name}</span>
                            </div>
                            <span className="kd-iprice">{rupees(line)}</span>
                          </div>
                        );
                      })}
                    </div>
                    {order.specialInstructions && <div className="kd-note">📝 {order.specialInstructions}</div>}
                  </div>
                  <div className="kd-cfoot">
                    <div>
                      <div className="kd-tline">Items: <strong>{rupees(itemSub)}</strong></div>
                      <div className="kd-grand">{rupees(grand)}</div>
                    </div>
                    <button className={"kd-btn "+ac.cls} onClick={()=>handleAction(order)} disabled={isTerminal||isBusy}>
                      {isBusy?"Updating…":ac.lbl}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {toast && <div className="kd-toast">{toast}</div>}
      </div>
    </>
  );
}