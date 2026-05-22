# 🧠 SmartStore AI — E-Commerce Admin & AI Assistant Platform

**SmartStore AI** is a cutting-edge, full-stack **MERN** e-commerce dashboard and AI copywriter assistant, paired with a live customer storefront. Built using a sleek slate-indigo **dark glassmorphism** design, it enables store owners to manage inventory, generate high-converting AI content in one click, and view customer-facing purchases update sales dashboard analytics in real-time.

---

## 🚀 Tech Stack

| Layer | Technology | Key Highlights |
|-------|-----------|----------------|
| **Frontend** | React (Vite) + Tailwind CSS v4 + Chart.js | HSL custom palettes, glassmorphism cards, micro-animations, slide-out drawers |
| **Backend** | Node.js (Express) | Native ESM modules, native fetch on Node 22, Helmet security, rate limiting |
| **Database** | MongoDB + Mongoose | Compound indexes, complex aggregation pipelines for real-time sales reporting |
| **Auth** | JWT + bcrypt | Bearer token authentication with local storage state matching |
| **AI Engine** | Google Gemini (Google AI Studio) | Connected to `gemini-2.5-flash` with structured system instructions & JSON output modes. Fallback support for OpenAI (GPT-4o-mini) and high-fidelity local Mock Demo Mode |

---

## 📌 Interactive Core Features

### 🛍️ 1. Customer Storefront, Shopping Cart & Synced Checkout (`/shop`)
SmartStore AI features a fully functional customer-facing store page:
- **Rich AI Assets Highlight**: Showcases product detail cards heavily featuring their **Gemini-Generated Descriptions**, **glowing SEO tag pills**, and **📢 Social Admegaphones** acting as social proof.
- **Active Shopping Cart Drawer**: Slides open from the right displaying items, price totals, tax estimations, quantity adjustments (`+`/`-`), and checkout channel selectors (Online, In-Store, Marketplace).
- **Inventory Sync & Sales Aggregation**: Checkout automatically **decrements product stock levels in MongoDB** (preventing sales over stock counts) and **bulk-inserts transactions into the `Sale` schema**. Placed orders **instantly populate your sales dashboard graphs, category splits, and revenue counts in real-time!**

### ⚡ 2. Admin AI Preview & Auto-Update Panel (`/products`)
Admins no longer need to navigate away from the products table to read or update descriptions:
- **Clickable Badges**: Clicking on "✓ Generated" or "Pending" in the Products listing opens a gorgeous `AIContentPreviewModal` dialog.
- **Preview & Edit Canvas**: Displays AI Description, SEO keyword tags, and captions with a **rendered Social Media Sponsored Post Preview widget** that updates live as they type.
- **One-Click Catalog Rebuild**: A glowing **`⚡ Regenerate All AI Content`** button triggers Gemini, composition updates in the modal, and auto-saves the results directly to MongoDB in one go.

### 🧠 3. Advanced AI Content Studio (`/ai-content`)
- A full studio layout containing a product selector dropdown, individual asset generation, and bulk saving.
- Features a **`⚡ One-Click AI Catalog Update`** button shortcut.
- Includes **perfect state calibration**—when AI generates text, the UI instantly transitions to **`✓ Saved`** (since the backend automatically commits it to MongoDB), switching to **`Draft (Unsaved)`** only when you type manual alterations.

---

## 📂 Project Structure

```
├── backend/
│   ├── config/         # Database configuration & Mongoose connections
│   ├── controllers/    # Route controllers (Auth, Products, Sales, Inventory, AI)
│   ├── middleware/     # JWT authentication & global error handlers
│   ├── models/         # Mongoose Schemas (User, Product, Sale)
│   ├── routes/         # Express endpoint routing
│   ├── services/       # AI Service (Gemini native fetch service & mock fallback)
│   ├── utils/          # Seeding script with 90-day transactions generator
│   └── server.js       # App entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Visual layout, Sidebar, and Chart.js wrappers
│   │   ├── context/    # React Auth context
│   │   ├── pages/      # Views (Login, Dashboard, Products, Shop, AI Studio, Inventory)
│   │   ├── utils/      # Axios API custom interceptors
│   │   └── App.jsx     # Route provider
```

---

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js** v20 or newer (v22+ recommended for native fetch execution)
- **MongoDB** (local community instance or Atlas connection string)
- **Google AI Studio Key** (Gemini) or **OpenAI API Key** (optional, Mock Mode triggers automatically if not provided)

### 1. Backend Configuration
Navigate to the backend, install modules, and set up your environment variables:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/smartstore
JWT_SECRET=your-super-long-custom-jwt-secret-string
JWT_EXPIRE=7d
GEMINI_API_KEY=AIzaSy...   # Google AI Studio API Key (recommended)
OPENAI_API_KEY=           # Optional OpenAI Key (Gemini is prioritized)
NODE_ENV=development
```

### 2. Seeding Demo Analytics
Instantly seed the database with a test admin account, 25 catalog products, and **~500 sales transactions spanning the last 90 days** (creating immediate trending charts):
```bash
npm run seed
```

### 3. Start Servers
Launch the backend developer nodemon server:
```bash
npm run dev
```

In a new terminal tab, navigate to the frontend directory, install dependencies, and start the Vite dev server:
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🔐 Credentials & testing

Open `http://localhost:5173` on your browser to access the dashboard.
- **Login Credentials:** 
  - **Email:** `admin@smartstore.com`
  - **Password:** `password123`

### 🧪 Steps to Test the Storefront-to-Dashboard Sync
1. Navigate to the **"Customer Store"** in the sidebar.
2. Note the stock level of a product (e.g. `12`). Click **Add to Cart**.
3. Open the **View Cart** drawer on the top right, select a purchase channel (e.g., *💻 Online Storefront*), and click **Place Order & Deduct Inventory**.
4. Confirm the success overlay displays, then click **Go to Dashboard** in the sidebar.
5. **Observe**: Total revenue, total orders, units sold, and active graphs **instantly grew to include your purchase details in real-time**!
6. Go to the **Products** list and check the stock level. It will have automatically decremented to `11`.
7. Click the `✓ Generated` badge in the products table to instantly view the AI Description and tags, or hit `⚡ Regenerate AI Content` to rewrite them!

---

## 📡 API Endpoints Reference

### 👤 Authentication
- `POST /api/auth/signup` — Register a new e-commerce admin.
- `POST /api/auth/login` — Login and retrieve JWT.
- `GET /api/auth/me` — Retrieve active user context.

### 📦 Product Catalog
- `GET /api/products` — Retrieve product list (search, pagination, and category filtering).
- `GET /api/products/:id` — Retrieve details for a single product.
- `POST /api/products` — Create a product.
- `PUT /api/products/:id` — Update standard details or manual AI fields.
- `DELETE /api/products/:id` — Delete a product.

### 🤖 AI Generation Deck
- `POST /api/ai/generate-description` — Generate compelling description using Gemini.
- `POST /api/ai/generate-tags` — Generate 8-12 SEO keyword tags as a JSON array.
- `POST /api/ai/generate-caption` — Compose short-form social marketing copy with emojis.
- `POST /api/ai/generate-all` — Generate all 3 content assets and save them in one command.
- `GET /api/ai/suggestions` — Analyze sales trends and low-moving stocks for marketing improvements.
- `GET /api/ai/pricing/:productId` — Get a pricing markup audit based on product cost and sales velocities.

### 📈 Sales Analytics
- `POST /api/sales/order` — **[NEW]** Checkout a shopping cart order, decrease inventory stock, and save transactional receipts.
- `GET /api/sales/overview` — Fetch today/weekly/monthly revenue and aggregate units sold.
- `GET /api/sales/revenue-chart` — Fetch chronologically ordered daily revenue for line charts.
- `GET /api/sales/top-products` — Get ranking of top sellers by count and revenue.
- `GET /api/sales/by-category` — Get sales distribution across categories.
- `GET /api/sales/recent` — Fetch recent transactions list.

### 🚨 Inventory & Alerts
- `GET /api/inventory/alerts` — List low-stock products.
- `GET /api/inventory/summary` — Fetch catalog stock aggregates.

---

## 🧰 Skills Covered

- **Full MERN Stack integration** with React (Vite proxy) & Mongoose.
- **Google AI Studio & Gemini API integration** (System instructions, JSON modes).
- **Prompt Engineering** for clean, structured data extraction.
- **MongoDB Aggregation pipelines** (e.g. `$group`, `$lookup`, `$sort` joins).
- **Inventory tracking & transactional concurrency checks** in Node.js.
- **State alignment & baseline tracking** in SPA UI states.
- **Responsive dark theme & CSS layout architecture** utilizing HSL variables and backdrop-blurs.
