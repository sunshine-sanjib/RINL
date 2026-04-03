# RINL Visakhapatnam Steel Plant — UPS Contract Management System

> A full-stack MERN application for managing UPS contracts, complaints, preventive maintenance, and approvals at Rashtriya Ispat Nigam Limited (RINL), Visakhapatnam Steel Plant.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔐 **Multi-Role Auth** | Contractor, Coordinator, EIC, Admin — all can register and login |
| 📋 **Complaint Management** | Raise, assign, resolve & approve complaints with full timeline |
| 🔧 **PM Reports** | Submit preventive maintenance with checklist, measurements & battery data |
| ✅ **Approval Workflows** | Multi-level review for Coordinators and EICs |
| 📊 **Live Dashboard** | Charts, SLA breach alerts, monthly trends, role-filtered stats |
| 💬 **VISHWA AI Chatbot** | Claude-powered assistant for portal guidance |
| 👑 **Admin Panel** | Manage all users, roles, and access |
| 🎨 **RINL-Themed UI** | Dark, industrial design matching official brand identity |

---

## 📁 Project Structure

```
rinl-cms/
├── server/                  # Express + MongoDB backend
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route handlers
│   ├── middleware/          # JWT auth middleware
│   ├── utils/               # Seed data helper
│   ├── server.js            # Entry point
│   └── .env                 # Environment variables (copy from .env.example)
│
├── client/                  # React frontend
│   ├── public/
│   │   └── images/          # RINL images (logos, plant photos)
│   ├── src/
│   │   ├── components/      # Layout, Sidebar, Header, Chatbot
│   │   ├── context/         # AuthContext + Axios instance
│   │   ├── pages/           # All page components
│   │   └── App.js           # Routes
│   └── package.json
│
├── package.json             # Root scripts
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas (cloud)
- Git

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/rinl-cms.git
cd rinl-cms
npm run install-all
```

### 2. Configure Environment

```bash
cp server/.env server/.env.local
# Edit server/.env with your values:
```

```env
MONGO_URI=mongodb://localhost:27017/rinl_cms
# OR for Atlas:
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/rinl_cms

JWT_SECRET=your_super_secret_key_here_change_this
PORT=5000
CLIENT_URL=http://localhost:3000
ANTHROPIC_API_KEY=your_anthropic_api_key_here   # Optional: enables full AI chatbot
NODE_ENV=development
```

### 3. Run Development

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend  
cd client && npm start
```

Or with concurrently (from root):
```bash
npm run dev
```

Open **http://localhost:3000**

---

## 🔑 Default Login Credentials

| Role | Employee ID | Password | Access |
|---|---|---|---|
| Admin | `ADMIN001` | `Admin@1234` | Full access + user management |
| EIC | `EIC001` | `Eic@1234` | Approve complaints & PM reports |
| Coordinator | `COORD001` | `Coord@1234` | View & manage zone complaints |
| Contractor | `ETL001` | `Contractor@123` | Raise complaints & PM reports |

> ⚠️ **Any user can register** at `/register` — new accounts get `contractor` role by default. Admin promotes roles via Admin Panel.

---

## 🌐 Deployment on GitHub + Render/Railway

### Push to GitHub

```bash
git init
git add .
git commit -m "Initial RINL CMS"
git remote add origin https://github.com/YOUR_USERNAME/rinl-cms.git
git push -u origin main
```

### Deploy Backend on Render

1. Create new **Web Service** on render.com
2. Connect your GitHub repo
3. Set:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add Environment Variables from your `.env`

### Deploy Frontend on Vercel / Netlify

```bash
cd client
npm run build
# Upload `build/` folder to Netlify
# OR connect GitHub to Vercel
```

> Set `REACT_APP_API_URL` in frontend env to your Render backend URL if not using proxy.

### Full-Stack on Render (Single Service)

Change `NODE_ENV=production` in `.env`. The server already serves the React build in production:

```bash
# Build frontend first
cd client && npm run build

# Start server (serves both API + React)
cd ../server && node server.js
```

---

## 🤖 AI Chatbot (VISHWA)

The built-in VISHWA chatbot works in two modes:

1. **Without API Key** — Smart keyword-based fallback responses about RINL procedures
2. **With Anthropic API Key** — Full Claude AI with RINL context and system prompt

Add your key to `server/.env`:
```env
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at: https://console.anthropic.com

---

## 📊 MongoDB Collections

| Collection | Purpose |
|---|---|
| `users` | All registered users with roles |
| `complaints` | Complaint tickets with timeline |
| `maintenances` | PM reports with measurements |
| `announcements` | System alerts and notices |

---

## 🔒 API Endpoints

### Auth
- `POST /api/auth/login` — Login (any registered user)
- `POST /api/auth/register` — Register new account
- `GET /api/auth/me` — Get current user
- `PUT /api/auth/change-password` — Change password

### Complaints
- `GET /api/complaints` — List (role-filtered)
- `POST /api/complaints` — Create
- `GET /api/complaints/:id` — Detail
- `PUT /api/complaints/:id/resolve` — Mark resolved
- `PUT /api/complaints/:id/approve` — EIC approve/reject
- `GET /api/complaints/stats/summary` — Stats

### Maintenance
- `GET /api/maintenance` — List
- `POST /api/maintenance` — Submit PM report
- `GET /api/maintenance/:id` — Detail
- `PUT /api/maintenance/:id/approve` — Approve/reject

### Dashboard
- `GET /api/dashboard` — All stats, trends, recent items

### Users (Admin)
- `GET /api/users` — All users
- `PUT /api/users/:id` — Update user/role
- `DELETE /api/users/:id` — Deactivate

---

## 🛡️ Security

- JWT authentication (24h expiry)
- bcrypt password hashing (salt rounds: 12)
- Helmet HTTP security headers
- Rate limiting (200 req/15 min)
- Role-based route protection
- Login history tracking

---

## 📝 License

Developed under RINL IT & ERP Department — Internal Use.  
Summer Internship Project under Mr. K.N.N.S. Yadav.

© 2025 Rashtriya Ispat Nigam Limited — Visakhapatnam Steel Plant.
