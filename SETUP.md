# CraveCart - Development Setup Guide

This guide will help you set up the CraveCart food delivery platform locally for development.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local or MongoDB Atlas account
- **Git**: Latest version

## Project Structure

```
CraveCart/
├── backend/          # Express.js API server
├── frontend/         # React.js customer application
├── admin/            # React.js admin dashboard
└── README.md         # Main documentation
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/fullstack-with-PALAK/Food-Delivery-App.git
cd Food-Delivery-App
```

### 2. Backend Setup

```bash
cd backend

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

**Backend runs on:** `http://localhost:4000`

#### Environment Variables (Backend)

Create a `.env` file in the `backend` folder:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cravecart

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Stripe Payment
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Cloudinary (Image Upload)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Origin
CORS_ORIGIN=http://localhost:5173

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### 3. Frontend Setup

```bash
cd frontend

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

#### Environment Variables (Frontend)

Create a `.env` file in the `frontend` folder:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_API_TIMEOUT=10000
VITE_ENV=development
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_CLOUDINARY_NAME=your_cloudinary_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Feature Flags
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_REVIEWS=true
VITE_ENABLE_WISHLIST=true
VITE_ENABLE_PROMO_CODES=true

VITE_SESSION_TIMEOUT=3600000
```

### 4. Admin Dashboard Setup

```bash
cd admin

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

**Admin runs on:** `http://localhost:5174` (or next available port)

#### Environment Variables (Admin)

Create a `.env` file in the `admin` folder:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_API_TIMEOUT=10000
VITE_ENV=development
VITE_CLOUDINARY_NAME=your_cloudinary_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ORDER_MANAGEMENT=true
VITE_ENABLE_USER_MANAGEMENT=true

VITE_CHART_LIBRARY=recharts
```

## Database Setup

### MongoDB Connection

1. **Local MongoDB:**
   ```bash
   mongod
   ```

2. **MongoDB Atlas (Cloud):**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster
   - Get connection string
   - Replace `MONGODB_URI` in `.env`

### Initialize Sample Data (Optional)

```bash
cd backend
npm run seed  # (if seed script is available)
```

## Running All Services

### Option 1: Run Each Service in Separate Terminal

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - Admin
cd admin && npm run dev
```

### Option 2: Use Concurrently (if configured)

```bash
npm run dev:all  # (if root package.json has this script)
```

## API Documentation

### Base URL
```
http://localhost:4000/api
```

### Main Endpoints

#### User Routes
- `POST /api/user/register` - Register new user
- `POST /api/user/login` - User login
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

#### Food Routes
- `GET /api/food/list` - Get all food items
- `GET /api/food/:id` - Get food by ID
- `POST /api/food/add` - Add new food (Admin only)
- `PUT /api/food/:id` - Update food (Admin only)
- `DELETE /api/food/:id` - Delete food (Admin only)

#### Cart Routes
- `POST /api/cart/add` - Add to cart
- `POST /api/cart/remove` - Remove from cart
- `GET /api/cart` - Get cart items

#### Order Routes
- `POST /api/order/place` - Place new order
- `GET /api/order/user/:userId` - Get user orders
- `GET /api/order/:id` - Get order details
- `PUT /api/order/:id/status` - Update order status (Admin only)

## Development Tools & Scripts

### Backend Scripts
```bash
npm run dev       # Start with nodemon
npm start         # Start production server
npm test          # Run tests
```

### Frontend Scripts
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Admin Scripts
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running locally: `mongod`
- Check MONGODB_URI in .env file
- Verify network access in MongoDB Atlas if using cloud

### Port Already in Use
- Change PORT in .env (Backend default: 4000)
- Check `lsof -i :4000` (Mac/Linux) or `netstat -ano | findstr :4000` (Windows)

### CORS Errors
- Ensure CORS_ORIGIN in backend .env matches frontend URL
- Default: `http://localhost:5173`

### Missing Dependencies
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Testing

### Manual Testing
1. Register a user account
2. Browse food items
3. Add items to cart
4. Place an order
5. Track order status

### Admin Testing
1. Login with admin credentials
2. Add new food items
3. View and manage orders
4. Monitor analytics

## Build & Deployment

### Frontend Build
```bash
cd frontend
npm run build
# Output in dist/ folder
```

### Backend Build
```bash
cd backend
npm start
```

### Admin Build
```bash
cd admin
npm run build
# Output in dist/ folder
```

## Contributing

1. Create a new branch: `git checkout -b feature/new-feature`
2. Make your changes
3. Commit: `git commit -am 'Add new feature'`
4. Push: `git push origin feature/new-feature`
5. Create a Pull Request

## Support & Issues

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Check the troubleshooting section

## License

MIT License - See LICENSE file for details

---

**Last Updated:** February 2026
**Version:** 1.0.0
