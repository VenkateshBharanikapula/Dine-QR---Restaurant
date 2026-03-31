// src/pages/AdminPage.js
//
// BUG FIXES:
// 1. DUPLICATE ITEMS — handleAddItem called setMenuItems([savedItem, ...prev])
//    AND the socket "menuUpdated" also inserted the same item.
//    Fix: track IDs just added via justAddedRef; socket skips those.
// 2. IMAGES NOT SAVING — image is base64 sent as JSON. Backend saves it fine.
//    Real issue was the socket duplicate arriving with the DB item (which has _id)
//    while the optimistic item (no _id yet) was already in state → two entries.
//    Now we only add from the backend response, never optimistically.
// 3. CATEGORIES — expanded to match all MenuPage/pre-seeded categories.
// 4. Full premium UI matching the rest of the app.

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchMenu,
  addMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
} from "../services/api";
import { useOrders } from "../context/OrderContext";
import io from "socket.io-client";
import "../styles/AdminPage.css"; // Added CSS import

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CATEGORIES = [
  "Burgers","Pizza","Snacks","Pasta","Salads","Wraps",
  "Starters","Main Course","Breads","Rice & Biryani","Desserts","Beverages","Other",
];

function resolveImg(image) {
  if (!image || image.trim() === "") return null;
  if (image.startsWith("data:"))    return image;
  if (image.startsWith("http"))     return image;
  if (image.startsWith("/images/")) return image;
  if (image.startsWith("/uploads/")) return BASE_URL + image;
  if (image.startsWith("/"))        return BASE_URL + image;
  return "/images/" + image;
}

function formatINR(n) {
  return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:0,maximumFractionDigits:0}).format(Number(n)||0);
}

function timeAgo(iso) {
  try {
    const m=Math.floor((Date.now()-new Date(iso))/60000);
    if(m<1)return"just now"; if(m<60)return m+"m ago";
    return Math.floor(m/60)+"h "+m%60+"m ago";
  }catch{return"";}
}

const STATUS_LABEL={PENDING:"New",ACCEPTED:"Accepted",PREPARING:"Preparing",READY:"Ready",SERVED:"Served"};
const NEXT_STATUS={PENDING:"ACCEPTED",ACCEPTED:"PREPARING",PREPARING:"READY",READY:"SERVED"};
const BTN_CLR={PENDING:"#3b82f6",ACCEPTED:"#a855f7",PREPARING:"#f97316",READY:"#22c55e"};
const BTN_TXT={PENDING:"Accept",ACCEPTED:"Start Cooking",PREPARING:"Mark Ready",READY:"Mark Served"};

export default function AdminPage() {
  const { orders, updateStatus } = useOrders();
  const [activeTab,    setActiveTab]    = useState("orders");
  const [orderFilter,  setOrderFilter]  = useState("ALL");
  const [toast,        setToast]        = useState(null);
  const [menuItems,    setMenuItems]    = useState([]);
  const [formName,     setFormName]     = useState("");
  const [formPrice,    setFormPrice]    = useState("");
  const [formCat,      setFormCat]      = useState("Burgers");
  const [formImage,    setFormImage]    = useState(null);
  const [formErrors,   setFormErrors]   = useState({});
  const [adding,       setAdding]       = useState(false);
  const fileRef        = useRef(null);
  // Track IDs we just submitted — prevents socket from adding them a second time
  const justAdded      = useRef(new Set());

  const showToast = useCallback((msg) => {
    setToast(msg); setTimeout(() => setToast(null), 2500);
  }, []);

  // Load menu on mount
  useEffect(() => {
    fetchMenu().then(setMenuItems).catch(() => showToast("Failed to load menu"));
  }, [showToast]);

  // Socket — only processes updates or items from OTHER clients
  useEffect(() => {
    const socket = io(BASE_URL);
    socket.on("menuUpdated", (item) => {
      setMenuItems(prev => {
        const id = item._id?.toString();
        // Skip if we just added this ourselves
        if (justAdded.current.has(id)) return prev;
        const exists = prev.find(i => i._id === item._id);
        return exists
          ? prev.map(i => i._id === item._id ? item : i)
          : [item, ...prev];
      });
    });
    return () => socket.disconnect();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAddItem = async () => {
    const errs = {};
    if (!formName.trim())                     errs.name  = "Item name is required";
    if (!formPrice || Number(formPrice) <= 0) errs.price = "Enter a valid price";
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    setAdding(true);
    try {
      const saved = await addMenuItem({
        name:      formName.trim(),
        price:     Number(formPrice),
        category:  formCat,
        image:     formImage || "",
        available: true,
      });
      // Mark this ID so the socket listener skips it
      const sid = saved._id?.toString();
      justAdded.current.add(sid);
      setTimeout(() => justAdded.current.delete(sid), 6000);
      // Add to state exactly once
      setMenuItems(prev => [saved, ...prev]);
      // Reset form
      setFormName(""); setFormPrice(""); setFormCat("Burgers"); setFormImage(null);
      if (fileRef.current) fileRef.current.value = "";
      showToast(`✓ "${saved.name}" added`);
    } catch (err) {
      showToast(err.message || "Failed to add item");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMenuItem(id);
      setMenuItems(prev => prev.filter(i => i._id !== id));
      showToast("Item removed");
    } catch (err) { showToast(err.message || "Failed to delete"); }
  };

  const handleToggle = async (id, current) => {
    try {
      const updated = await toggleMenuItemAvailability(id, !current);
      setMenuItems(prev => prev.map(i => i._id === id ? updated : i));
    } catch (err) { showToast(err.message || "Failed to update"); }
  };

  const handleAdvance = useCallback(async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    try {
      const res = await fetch(BASE_URL + "/api/orders/" + order._id, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({status: next}),
      });
      if (!res.ok) { const b = await res.json().catch(()=>({})); throw new Error(b.message); }
      updateStatus(order._id, next);
      const msgs={ACCEPTED:"Order accepted",PREPARING:"Cooking started",READY:"Order ready!",SERVED:"Order served"};
      showToast(msgs[next] || next);
    } catch(err) { showToast("Error: " + err.message); }
  }, [updateStatus, showToast]);

  const newCount     = orders.filter(o=>o.status==="PENDING").length;
  const prepCount    = orders.filter(o=>o.status==="PREPARING"||o.status==="ACCEPTED").length;
  const todayRev     = orders.reduce((s,o)=>s+(Number(o.totalAmount)||0),0);
  const menuAvail    = menuItems.filter(i=>i.available).length;
  const filteredOrders = orderFilter==="ALL" ? orders : orders.filter(o=>o.status===orderFilter);
  const ORDER_FILTERS=[
    {id:"ALL",lbl:"All"},{id:"PENDING",lbl:"New"},{id:"ACCEPTED",lbl:"Accepted"},
    {id:"PREPARING",lbl:"Preparing"},{id:"READY",lbl:"Ready"},{id:"SERVED",lbl:"Served"},
  ];

  return (
    <>
      <div className="ap">
        <div className="ap-hdr">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="ap-sub"><span className="ap-dot"/>Manage menu and monitor orders in real time</p>
          </div>
        </div>

        <div className="ap-content">
          <div className="ap-stats">
            <div className="ap-stat">
              <div className="ap-slbl">New Orders</div>
              <div className="ap-snum" style={{color:newCount>0?"#3b82f6":"#fff"}}>{newCount}</div>
              <div className="ap-ssub">Awaiting acceptance</div>
            </div>
            <div className="ap-stat">
              <div className="ap-slbl">Preparing</div>
              <div className="ap-snum" style={{color:"#f97316"}}>{prepCount}</div>
              <div className="ap-ssub">In kitchen</div>
            </div>
            <div className="ap-stat">
              <div className="ap-slbl">Today's Revenue</div>
              <div className="ap-snum" style={{fontSize:20,paddingTop:4}}>{formatINR(todayRev)}</div>
              <div className="ap-ssub">↑ Across {orders.length} order{orders.length!==1?"s":""}</div>
            </div>
            <div className="ap-stat">
              <div className="ap-slbl">Menu Items</div>
              <div className="ap-snum">{menuItems.length}</div>
              <div className="ap-ssub">{menuAvail} available</div>
            </div>
          </div>
        </div>

        <div className="ap-tabs">
          <button className={"ap-tab"+(activeTab==="orders"?" on":"")} onClick={()=>setActiveTab("orders")}>
            Live Orders{newCount>0?` (${newCount})`:""}
          </button>
          <button className={"ap-tab"+(activeTab==="menu"?" on":"")} onClick={()=>setActiveTab("menu")}>
            Menu Manager
          </button>
        </div>

        <div className="ap-content">
          {/* ── ORDERS ── */}
          {activeTab==="orders" && (
            <>
              <div className="ap-ofilters">
                {ORDER_FILTERS.map(f=>(
                  <button key={f.id} className={"ap-ofpill"+(orderFilter===f.id?" on":"")} onClick={()=>setOrderFilter(f.id)}>
                    {f.lbl}
                    {f.id!=="ALL"&&orders.filter(o=>o.status===f.id).length>0&&(
                      <span style={{marginLeft:4,opacity:0.7}}>({orders.filter(o=>o.status===f.id).length})</span>
                    )}
                  </button>
                ))}
              </div>
              {filteredOrders.length===0 ? (
                <div className="ap-empty">
                  <div className="ap-ei">📋</div>
                  <p className="ap-ep">{orders.length===0?"No orders yet — they'll appear here in real time":"No orders match this filter"}</p>
                </div>
              ) : (
                <div className="ap-orders">
                  {filteredOrders.map(order=>{
                    const next=NEXT_STATUS[order.status];
                    return (
                      <div key={order._id} className={"ap-ocard "+order.status}>
                        <div className="ap-ohead">
                          <div>
                            <div className="ap-oid">{order.orderId||order._id}</div>
                            <div className="ap-ometa">
                              <span>🪑 Table {order.tableNumber}</span>
                              {order.customer?.name&&<span>👤 {order.customer.name}</span>}
                              <span>🕐 {timeAgo(order.createdAt)}</span>
                            </div>
                          </div>
                          <span className={"ap-obadge s-"+order.status}>{STATUS_LABEL[order.status]||order.status}</span>
                        </div>
                        <div className="ap-obody">
                          {(order.items||[]).map((item,i)=>(
                            <div key={i} className="ap-oitem">
                              <span><strong>×{item.quantity}</strong> {item.name}</span>
                              <span>{formatINR(Number(item.itemTotal)||Number(item.price)*Number(item.quantity)||0)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="ap-ofoot">
                          <span className="ap-ototal">Total: <strong>{formatINR(order.totalAmount||0)}</strong></span>
                          {next ? (
                            <button className="ap-oact" style={{background:BTN_CLR[order.status]||"#555",color:order.status==="READY"?"#111":"#fff"}} onClick={()=>handleAdvance(order)}>
                              {BTN_TXT[order.status]}
                            </button>
                          ) : (
                            <button className="ap-oact" style={{background:"#1f2937",color:"#6b7280"}} disabled>Served ✓</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── MENU ── */}
          {activeTab==="menu" && (
            <>
              <div className="ap-add-card">
                <p className="ap-add-title">Add New Item</p>
                <div className="ap-form-grid">
                  <div className="ap-field">
                    <label className="ap-lbl">Item Name *</label>
                    <input className="ap-inp" placeholder="e.g. Cheese Burger" value={formName}
                      onChange={e=>{setFormName(e.target.value);setFormErrors(p=>({...p,name:undefined}));}}/>
                    {formErrors.name&&<p className="ap-ferr">⚠ {formErrors.name}</p>}
                  </div>
                  <div className="ap-field">
                    <label className="ap-lbl">Price (₹) *</label>
                    <input className="ap-inp" type="number" min="1" placeholder="e.g. 199" value={formPrice}
                      onChange={e=>{setFormPrice(e.target.value);setFormErrors(p=>({...p,price:undefined}));}}/>
                    {formErrors.price&&<p className="ap-ferr">⚠ {formErrors.price}</p>}
                  </div>
                  <div className="ap-field">
                    <label className="ap-lbl">Category</label>
                    <select className="ap-inp" value={formCat} onChange={e=>setFormCat(e.target.value)}>
                      {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="ap-field">
                    <label className="ap-lbl">Image (optional)</label>
                    <input className="ap-inp" type="file" accept="image/*" ref={fileRef} onChange={handleImageChange}/>
                  </div>
                </div>
                {formImage&&(
                  <div style={{display:"flex",alignItems:"center",gap:12,marginTop:4}}>
                    <img src={formImage} alt="preview" className="ap-preview"/>
                    <button style={{background:"none",border:"1px solid #2a2a2a",color:"#ef4444",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}
                      onClick={()=>{setFormImage(null);if(fileRef.current)fileRef.current.value="";}}>
                      Remove
                    </button>
                  </div>
                )}
                <button className="ap-add-btn" onClick={handleAddItem} disabled={adding}>
                  {adding?"Adding…":"+ Add to Menu"}
                </button>
              </div>

              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <p style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"#fff",margin:0}}>
                  Menu Items ({menuItems.length})
                </p>
              </div>

              {menuItems.length===0 ? (
                <div className="ap-empty"><div className="ap-ei">🍽</div><p className="ap-ep">No items yet — add your first dish above</p></div>
              ) : (
                <div className="ap-menu-list">
                  {menuItems.map(item=>{
                    const src=resolveImg(item.image);
                    return (
                      <div key={item._id} className="ap-menu-row">
                        {src
                          ? <img src={src} alt={item.name} className="ap-thumb" onError={e=>{e.target.style.display="none";}}/>
                          : <div className="ap-thumb">🍽</div>}
                        <div className="ap-minfo">
                          <div className="ap-mname">{item.name}</div>
                          <div className="ap-mprice">{formatINR(item.price)}</div>
                          <div className="ap-mcat">{item.category}</div>
                        </div>
                        <span className={"ap-avail "+(item.available?"y":"n")}>
                          {item.available?"● Available":"○ Sold Out"}
                        </span>
                        <div className="ap-mbtns">
                          <button className={"ap-mbtn "+(item.available?"tog-on":"tog-off")} onClick={()=>handleToggle(item._id,item.available)}>
                            {item.available?"Disable":"Enable"}
                          </button>
                          <button className="ap-mbtn ap-del" onClick={()=>handleDelete(item._id)}>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {toast&&<div className="ap-toast">✓ {toast}</div>}
    </>
  );
}