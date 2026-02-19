# Deploy Backend to Glitch (FREE - NO CARD)

Glitch is completely free and requires zero payment information. It's perfect for Node.js APIs.

## Step 1: Create Glitch Account

1. Go to **https://glitch.com**
2. Click **"Sign In"** → **"Sign in with GitHub"**
3. Authorize Glitch to access your GitHub
4. **No credit card required at any point**

## Step 2: Create New Glitch Project

1. Click **"New Project"** → **"Import from GitHub"**
2. Paste: `https://github.com/fullstack-with-PALAK/Food-Delivery-App`
3. Name it: `cravecart-backend`
4. Click **"Import"**

Glitch will automatically install dependencies from `backend/package.json`

## Step 3: Set Environment Variables

1. In Glitch, click **".env"** file (left sidebar)
2. Add these variables:

```
PORT=3000
NODE_ENV=production
SUPABASE_URL=https://dpcpbqnkuhwseaqveooj.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwY3BicW5rdWh3c2VhcXZlb29qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ2MzA0NywiZXhwIjoyMDg3MDM5MDQ3fQ.Pkxp13FCbMJP1-TZBhcSNH-OM3L2OyUFkVMGBK6Uqxc
JWT_SECRET=your_secret_key_min_32_chars_long_string_here
CORS_ORIGIN=https://cravecart-frontend.netlify.app,https://cravecart-admin.netlify.app
```

3. Save the `.env` file

## Step 4: Update Start Command

Glitch needs to know where your backend code is:

1. Click **"package.json"** 
2. Find the `"start"` script
3. Change it to: `"start": "node backend/server.js"`
4. Save

## Step 5: Wait for Server to Start

Glitch will automatically restart and start your server. You'll see logs in the Glitch console showing:
```
✓ Server running on port 3000
✓ Supabase connection successful
```

## Step 6: Get Your API URL

In Glitch, click **"Share"** (top left) → **"Live App"**

You'll get a URL like: `https://cravecart-backend.glitch.me`

Your API endpoints will be:
- `https://cravecart-backend.glitch.me/api/user/register`
- `https://cravecart-backend.glitch.me/api/food/list`
- etc.

## Step 7: Update Frontend URLs

Update your Netlify deployed sites to use this URL:

**In Netlify site settings:**
1. Go to your frontend site
2. Site settings → Environment
3. Add: `VITE_API_BASE_URL=https://cravecart-backend.glitch.me/api`
4. Trigger a new deploy

## Important: Keep Glitch Project Awake

Glitch puts projects to sleep after 5 minutes of inactivity. To keep it running:

**Option 1: Ping it regularly (recommended)**
- Services like UptimeRobot can ping your API every 5 minutes for free
- This keeps the server awake

**Option 2: Use Glitch's "Always On" (paid)**
- Not needed if you use UptimeRobot

For now, your app will work fine - it just wakes up when someone visits.

## That's it!

Your backend is now live, completely free, no card needed.

**Full Stack Status:**
- ✅ Frontend: https://cravecart-frontend.netlify.app
- ✅ Admin: https://cravecart-admin.netlify.app
- ✅ Backend API: https://cravecart-backend.glitch.me
- ✅ Database: Supabase (free tie)
- ✅ **Total Cost: $0/month forever**
