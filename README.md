# RINL Visakhapatnam Steel Plant — UPS Contract Management System
> Full-stack MERN application for UPS contract management, complaint tracking, and preventive maintenance at Rashtriya Ispat Nigam Limited (RINL).

---

## 🚀 Features
| Feature | Description |
|---|---|
| 🔐 **Multi-Role Auth** | Any user can register & login — Contractor, Coordinator, EIC, Admin |
| 📋 **Complaint Management** | Raise, track, resolve & approve with full audit timeline |
| 🔧 **PM Reports** | Preventive maintenance with checklists, measurements, battery data |
| ✅ **Approval Workflows** | Multi-level coordinator/EIC/admin review queue |
| 📊 **Live Dashboard** | Charts, SLA breach alerts, role-filtered stats |
| 💬 **VISHWA AI Chatbot** | Claude-powered assistant built into every page |
| 👑 **Admin Panel** | Manage all users, roles, activate/deactivate accounts |

---

## 📁 Project Structure
```
rinl-cms/
├── server.js              ← Root entry point (Render uses this)
├── routes/                ← API routes (root copies for Render)
├── models/                ← Mongoose schemas (root copies)
├── middleware/            ← JWT auth (root copies)
├── utils/                 ← Seed data
├── server/                ← Original server files (local dev)
│   ├── server.js
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── utils/
├── client/                ← React app (Vercel deploys this folder)
│   ├── .env               ← CI=false, GENERATE_SOURCEMAP=false
│   ├── vercel.json        ← SPA routing fix for Vercel
│   ├── public/images/     ← All RINL images
│   └── src/
│       ├── App.js         ← Routes
│       ├── context/       ← AuthContext + Axios
│       ├── components/    ← Sidebar, Header, Chatbot
│       └── pages/         ← All 14 pages
├── package.json           ← Root deps (server + build script)
└── README.md
```

---

## ⚙️ Local Development

### Prerequisites
- Node.js 18+
- MongoDB running locally (or Atlas URI)

### 1. Install all dependencies
```bash
# From project root
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Configure server environment
```bash
cp server/.env.example server/.env
# Edit server/.env:
MONGO_URI=mongodb://localhost:27017/rinl_cms
JWT_SECRET=any_long_random_string_here
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Run locally
```bash
# Terminal 1 — backend
cd server && node server.js

# Terminal 2 — frontend  
cd client && npm start
```
Open http://localhost:3000

---

## 🔑 Login Credentials (auto-seeded)
| Role | Employee ID | Password |
|---|---|---|
| Admin | `ADMIN001` | `Admin@1234` |
| EIC | `EIC001` | `Eic@1234` |
| Coordinator | `COORD001` | `Coord@1234` |
| Contractor | `ETL001` | `Contractor@123` |

> Any user can also **self-register** at `/register` (gets `contractor` role by default)

---

## 🌐 Deployment Guide

### STEP 1 — Push to GitHub
```bash
cd rinl-cms
git init
git add .
git commit -m "Initial commit: RINL CMS"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rinl-cms.git
git push -u origin main
```

---

### STEP 2 — Deploy Backend on Render (free)

1. Go to **https://render.com** → Sign in → **New → Web Service**
2. Connect your GitHub repo `rinl-cms`
3. Configure:
   | Setting | Value |
   |---|---|
   | **Root Directory** | *(leave blank — uses root)* |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Node Version** | `18` |

4. Add **Environment Variables** (click "Add Environment Variable"):
   ```
   MONGO_URI        = mongodb+srv://USER:PASS@cluster.mongodb.net/rinl_cms
   JWT_SECRET       = your_super_secret_random_string_here
   CLIENT_URL       = https://rinl-cms.vercel.app
   NODE_ENV         = production
   PORT             = 10000
   ANTHROPIC_API_KEY = sk-ant-... (optional, enables full AI chatbot)
   ```
5. Click **Create Web Service** — wait for deploy
6. **Copy your Render URL** → e.g. `https://rinl-cms-backend.onrender.com`

---

### STEP 3 — Deploy Frontend on Vercel

1. Go to **https://vercel.com** → New Project → Import `rinl-cms` from GitHub
2. Configure **BEFORE clicking Deploy**:
   | Setting | Value |
   |---|---|
   | **Framework Preset** | `Create React App` |
   | **Root Directory** | `client` ← ⚠️ This is critical! |
   | **Build Command** | `react-scripts build` |
   | **Output Directory** | `build` |
   | **Install Command** | `npm install` |

3. Add **Environment Variable**:
   ```
   REACT_APP_API_URL = https://rinl-cms-backend.onrender.com
   ```
   *(paste your Render URL from Step 2)*

4. Click **Deploy** ✅

---

### STEP 4 — Update Render CORS

After getting your Vercel URL (e.g. `https://rinl-cms.vercel.app`):
1. Go to Render → Your service → **Environment**
2. Update `CLIENT_URL` to your Vercel URL
3. **Redeploy** the Render service

---

## 🤖 VISHWA AI Chatbot

Works in two modes:
- **Without API key** — Smart keyword-based responses about RINL procedures
- **With Anthropic key** — Full Claude AI with RINL system context

Add to Render environment:
```
ANTHROPIC_API_KEY = sk-ant-api03-...
```
Get a key: https://console.anthropic.com

---

## 🔒 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login any user |
| POST | `/api/auth/register` | Public | Register new account |
| GET | `/api/auth/me` | JWT | Current user |
| PUT | `/api/auth/change-password` | JWT | Change password |
| GET | `/api/complaints` | JWT | List (role-filtered) |
| POST | `/api/complaints` | JWT | Create complaint |
| GET | `/api/complaints/:id` | JWT | Detail |
| PUT | `/api/complaints/:id/resolve` | JWT | Mark resolved |
| PUT | `/api/complaints/:id/approve` | EIC+ | Approve/reject |
| GET | `/api/maintenance` | JWT | List PM reports |
| POST | `/api/maintenance` | JWT | Submit PM report |
| PUT | `/api/maintenance/:id/approve` | Coord+ | Approve/reject |
| GET | `/api/dashboard` | JWT | Dashboard stats |
| GET | `/api/users` | Coord+ | All users |
| PUT | `/api/users/:id` | Admin/Self | Update user |
| POST | `/api/chatbot` | JWT | AI chat message |

---

## 🛡️ Security
- JWT authentication (24h expiry)
- bcrypt password hashing (rounds: 12)  
- Helmet HTTP headers
- Rate limiting (200 req/15 min per IP)
- Role-based route guards
- CORS whitelist with Vercel domain auto-allow

---

## 📝 Credits
Developed under RINL IT & ERP Department.  
Summer Internship Project under Mr. K.N.N.S. Yadav.  
© 2025 Rashtriya Ispat Nigam Limited — Visakhapatnam Steel Plant.
