# Railway Deployment Account Update Workflow

## Purpose
Complete workflow for switching Railway accounts and redeploying the Cuemath AI Tutor Screener backend. Share this file with any coding agent to execute the account switch.

## Complete Terminal Commands Sequence

```bash
# 1. Logout from current Railway account
rm -rf ~/.railway/config.json ~/.railway/sessions
railway whoami  # Should show "Unauthorized"

# 2. Login to new Railway account
railway login  # User handles browser authorization

# 3. Verify new login
railway whoami

# 4. Deploy backend to new account
cd backend
railway init  # or 'railway link' if project exists
railway up

# 5. Set environment variables in Railway dashboard
railway open  # Opens project dashboard
# Set: GROQ_API_KEY and ALLOWED_ORIGINS

# 6. Get new backend URL
railway status | grep -o "https://.*\.railway\.app"

# 7. Update Vercel with new backend URL
cd ../frontend
vercel env add VITE_API_URL "NEW_RAILWAY_URL_HERE" production --force
vercel env add VITE_API_URL "NEW_RAILWAY_URL_HERE" preview --force
vercel --prod

# 8. Test deployment
curl NEW_RAILWAY_URL_HERE/health
```

## Environment Variables Required

**Railway (Production):**
- `GROQ_API_KEY` - Your Groq API key
- `ALLOWED_ORIGINS` - Frontend URLs: `http://localhost:5173,https://your-vercel-domain.vercel.app`

**Vercel (Frontend):**
- `VITE_API_URL` - Railway backend URL: `https://your-railway-domain.railway.app`

## Key Files
- `backend/main.py` - FastAPI entry point
- `backend/railway.toml` - Railway configuration
- `backend/requirements.txt` - Python dependencies
- `frontend/.env` - Local environment variables

## Verification Commands
```bash
# Check Railway deployment
railway status
railway logs

# Check Vercel deployment  
vercel ls
vercel env ls

# Test backend health
curl https://your-railway-domain.railway.app/health

# Test CORS
curl -H "Origin: https://your-vercel-domain.vercel.app" https://your-railway-domain.railway.app/health
```

## ✅ DEPLOYMENT COMPLETED - May 13, 2026

**Railway Backend:** https://balanced-elegance-production-1698.up.railway.app  
**Vercel Frontend:** https://frontend-nine-gray-38.vercel.app  
**Railway Project:** balanced-elegance (19397610-ead2-48f2-8628-57394f2b2478)  
**New Account:** Utkarsh Sharma (utkarsh.cr@coolbootsmedia.co)  

**Environment Variables Set:**
- Railway: GROQ_API_KEY, ALLOWED_ORIGINS
- Vercel: VITE_API_URL

**Status:** ✅ All systems operational, CORS configured, deployment tested

---
**Created:** May 13, 2026  
**Last Updated:** May 13, 2026  
**Project:** Cuemath AI Tutor Screener