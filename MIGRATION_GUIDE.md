# MongoDB to Supabase PostgreSQL Migration Guide

## Migration Status

### ✅ Completed
- [x] Supabase project created and configured
- [x] PostgreSQL schema designed (8 tables)
- [x] Supabase credentials configured in `.env.local` and `.env.render.example`
- [x] Supabase client initialized (`config/supabase.js`)
- [x] Database connection tested
- [x] `package.json` updated: mongoose removed, @supabase/supabase-js added
- [x] Query helpers created (`config/supabaseHelpers.js`)

### 🔄 In Progress (Controllers)
- [ ] User Controller (authentication, profile)
- [ ] Food Controller (CRUD operations)
- [ ] Cart Controller (cart operations)
- [ ] Order Controller (order management)

### ⏳ To Do
- [ ] Run schema import in Supabase
- [ ] Test all endpoints
- [ ] Deploy to Render

## Key Differences: MongoDB → Supabase PostgreSQL

### 1. **ID Structure**
```javascript
// MongoDB
const userId = user._id.toString();

// Supabase PostgreSQL (UUID)
const userId = user.id; // Already a string UUID
```

### 2. **Finding Records**
```javascript
// MongoDB
const user = await userModel.findOne({ email });
const user = await userModel.findById(userId);

// Supabase
const { data: user, error } = await userQuery.findByEmail(email);
const { data: user, error } = await userQuery.findById(userId);
```

### 3. **Inserting Records**
```javascript
// MongoDB
const newUser = new userModel({ name, email, password });
await newUser.save();

// Supabase
const { data: newUser, error } = await userQuery.create({
  name,
  email,
  password,
  role: 'user',
  created_at: new Date(),
});
```

### 4. **Updating Records**
```javascript
// MongoDB
user.updatedAt = new Date();
await user.save();

// Supabase
const { data, error } = await userQuery.update(userId, {
  updated_at: new Date(),
});
```

### 5. **Deleting Records**
```javascript
// MongoDB
await userModel.deleteOne({ _id: userId });

// Supabase
const { error } = await supabase.from('users').delete().eq('id', userId);
```

### 6. **Pagination**
```javascript
// MongoDB
const skip = (page - 1) * limit;
const foods = await foodModel.find().skip(skip).limit(limit);

// Supabase
const offset = (page - 1) * limit;
const { data: foods } = await foodQuery.paginated(page, limit, filters);
```

### 7. **Filtering**
```javascript
// MongoDB
const foods = await foodModel.find({
  $or: [
    { name: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
  ],
});

// Supabase (using ilike for case-insensitive)
const { data: foods } = await foodQuery.findAll({
  search: 'pizza',
});
```

### 8. **Arrays & Objects**
```javascript
// MongoDB (cartData as nested object)
user.cartData = { foodId: quantity };
await user.save();

// Supabase (separate cart_items table)
await cartQuery.addItem(userId, foodId, quantity);
```

## Field Name Mappings

| MongoDB | PostgreSQL |
|---------|-----------|
| _id | id (UUID, auto-generated) |
| createdAt | created_at |
| updatedAt | updated_at |
| cartData | cart_items table (JOIN) |
| role | role |
| email | email |

## Table Structure

### users
- id (UUID pk)
- name (text)
- email (text unique)
- password (text)
- phone (text nullable)
- role (text: user/admin)
- created_at (timestamp)
- updated_at (timestamp)

### foods
- id (UUID pk)
- name (text)
- description (text)
- price (decimal)
- category (text)
- image (text nullable - URL)
- available (boolean)
- created_at (timestamp)
- updated_at (timestamp)

### cart_items
- id (UUID pk)
- user_id (UUID fk → users)
- food_id (UUID fk → foods)
- quantity (integer)
- created_at (timestamp)
- updated_at (timestamp)

### orders
- id (UUID pk)
- user_id (UUID fk → users)
- total_amount (decimal)
- status (text)
- delivery_address (text)
- payment_method (text)
- created_at (timestamp)
- updated_at (timestamp)

## Testing Your Migration

### 1. Test Supabase Connection
```bash
npm install
node -e "import('./config/db.js').then(() => process.exit(0))"
```

### 2. Run Schema Import
```
1. Login to Supabase dashboard
2. Go to SQL Editor
3. Create new query
4. Copy contents of supabase/schema.sql
5. Run the query
```

### 3. Test Individual Endpoints
```bash
# After Supabase schema is imported, run tests
npm run dev

# In another terminal, test an endpoint:
curl http://localhost:4000/api/health
```

## Common Issues & Solutions

### ❌ "relation 'users' does not exist"
**Solution:** Run the schema SQL in Supabase SQL Editor first

### ❌ "unique violation for 'users_email_key'"
**Solution:** This is good - email validation is working. Try different email.

### ❌ "invalid input syntax for type uuid"
**Solution:** Check that IDs are valid UUIDs. Frontend should never modify IDs.

### ❌ JWT token errors
**Solution:** Make sure JWT_SECRET is set in .env and is the same everywhere

## Next Steps

1. ✅ Configured environment variables
2. ⏳ **Import schema SQL into Supabase** (manual step in dashboard)
3. ⏳ Convert and test controllers one by one
4. ⏳ Deploy to Render

See SUPABASE_SETUP.md for detailed Supabase setup instructions.
