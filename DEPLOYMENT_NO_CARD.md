# CraveCart Deployment Guide - Completely FREE (No Card Ever!)

Your Food Delivery App is ready to deploy to the world, completely free forever.

## What You're Deploying

✅ **Frontend** - React customer app (Netlify)
✅ **Admin** - React management dashboard (Netlify)  
✅ **Backend API** - Node.js/Express API (Glitch)
✅ **Database** - Supabase PostgreSQL (already set up!)

**Total Cost: $0/month** (never charged, no card required)

---

## Quick Start (10 minutes)

### 1️⃣ Frontend + Admin to Netlify (5 minutes)

Follow: [NETLIFY_DEPLOY.md](NETLIFY_DEPLOY.md)

**Summary:**
- Go to netlify.com → Sign up with GitHub (no card needed)
- Build: `npm run build` in frontend and admin folders
- Deploy: Drag & drop the `dist` folders
- Get URLs: `https://cravecart-frontend.netlify.app` and admin equivalent

### 2️⃣ Backend to Glitch (5 minutes)

Follow: [GLITCH_DEPLOY.md](GLITCH_DEPLOY.md)

**Summary:**
- Go to glitch.com → Sign in with GitHub (no card needed)
- Import: Your GitHub repo
- Configure: Add `.env` with Supabase credentials (already in this repo)
- Deploy: Automatic! Get URL: `https://cravecart-backend.glitch.me`

---

## After Deployment

### Update API URLs

Your frontend and admin need to know the backend API URL.

Once Glitch gives you `https://cravecart-backend.glitch.me`, update:

**In frontend/.env or environment config:**
```
VITE_API_BASE_URL=https://cravecart-backend.glitch.me/api
```

**In admin/.env:**
```
VITE_API_BASE_URL=https://cravecart-backend.glitch.me/api
```

Then rebuild and redeploy to Netlify.

### Database is Already Ready

✅ Supabase database: Already created with 8 tables
✅ Connection: Configured in backend
✅ Credentials: In `backend/.env.local` (Glitch will use these)

---

## Testing Your App

Once deployed, test it:

1. **Frontend**: https://cravecart-frontend.netlify.app
   - Register a new user
   - Browse food items
   - Add to cart
   - Proceed to checkout

2. **Admin**: https://cravecart-admin.netlify.app
   - Login with admin credentials (set up own)
   - Manage food items
   - View orders

3. **Backend API**: https://cravecart-backend.glitch.me/api
   - Test endpoints with Postman or curl

---

## Troubleshooting

### "API not working on Netlify"
- Check CORS settings in backend
- Verify backend URL is correct in frontend `.env`
- Rebuild frontend and redeploy

### "Glitch backend fell asleep"
- Glitch sleeps after 5 min inactivity
- Use [UptimeRobot](https://uptimerobot.com) (free) to ping it every 5 minutes
- This keeps it awake 24/7

### "Database connection error"
- Verify `.env` variables in Glitch match your Supabase credentials
- Check Supabase project is active
- Run the schema.sql in Supabase again if needed

---

## Permanent Solution (Optional Upgrade)

If you want backend to never sleep (after you're happy with free version):

- **Fly.io** offers $5/month for always-on backend (still very cheap)
- Or stick with Glitch + UptimeRobot (completely free)

---

## Architecture Summary

```
Users
  ├─ Frontend App (Netlify)
  │  ├─ Browse food
  │  ├─ Manage cart
  │  └─ Place orders
  │
  ├─ Admin Panel (Netlify)
  │  ├─ Manage food items
  │  ├─ View orders
  │  └─ View users
  │
  └─ Backend API (Glitch)
     ├─ Authentication (JWT)
     ├─ Food management
     ├─ Cart operations
     ├─ Order processing
     └─ Stripe payments
          │
          └─ Database (Supabase PostgreSQL)
             ├─ users table
             ├─ foods table
             ├─ cart_items table
             ├─ orders table
             └─ 4 more tables
```

---

## Cost Breakdown

| Service | Tier | Cost | Card Required |
|---------|------|------|---------------|
| Netlify | Free | $0 | ❌ No |
| Glitch | Free | $0 | ❌ No |
| Supabase | Free | $0 | ❌ No |
| **TOTAL** | | **$0/month** | **❌ Never** |

**Your app is completely free forever. No card has ever been needed or will be needed.**

---

## Next Steps

1. Deploy frontend to Netlify (5 min)
2. Deploy backend to Glitch (5 min)
3. Test your live app
4. Share with the world!

Questions? Check the individual deployment guides above.

Good luck! 🚀
