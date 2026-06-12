# متجري الرقمي — Digital Store

A full React + Firebase web store for digital products (الجزائر), with Baridi Mob and Flexi payment support.

## Project Structure

```
store-project/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx / .css
│   │   ├── ProductCard.jsx / .css
│   │   ├── CartSidebar.jsx / .css
│   │   ├── OrderSuccessModal.jsx / .css
│   │   ├── AdminLogin.jsx
│   │   └── DeliveryModal.jsx
│   ├── context/
│   │   ├── CartContext.jsx
│   │   └── ToastContext.jsx
│   ├── pages/
│   │   ├── StorePage.jsx / .css
│   │   ├── TrackingPage.jsx / .css
│   │   └── AdminPage.jsx / .css
│   ├── services/
│   │   └── firebase.js        ← all Firestore/Auth calls
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env                        ← your secrets (NOT committed)
├── .env.example                ← template to share
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set:
- `VITE_FIREBASE_*` — your Firebase project credentials (from Firebase Console → Project Settings → Your Apps)
- `VITE_STORE_NAME` — your store display name
- `VITE_ADMIN_EMAIL` / `VITE_ADMIN_PASSWORD` — your Firebase Auth user credentials
- `VITE_BARIDI_ACCOUNT` — your Baridi Mob account number
- `VITE_BARIDI_PHONE` — your contact phone
- `VITE_CONTACT_EMAIL` — email where customers send payment receipts

### 3. Firebase setup

In your Firebase Console:
- Enable **Firestore** — create two collections: `products` and `orders`
- Enable **Authentication** → Email/Password, then create one admin user
- Set Firestore security rules (see below)

Recommended Firestore rules:
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public can read products and submit orders
    match /products/{id} {
      allow read: true;
      allow write: if request.auth != null;
    }
    match /orders/{id} {
      allow create: true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

### 4. Run locally
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
```

Deploy the `dist/` folder to any static host (Netlify, Vercel, Firebase Hosting, etc.).

---

## Features

- 🛒 Product catalog with category filtering
- 🛍️ Cart sidebar with quantity management
- 💳 Baridi Mob + Flexi payment (with +20% fee)
- 📦 Real-time order tracking by order ID
- ⚙️ Admin panel: manage orders, products, and view stats
- 📬 Delivery modal to send digital product content to customer
- 🔐 Firebase Auth for admin access
- 💾 Buyer info saved to localStorage for repeat purchases
