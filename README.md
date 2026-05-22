# 🧠 SmartStore AI

**AI-Powered E-Commerce Admin Dashboard**

A full-stack MERN platform where store owners manage products and AI generates descriptions, tags, and sales insights.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React (Vite) + Tailwind CSS v4 + Chart.js |
| **Backend** | Express.js + MongoDB + Mongoose |
| **Auth** | JWT + bcrypt |
| **AI** | OpenAI API (GPT-4o-mini) with Demo Mode |

## 📌 Features

- ✅ **User Authentication** — Signup/Login with JWT
- ✅ **Product Management** — Full CRUD with search, filter, pagination
- ✅ **AI Content Generation** — Product descriptions, SEO tags, marketing captions
- ✅ **Sales Dashboard** — Revenue charts, top products, category breakdown
- ✅ **AI Sales Suggestions** — Pricing recommendations, trending insights
- ✅ **Inventory Alerts** — Low stock detection with configurable thresholds
- ✅ **Demo Mode** — Works without OpenAI API key using mock AI responses

## 📂 Project Structure

```
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route handlers
│   ├── middleware/      # Auth & error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── services/       # AI service layer
│   ├── utils/          # Seed data script
│   └── server.js       # Express entry point
├── frontend/
│   └── src/
│       ├── components/ # Layout & UI components
│       ├── context/    # React Auth context
│       ├── pages/      # Page components
│       ├── utils/      # API utility
│       └── App.jsx     # Root component
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend Setup
```bash
cd backend
npm install
# Edit .env with your MongoDB URI and (optional) OpenAI API key
npm run seed   # Seeds demo data (25 products + 500 sales)
npm run dev    # Starts on port 5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev    # Starts on port 5173
```

### 3. Login
Open `http://localhost:5173` and use:
- **Email:** admin@smartstore.com
- **Password:** password123

## 🔑 Environment Variables

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartstore
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
OPENAI_API_KEY=       # Leave empty for demo mode
NODE_ENV=development
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/products` | List products |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/ai/generate-description` | AI description |
| POST | `/api/ai/generate-tags` | AI SEO tags |
| POST | `/api/ai/generate-caption` | AI caption |
| POST | `/api/ai/generate-all` | All AI content |
| GET | `/api/ai/suggestions` | AI insights |
| GET | `/api/ai/pricing/:id` | AI pricing |
| GET | `/api/sales/overview` | Sales KPIs |
| GET | `/api/sales/revenue-chart` | Revenue data |
| GET | `/api/sales/top-products` | Top sellers |
| GET | `/api/sales/by-category` | Category breakdown |
| GET | `/api/inventory/alerts` | Low stock alerts |
| GET | `/api/inventory/summary` | Inventory summary |

## 🧰 Skills Covered

| Skill | Status |
|-------|--------|
| MERN Stack | ✅ |
| JWT Authentication | ✅ |
| REST APIs | ✅ |
| MongoDB Aggregation | ✅ |
| AI API Integration | ✅ |
| Dashboard Analytics | ✅ |
| Prompt Engineering | ✅ |
| SaaS Architecture | ✅ |
