# 🚀 Render Free Deployment Guide

## Completely Free - No Credit Card Required!

This guide shows you how to deploy CraveCart to Render.com's free tier.

## ✨ What's Included (FREE)

- ✅ Backend API (Node.js)
- ✅ Frontend (React)
- ✅ Admin Panel (React)
- ✅ SSL certificates
- ✅ Automatic deployments from GitHub

## 📋 Prerequisites

1. **GitHub Account** - Your code repository
2. **Render Account** - Sign up at [render.com](https://render.com) (free, no CC)
3. **MongoDB Atlas** - Free database at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)

---

## Step 1: Set Up MongoDB Atlas (Free Forever)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up (no credit card needed)
3. Create a **FREE cluster** (M0 Sandbox - 512MB)
4. Choose **AWS** as provider
5. Select closest **region**
6. Click **Create Cluster** (takes 3-5 minutes)

### Configure Network Access

1. Go to **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**

### Get Connection String

1. Go to **Database** > **Connect**
2. Choose **Connect your application**
3. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/cravecart?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your database credentials

---

## Step 2: Deploy to Render

### Option A: One-Click Deploy (Easiest)

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Go to Render Dashboard**
   - Visit [https://dashboard.render.com](https://dashboard.render.com)
   - Click **New** > **Blueprint**

3. **Connect GitHub Repository**
   - Connect your GitHub account
   - Select `fullstack-with-PALAK/Food-Delivery-App` repository
   - Render will detect `render.yaml`

4. **Set Environment Variables**
   
   For **Backend**:
   ```
   MONGODB_URI = <your-mongodb-atlas-connection-string>
   JWT_SECRET = <any-random-32-character-string>
   STRIPE_SECRET_KEY = <your-stripe-key-or-leave-empty>
   CORS_ORIGIN = https://cravecart-frontend.onrender.com
   ```

   For **Frontend**:
   ```
   VITE_API_BASE_URL = https://cravecart-backend.onrender.com
   ```

   For **Admin**:
   ```
   VITE_API_BASE_URL = https://cravecart-backend.onrender.com
   ```

5. **Click Apply** - Render will deploy all 3 services!

### Option B: Manual Deploy

#### Deploy Backend

1. Go to Render Dashboard
2. Click **New** > **Web Service**
3. Connect GitHub repository
4. Configure:
   - **Name**: cravecart-backend
   - **Region**: Oregon (US West) or closest
   - **Branch**: main
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables (same as above)
6. Click **Create Web Service**

#### Deploy Frontend

1. Click **New** > **Static Site**
2. Connect GitHub repository
3. Configure:
   - **Name**: cravecart-frontend
   - **Branch**: main
   - **Root Directory**: frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: dist

4. Add Environment Variable:
   ```
   VITE_API_BASE_URL = https://cravecart-backend.onrender.com
   ```

5. Click **Create Static Site**

#### Deploy Admin Panel

Repeat frontend steps but:
- **Name**: cravecart-admin
- **Root Directory**: admin

---

## Step 3: Configure CORS

After deployment, update backend CORS:

1. Go to Backend service on Render
2. Add/Update environment variable:
   ```
   CORS_ORIGIN = https://cravecart-frontend.onrender.com,https://cravecart-admin.onrender.com
   ```

3. Save changes (auto-redeploys)

---

## Step 4: Update Frontend API URLs

If your URLs are different, update:

**Frontend** environment variable:
```
VITE_API_BASE_URL = https://your-backend-url.onrender.com
```

**Admin** environment variable:
```
VITE_API_BASE_URL = https://your-backend-url.onrender.com
```

---

## 🎉 Your URLs

After deployment, you'll have:

```
Backend:  https://cravecart-backend.onrender.com
Frontend: https://cravecart-frontend.onrender.com
Admin:    https://cravecart-admin.onrender.com
```

---

## ⚠️ Free Tier Limitations

### Backend (Free Web Service)
- ✅ 512 MB RAM
- ✅ Shared CPU
- ⚠️ **Spins down after 15 minutes of inactivity**
- ⚠️ First request after sleep takes 30-50 seconds
- ✅ 750 hours/month (enough for one service)

### Frontend & Admin (Free Static Sites)
- ✅ Unlimited bandwidth
- ✅ Instant load times
- ✅ Always active (no spin-down)
- ✅ Custom domains supported

### MongoDB Atlas (Free Cluster)
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Forever free
- ⚠️ Limited to 1 free cluster per account

---

## 🔧 Troubleshooting

### Backend Not Starting?
- Check build logs in Render dashboard
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### Frontend Can't Connect to Backend?
- Verify `VITE_API_BASE_URL` is correct
- Check CORS settings in backend
- Wait 30-50 seconds if backend was sleeping

### Images Not Loading?
- Check if backend has write permissions
- Consider using Cloudinary for image storage (free tier)

### First Load is Slow?
- This is normal! Free tier spins down after inactivity
- Backend takes 30-50 seconds to wake up
- Frontend loads instantly (static)

---

## 🚀 Keeping Backend Active (Optional)

To prevent backend from sleeping:

1. **Use UptimeRobot** (free)
   - Sign up at [uptimerobot.com](https://uptimerobot.com)
   - Add your backend URL
   - Set check interval to 14 minutes
   - Backend stays awake 24/7!

---

## 📦 Automatic Deployments

✅ Render automatically deploys when you push to GitHub!

```bash
git add .
git commit -m "your changes"
git push origin main
```

Render detects the push and deploys automatically.

---

## 💡 Pro Tips

1. **Custom Domain**: Add free custom domain in Render settings
2. **Environment Branching**: Create separate services for dev/staging
3. **View Logs**: Click on service > Logs to see real-time logs
4. **Health Checks**: Add `/api/health` endpoint for monitoring

---

## 📊 Monitor Your App

1. **Render Dashboard**: View logs, metrics, deployment history
2. **MongoDB Atlas**: Monitor database usage, queries
3. **UptimeRobot**: Track uptime and response times

---

## 🆘 Need Help?

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [GitHub Issues](https://github.com/fullstack-with-PALAK/Food-Delivery-App/issues)

---

## ✅ Checklist

Before deploying, ensure:

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Connection string obtained
- [ ] Render account created (no CC required)
- [ ] Environment variables ready
- [ ] CORS origins configured

---

**Deployment Time**: ~10-15 minutes  
**Cost**: $0.00 (completely free!)  
**Credit Card**: Not required

Happy deploying! 🚀
