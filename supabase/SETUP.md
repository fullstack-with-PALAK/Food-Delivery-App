# Supabase Setup Guide - Step by Step

## Step 1: Create Supabase Account & Project ✅
You've already done this! Your project URL is: `https://dpcpbqnkuhwseaqveooj.supabase.co`

## Step 2: Import Database Schema

The database schema must be set up before the backend can connect.

### How to Import:

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Click your project (dpcpbqnkuhwseaqveooj)

2. **Go to SQL Editor**
   - Left sidebar → SQL Editor
   - Click "New query"

3. **Copy & Paste Schema**
   - Open `supabase/schema.sql` from your project
   - Copy the ENTIRE file
   - Paste into Supabase SQL Editor
   - Click "Run" button (or Ctrl+Enter)

4. **Verify Success**
   - You should see "✓ Success" at the bottom
   - In the left sidebar under "Tables", you should see:
     - users
     - foods
     - cart_items
     - orders
     - reviews
     - wishlist
     - notifications
     - promo_codes

### Troubleshooting

**❌ Error: "Unexpected token 'CREATE'"**
- Solution: Clear the template query first, then paste

**❌ Error: "tables do not exist"**
- Solution: Run the full schema script again. Make sure you see all 8 tables created.

**❌ Tables created but no data**
- Solution: The schema includes sample foods. If empty, run this in SQL Editor:
  ```sql
  INSERT INTO foods (name, description, price, category, image) VALUES
  ('Margherita Pizza', 'Classic pizza with tomato sauce and mozzarella', 12.99, 'Pizza', 'pizza.jpg'),
  ('Caesar Salad', 'Fresh romaine lettuce with caesar dressing', 8.99, 'Salad', 'salad.jpg'),
  ('Cheeseburger', 'Juicy beef patty with cheese and vegetables', 10.99, 'Burger', 'burger.jpg'),
  ('Spaghetti Carbonara', 'Creamy pasta with bacon and parmesan', 13.99, 'Pasta', 'pasta.jpg'),
  ('Chicken Tikka', 'Spiced grilled chicken with rice', 14.99, 'Indian', 'tikka.jpg');
  ```

## Step 3: Configure Row Level Security (RLS) - Optional

For public access (demo mode):

1. **Go to Authentication → Policies** (in left sidebar)
2. For each table, click "Enable RLS" 
3. Create a policy to allow all public access:
   - Click "New Policy" → "For full customization"
   - Operation: SELECT
   - For: Using `true`
   - Click "Save"

*Note: In production, set up proper RLS policies. For development, public access is fine.*

## Step 4: Verify Connection

### Option A: Test from Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies (if not done)
npm install

# Test connection
npm run dev

# Look for: "✓ Supabase connection successful"
```

### Option B: Test from Supabase Dashboard

1. Go to **Table Editor**
2. Click **users** table
3. You should see empty table (no error)
4. Click **foods** table
5. You should see 5 sample foods

## Step 5: Create Your Admin Account (Optional)

To test admin functionality, create an admin user in Supabase:

1. Go to **SQL Editor** → **New query**
2. Run this:
   ```sql
   INSERT INTO users (name, email, password, role) VALUES
   ('Admin User', 'admin@cravecart.com', 'hashed_password_here', 'admin');
   ```

*Note: Password should be bcrypt hashed. When you register through the app, it's hashed automatically.*

## Step 6: Ready for Backend

Your database is now ready! The backend environment variables are already configured:
- ✅ SUPABASE_URL
- ✅ SUPABASE_SERVICE_KEY

Just run:
```bash
npm install  # Install @supabase/supabase-js
npm run dev
```

## Your Supabase Credentials

| Variable | Value |
|----------|-------|
| Project URL | https://dpcpbqnkuhwseaqveooj.supabase.co |
| Publishable Key | sb_publishable_TYQUFw_1ApeoOTkXIYNLaA_W85NdHFl |
| Service Role Key | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwY3BicW5rdWh3c2VhcXZlb29qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ2MzA0NywiZXhwIjoyMDg3MDM5MDQ3fQ.Pkxp13FCbMJP1-TZBhcSNH-OM3L2OyUFkVMGBK6Uqxc |

All configured in: `.env.local` and `.env.render.example`

## Next Steps

1. ✅ Import schema.sql into Supabase
2. ✅ Verify tables are created
3. ⏳ Test localhost backend: `npm run dev`
4. ⏳ Convert controllers (currently in progress)
5. ⏳ Deploy to Render

See MIGRATION_GUIDE.md for technical details on MongoDB→PostgreSQL differences.

# PostgreSQL Direct Connection (alternative)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres

# Other configs (keep existing)
NODE_ENV=production
PORT=4000
JWT_SECRET=your-jwt-secret-here
CORS_ORIGIN=https://cravecart-frontend.onrender.com,https://cravecart-admin.onrender.com
```

### Frontend (.env)

```env
VITE_API_BASE_URL=https://cravecart-backend.onrender.com
```

## Step 6: Test Connection

Run this in Supabase SQL Editor to verify:
```sql
SELECT * FROM foods LIMIT 5;
```

If you see the 5 sample foods, everything is working! ✅

## Storage Setup (for images)

1. In Supabase, go to **Storage**
2. Create bucket: **food-images**
   - **Public**: Yes
   - Click **Create bucket**

3. Upload test image:
   - Click on bucket
   - Click **Upload file**
   - Select an image
   - Click **Upload**

## Troubleshooting

### Connection Failed?
- Check database password is correct
- Verify PostgreSQL port (5432)
- Check firewall allows connections

### Schema Creation Failed?
- Copy schema.sql line by line
- Check no syntax errors
- Ensure you're using the right SQL dialect

### Can't Find Connection String?
- Go to Settings → Database
- Scroll down to "Connection string"
- Make sure you switched to Node.js tab

## Next Steps

Once Supabase is set up:
1. Backend will automatically use PostgreSQL
2. Deploy to Render (same as before)
3. Everything works exactly like before!

## Useful Links

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**Everything is free and no credit card is ever required!** 🎉
