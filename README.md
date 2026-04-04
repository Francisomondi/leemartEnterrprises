# 🛒 Leemart E-Commerce Platform

A full-stack e-commerce platform built for the Kenyan market, featuring seamless **MPESA payments**, modern UI, and a powerful admin dashboard.

🔗 **Live Site:** https://www.leemart.co.ke
💻 **Portfolio:** https://francisomondi.vercel.app

---

## 🚀 Overview

Leemart is a scalable and production-ready e-commerce application that enables users to browse products, add items to cart, and complete purchases using **MPESA STK Push**.

It includes a robust admin system for managing products, tracking orders, analyzing sales, and exporting data.

---

## ✨ Features

### 🧑‍💻 User Features

* User registration & login (JWT authentication)
* Browse products with images and pricing
* Add to cart & manage cart items
* Checkout with **delivery details**
* MPESA STK Push payment integration
* Real-time payment confirmation
* Order history tracking

---

### 🛠️ Admin Features

* Create, update, and delete products
* View all MPESA transactions
* View **successful orders with product breakdown**
* Sales analytics dashboard
* Export orders to **CSV & Excel**
* Monitor payment statuses

---

## 💳 Payments Integration

* Safaricom **MPESA Daraja API**
* STK Push checkout flow
* Automatic payment confirmation via callback
* Secure order linking with payment transactions

---

## 🧱 Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Zustand (state management)
* Axios
* Framer Motion

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Payments

* MPESA Daraja API

### Deployment

* Render (Backend)
* Vercel (Frontend)

---

## 📦 Project Structure

```
/backend
  /controllers
  /models
  /routes
  /middleware
  /lib

/frontend
  /components
  /pages
  /stores
  /lib
```

---

## 🔄 Checkout Flow

1. User adds products to cart
2. User enters **delivery details**
3. Order is created (PENDING)
4. MPESA STK Push is triggered
5. User completes payment on phone
6. MPESA callback confirms transaction
7. Order is marked as **PAID**
8. Admin dashboard updates automatically

---

## 📊 Admin Insights

* Track total revenue
* View successful transactions
* Analyze sales trends
* Export data for reporting

---

## 📁 Export Functionality

Admins can export orders with:

* Customer details
* Products & quantities
* Total amount
* MPESA receipt number
* Delivery information
* Date

Formats supported:

* CSV
* Excel (.xlsx)

---

## 🔐 Security

* JWT-based authentication
* Protected admin routes
* Secure payment validation
* Input validation & error handling

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/leemart.git
cd leemart
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_uri

JWT_SECRET=your_secret

MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=your_callback_url
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
```

Run backend:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌍 Deployment

* Backend: Render
* Frontend: Vercel
* Database: MongoDB Atlas

---

## 🧠 What This Project Demonstrates

* Full-stack MERN architecture
* Real-world payment integration (MPESA)
* Secure authentication & authorization
* Admin dashboards and analytics
* Clean UI/UX with Tailwind CSS
* Scalable backend design

---

## 🔮 Future Improvements

* Order delivery tracking system
* SMS & email notifications
* Multi-vendor marketplace support
* Inventory & stock management
* Advanced analytics (charts & forecasting)

---

## 👨‍💻 Author

**Francis Omondi**

* Portfolio: https://francisomondi.vercel.app
* GitHub: https://github.com/francisomondi
* LinkedIn: https://linkedin.com/in/francis-omondi

---

## ⭐ Support

If you find this project useful, please ⭐ the repository and share!

---
