# ✅ RINL CMS Deployment Checklist

## Before You Push to GitHub
- [ ] `server/.env` is in `.gitignore` (it is - never commit secrets)
- [ ] `client/.env` is committed (it's safe - only CI=false)

## GitHub
- [ ] `git init && git add . && git commit -m "Initial commit"`
- [ ] `git remote add origin https://github.com/YOUR_USERNAME/rinl-cms.git`
- [ ] `git push -u origin main`

## Render (Backend) — render.com
- [ ] New Web Service → connect GitHub repo
- [ ] Root Directory: **blank** (deploy from root)
- [ ] Build Command: `npm install`
- [ ] Start Command: `node server.js`
- [ ] Env vars set: MONGO_URI, JWT_SECRET, CLIENT_URL, NODE_ENV=production, PORT=10000
- [ ] Deployed successfully → copy URL

## Vercel (Frontend) — vercel.com
- [ ] New Project → import GitHub repo
- [ ] Root Directory: **`client`** ← CRITICAL
- [ ] Framework: Create React App
- [ ] Build Command: `react-scripts build`
- [ ] Output: `build`
- [ ] Env var: `REACT_APP_API_URL=https://YOUR-RENDER-URL.onrender.com`
- [ ] Deployed successfully → copy URL

## After Both Are Live
- [ ] Update Render env: `CLIENT_URL=https://YOUR-VERCEL-URL.vercel.app`
- [ ] Redeploy Render service
- [ ] Test login with ADMIN001 / Admin@1234
- [ ] Test VISHWA chatbot
- [ ] Register a new user to confirm open registration works

## Troubleshooting
| Problem | Fix |
|---|---|
| `react-scripts: command not found` | Make sure Vercel Root Directory is set to `client` |
| API calls return 404 | Check `REACT_APP_API_URL` in Vercel env vars |
| CORS error in browser | Update `CLIENT_URL` in Render env to match Vercel URL |
| MongoDB connection failed | Check Atlas IP whitelist → add `0.0.0.0/0` for all IPs |
| Login fails | Check `JWT_SECRET` is set in Render env |
| Chatbot says "API unavailable" | Set `ANTHROPIC_API_KEY` in Render env (optional) |
