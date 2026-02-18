# CraveCart - Food Delivery Platform

A modern, full-stack food delivery application built with MERN (MongoDB, Express, React, Node.js). CraveCart provides a seamless experience for customers to browse, order food, and for restaurants to manage their operations.

## 🚀 Features

### Customer Features
- ✅ User authentication & registration with JWT
- ✅ Browse food items by category
- ✅ Advanced search & filtering
- ✅ Shopping cart management
- ✅ Secure payment with Stripe
- ✅ Real-time order tracking
- ✅ Order history & status updates
- ✅ User reviews & ratings
- ✅ Favorites/Wishlist system
- ✅ Promo codes & discounts
- ✅ Push notifications
- ✅ Responsive mobile-friendly design

### Admin Features
- ✅ Admin authentication & authorization
- ✅ Food item management (CRUD)
- ✅ Image upload & management
- ✅ Order management & tracking
- ✅ User management
- ✅ Analytics & insights
- ✅ Discount code management
- ✅ Real-time notifications
- ✅ Dashboard with charts & graphs

### Advanced Features
- 🎯 Real-time order notifications
- ⭐ User reviews & food ratings system
- 💝 Wishlist & favorites management
- 🎁 Promo code & discount system
- 📊 Advanced analytics for admin
- 📍 Order tracking with updates
- 🔐 Secure authentication and authorization
- 🚀 Scalable architecture

## 📋 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Stripe.js** - Payment integration
- **Date-fns** - Date utilities

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload
- **Stripe** - Payment processing

### Admin Dashboard
- **React 18** - UI library
- **Recharts** - Charts & analytics
- **Axios** - API calls
- **Vite** - Build tool

## 📁 Project Structure

```
CraveCart/
├── backend/                  # Express.js API
│   ├── config/              # Configuration files
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── controllers/          # Route handlers
│   ├── middleware/          # Express middleware
│   ├── uploads/             # Uploaded images
│   ├── server.js            # Entry point
│   └── package.json         # Dependencies
│
├── frontend/                # React customer app
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Context API
│   │   ├── assets/          # Images, icons
│   │   ├── App.jsx          # Main app
│   │   └── main.jsx         # Entry point
│   ├── index.html           # HTML template
│   ├── vite.config.js       # Vite config
│   └── package.json         # Dependencies
│
├── admin/                   # React admin dashboard
│   ├── src/
│   │   ├── components/      # Admin components
│   │   ├── pages/           # Admin pages
│   │   ├── context/         # Context API
│   │   ├── App.jsx          # Admin app
│   │   └── main.jsx         # Entry point
│   ├── index.html           # HTML template
│   ├── vite.config.js       # Vite config
│   └── package.json         # Dependencies
│
├── README.md                # This file
├── SETUP.md                 # Detailed setup guide
└── .gitignore              # Git ignore rules
```

## 🔧 Installation & Setup

### Quick Start

1. **Clone Repository**
   ```bash
   git clone https://github.com/fullstack-with-PALAK/Food-Delivery-App.git
   cd Food-Delivery-App
   ```

2. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run dev
   ```

3. **Frontend Setup** (new terminal)
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```

4. **Admin Setup** (new terminal)
   ```bash
   cd admin
   cp .env.example .env
   npm install
   npm run dev
   ```

### Detailed Setup

See [SETUP.md](./SETUP.md) for comprehensive setup instructions.

## 🌐 API Endpoints

### User Routes
- `POST /api/user/register` - Register new user
- `POST /api/user/login` - User login
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

### Food Routes
- `GET /api/food/list` - Get all foods (with filtering)
- `GET /api/food/:id` - Get food details
- `POST /api/food/add` - Add new food (Admin)
- `PUT /api/food/:id` - Update food (Admin)
- `DELETE /api/food/:id` - Delete food (Admin)

### Order Routes
- `POST /api/order/place` - Place order
- `GET /api/order/user/:id` - Get user orders
- `PUT /api/order/:id/status` - Update status (Admin)
- `GET /api/order/track/:id` - Track order

### Review Routes
- `POST /api/review/add` - Add review
- `GET /api/review/food/:id` - Get food reviews

### Promo Routes
- `POST /api/promo/validate` - Validate promo code
- `GET /api/promo/active` - Get active promos

## 🔐 Authentication

- JWT-based authentication
- Secure password hashing with Bcrypt
- Role-based access control (User/Admin)
- Token expiration & refresh

## 💳 Payment Integration

- **Stripe**: Secure payment processing
- Payment webhooks for order confirmation
- Order status updates on payment

## 📸 Image Management

- **Cloudinary**: Cloud-based image storage
- Product image uploads
- User profile images
- Review images

## 📊 Monitoring & Analytics

- Order analytics
- Revenue tracking
- User engagement metrics
- Food popularity charts
- Daily/Monthly reports

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration & login
- [ ] Browse food items
- [ ] Search & filter foods
- [ ] Add items to cart
- [ ] Update cart quantities
- [ ] Apply promo codes
- [ ] Place order with payment
- [ ] Track order status
- [ ] Submit review & rating
- [ ] Admin login & food management
- [ ] Admin order management

## 📝 Environment Variables

See `.env.example` files in each folder for required environment variables.

Key variables:
- `MONGODB_URI` - Database connection
- `JWT_SECRET` - JWT signing key
- `STRIPE_SECRET_KEY` - Stripe API key
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CORS_ORIGIN` - Frontend URL

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Check MONGODB_URI in .env and MongoDB server |
| Port already in use | Change PORT in backend .env |
| CORS errors | Ensure CORS_ORIGIN matches frontend URL |
| Image upload fails | Check Cloudinary credentials |
| Payment fails | Verify Stripe keys are correct |

See [SETUP.md](./SETUP.md) for detailed troubleshooting.

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Detailed installation
- [API Documentation](./docs/API.md) - API endpoints
- [Database Schema](./docs/SCHEMA.md) - MongoDB models

## 🚀 Deployment

### Frontend Deployment
- Netlify / Vercel / GitHub Pages
- Build: `npm run build`

### Backend Deployment
- Heroku / Railway / Render
- Environment variables required

### Admin Deployment
- Netlify / Vercel
- Build: `npm run build`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Create Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 👤 Author

**Palak**
- GitHub: [@fullstack-with-PALAK](https://github.com/fullstack-with-PALAK)

## 🙏 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing discussions

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Status:** Active Development
Go to the project directory

```bash
    cd Food-Delivery
```
Install dependencies (frontend)

```bash
    cd frontend
    npm install
```
Install dependencies (admin)

```bash
    cd admin
    npm install
```
Install dependencies (backend)

```bash
    cd backend
    npm install
```
Setup Environment Vaiables

```Make .env file in "backend" folder and store environment Variables
  JWT_SECRET=YOUR_SECRET_TEXT
  SALT=YOUR_SALT_VALUE
  MONGO_URL=YOUR_DATABASE_URL
  STRIPE_SECRET_KEY=YOUR_KEY
 ```

Setup the Frontend and Backend URL
   - App.jsx in Admin folder
      const url = YOUR_BACKEND_URL
     
  - StoreContext.js in Frontend folder
      const url = YOUR_BACKEND_URL

  - orderController in Backend folder
      const frontend_url = YOUR_FRONTEND_URL 

Start the Backend server

```bash
    nodemon server.js
```

Start the Frontend server

```bash
    npm start
```

Start the Backend server

```bash
    npm start
```
## Tech Stack
* [React](https://reactjs.org/)
* [Node.js](https://nodejs.org/en)
* [Express.js](https://expressjs.com/)
* [Mongodb](https://www.mongodb.com/)
* [Stripe](https://stripe.com/)
* [JWT-Authentication](https://jwt.io/introduction)
* [Multer](https://www.npmjs.com/package/multer)

## Deployment

The application is deployed on Render.

## Contributing

Contributions are always welcome!
Just raise an issue, and we will discuss it.

## Feedback

If you have any feedback, please reach out to me [here](https://www.linkedin.com/in/muhammad-shan-full-stack-developer/)
