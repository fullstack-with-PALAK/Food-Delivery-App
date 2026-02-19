# Deploy Frontend + Admin to Netlify (FREE - NO CARD)

Netlify is completely free and requires zero payment information.

## Step 1: Build Frontend and Admin Locally

```bash
cd frontend && npm run build
cd ../admin && npm run build
```

This creates `frontend/dist` and `admin/dist` folders.

## Step 2: Create Netlify Account

1. Go to **https://app.netlify.com**
2. Click **"Sign up"**
3. Choose **"GitHub"** to sign up with your GitHub account
4. Authorize Netlify to access your GitHub repos
5. **No credit card required at any point**

## Step 3: Deploy Frontend to Netlify

1. In Netlify dashboard, click **"Add new site"** → **"Deploy manually"**
2. Drag and drop the `frontend/dist` folder
3. Netlify will deploy automatically
4. You'll get a URL like: `https://cravecart-frontend.netlify.app`

## Step 4: Deploy Admin to Netlify

1. Click **"Add new site"** → **"Deploy manually"** again
2. Drag and drop the `admin/dist` folder
3. You'll get a URL like: `https://cravecart-admin.netlify.app`

## Step 5: Update Environment Variables

Both sites need to know your backend API URL. Once you deploy the backend to Glitch (see GLITCH_DEPLOY.md), you'll get a URL like `https://your-glitch-project.glitch.me`

Update your frontend and admin `vite.config.js`:
```javascript
// In both frontend/vite.config.js and admin/vite.config.js
export default {
  define: {
    'process.env.VITE_API_BASE_URL': JSON.stringify('https://your-glitch-project.glitch.me/api')
  }
}
```

Then rebuild and redeploy.

## That's it!

Your frontend and admin are now live, completely free, no card needed.
