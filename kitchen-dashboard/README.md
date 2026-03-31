# 🍽️ DineQR — QR-Based Restaurant Ordering System

**DineQR** is a full-stack web application that allows customers to scan a QR code, browse a restaurant menu, place orders, and track order status in real-time. The kitchen and admin can manage orders seamlessly, ensuring smooth restaurant operations.

---

## 🚀 Features

### 👤 Customer Side

* Scan QR → Redirect to login/register
* Browse menu items with images and descriptions
* Add items to cart
* Checkout with customer details & payment method
* Place order
* Track order status in real-time (PENDING → PREPARING → READY → DELIVERED)

### 👨‍🍳 Kitchen Dashboard

* View incoming orders in real-time
* Accept → Prepare → Mark Ready → Deliver
* Live order updates with status badges
* Cross-tab sync using localStorage

### 🧑‍💼 Admin Panel

* Monitor all orders
* Manage restaurant activity
* Track order flow between customer & kitchen

---

## 🧱 Tech Stack

### Frontend

* **Framework & Library:** React.js (Functional Components + Hooks)
* **Routing:** React Router DOM
* **State Management:** Context API for Auth, Cart, and Orders
* **Styling:** Modular CSS + globals.css
* **Forms & Validation:** HTML5 forms with custom validation
* **Build Tool:** Create React App (CRA)
* **Browser Storage:** localStorage for temporary state sync

### Backend

* **Runtime & Framework:** Node.js + Express.js
* **Database:** MongoDB (Mongoose ORM)
* **REST APIs:** Orders, Menu, Users
* **Security:** Environment variables via `.env`
* **Logging:** console (future enhancement: Morgan/Winston)

### Dev Tools & Utilities

* **Version Control:** Git & GitHub
* **Package Management:** npm
* **Deployment:** Render (Static Frontend + Node Backend)
* **Testing:** Jest + React Testing Library
* **Environment Management:** `.env` files

### Future / Optional Enhancements

* Realtime updates via WebSockets (Socket.IO)
* JWT Authentication
* Payment Integration (Razorpay / Stripe)
* Analytics & Monitoring via Admin Dashboard

---

## 📁 Project Structure

```text
QR Ordering Restaurant/
│
├── kitchen-dashboard/                  # Frontend (React)
│   ├── public/
│   │   ├── images/
│   │   ├── robots.txt
│   │   └── _redirects
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   └── README.md
│
├── qr-restaurant-ordering/
│   └── backend/
│       ├── src/
│       │   ├── controllers/
│       │   ├── models/
│       │   ├── routes/
│       │   ├── services/
│       │   └── index.js
│       ├── .env
│       ├── package.json
│       └── seed.js
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd "QR Ordering Restaurant"
```

### 2️⃣ Backend Setup

```bash
cd qr-restaurant-ordering/backend
npm install
```

Create `.env`:

```text
PORT=5000
MONGO_URI=<your_mongodb_connection_string>
```

Run backend:

```bash
npm start
```

### 3️⃣ Frontend Setup

```bash
cd ../../kitchen-dashboard
npm install
npm start
```

---

## 🌐 Live Demo & QR Code

Scan the QR code below or click the link to open the app:

[Open DineQR Live](https://kitchen-dashboard-frontend.onrender.com)

![DineQR QR Code](./public/images/qr-code.png)

*Replace `dineqr-qr.png` with your actual QR code file in `public/images/`.*

---

## 🌐 API Endpoints

### Orders

* `POST /api/orders` → Create order
* `GET /api/orders` → Fetch all orders
* `PATCH /api/orders/:id` → Update order status

### Menu

* `GET /api/menu` → Fetch menu items

---

## 🔄 Order Flow

1. User logs in
2. Adds items to cart
3. Proceeds to checkout
4. Places order
5. Order stored in database
6. Kitchen dashboard receives order
7. Status updated: `PENDING → PREPARING → READY → DELIVERED`
8. Customer sees live updates

---

## 🔐 Future Improvements

* JWT Authentication
* Real-time updates using WebSockets (Socket.IO)
* Online payment integration (Razorpay / Stripe)
* Multi-restaurant support
* Admin analytics dashboard

---

## 🎨 UI Design

* Dark theme
* Gold accent (#c9922a)
* Minimal and modern layout

---

## 🤝 Contribution

Fork the repository and submit pull requests.

---

## 📄 License

For educational and demonstration purposes.

---

## 👨‍💻 Author

Developed by Venkatesh Bharanikapula

---

