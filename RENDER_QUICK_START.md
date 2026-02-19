# 🚀 Quick Start: Deploy to Render (5 Minutes)

## Prerequisites (Free)
- ✅ GitHub account (code already here)
- ✅ MongoDB Atlas free account (one-click, no CC)
- ✅ Render account (one-click, no CC)

---

## Step 1: Create MongoDB Atlas Database (5 mins)

1. **Visit**: https://www.mongodb.com/cloud/atlas/register
2. **Create Account** (no credit card needed)
3. **Create Free Cluster**:
   - Choose **M0 Sandbox** (forever free)
   - Select **AWS** + closest **region**
   - Click **Create** (wait 3-5 mins)

4. **Get Connection String**:
   - Go to **Database** → **Connect**
   - Select **Connect your application**
   - Copy connection string (looks like):
     ```
     mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/cravecart?retryWrites=true&w=majority
     ```

---

## Step 2: Deploy to Render (EASIEST)

### Option A: Auto-Deploy with render.yaml (Recommended)

1. **Go to**: https://dashboard.render.com/
2. **Sign Up** (free, GitHub login)
3. Click **New** → **Blueprint**
4. **Select Repository**: `fullstack-with-PALAK/Food-Delivery-App`
5. **Render will find** `render.yaml` automatically
6. **Set Environment Variables**:

   **For Backend**:
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.xxxxx.mongodb.net/cravecart?retryWrites=true&w=majority
   JWT_SECRET = GenerateARandomString32Chars!
   CORS_ORIGIN = https://cravecart-frontend.onrender.com,https://cravecart-admin.onrender.com
   ```

   **For Frontend**:
   ```
   VITE_API_BASE_URL = https://cravecart-backend.onrender.com
   ```

   **For Admin**:
   ```
   VITE_API_BASE_URL = https://cravecart-backend.onrender.com
   ```

7. Click **Deploy** ✅

**That's it!** Render will deploy all 3 services automatically.

---

### Option B: Manual Deploy (If Blueprint doesn't work)

#### Deploy Backend
1. **New** → **Web Service**
2. Connect GitHub repo
3. **Settings**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**
4. Add env vars (see above)
5. **Create Web Service**

#### Deploy Frontend
1. **New** → **Static Site**
2. Connect GitHub repo
3. **Settings**:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Add env vars (see above)
5. **Create Static Site**

#### Deploy Admin
Repeat Frontend steps but change:
- Root Directory: `admin`

---

## ✅ After Deployment

You'll get URLs like:
```
Frontend: https://cravecart-frontend.onrender.com
Backend:  https://cravecart-backend.onrender.com
Admin:    https://cravecart-admin.onrender.com
```

### Test It Works
1. Open frontend URL
2. Try to register/login
3. Test ordering flow

---

## ⚠️ Important Notes

### Backend Sleep Issue
Free tier backends sleep after 15 mins of inactivity. Fix it:

**Option 1: Keep it Awake (Recommended)**
- Go to https://uptimerobot.com (free)
- Add your backend URL
- Set check every 14 mins
- Backend stays awake 24/7!

**Option 2: Wait for Wake-up**
- First request takes 30-50 seconds
- Subsequent requests are normal speed

### MongoDB Storage
- Free tier = 512 MB
- Don't store images in MongoDB
- Use Cloudinary or similar free service

---

## 💬 Need Help?

1. Check Render logs: Service → Logs
2. Check MongoDB connection
3. Verify CORS settings
4. See RENDER_DEPLOY.md for detailed guide

---

## 🎉 You've Successfully Deployed!

**Remember**: Everything is 100% FREE with NO credit card required!

Next steps:
- Share your URL with friends
- Set up domain name (optional)
- Monitor with UptimeRobot
- Start taking orders! 🍕
