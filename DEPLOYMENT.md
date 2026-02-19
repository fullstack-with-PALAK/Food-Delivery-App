# CraveCart Deployment Guide

## Prerequisites

- Node.js v18+ installed
- MongoDB database (Atlas or self-hosted)
- Stripe account for payments
- Cloudinary account for image storage
- Domain name and SSL certificate

## Frontend Deployment (Netlify/Vercel)

### Using Netlify

1. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

2. **Environment Variables**
   - Copy from `.env.production.example`
   - Add all variables in Netlify dashboard
   - Make sure `VITE_API_BASE_URL` points to your backend

3. **Deploy**
   ```bash
   npm run build
   netlify deploy --prod
   ```

### Using Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Configure**
   - Add environment variables in Vercel dashboard
   - Configure domain and SSL

## Backend Deployment (Railway/Render/Heroku)

### Using Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Initialize**
   ```bash
   cd backend
   railway init
   ```

3. **Add Environment Variables**
   - In Railway dashboard, add all variables from `.env.production.example`

4. **Deploy**
   ```bash
   railway up
   ```

### Using Render

1. **Create New Web Service**
   - Connect your GitHub repository
   - Select backend directory
   
2. **Build Settings**
   ```
   Build command: npm install
   Start command: npm start
   ```

3. **Environment Variables**
   - Add all variables from `.env.production.example`

4. **Deploy**
   - Render will auto-deploy on git push

### Using Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create App**
   ```bash
   cd backend
   heroku create cravecart-api
   ```

3. **Add Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=your_uri
   heroku config:set JWT_SECRET=your_secret
   # Add all other variables
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

## MongoDB Setup (Production)

### Using MongoDB Atlas

1. **Create Cluster**
   - Sign up at mongodb.com/cloud/atlas
   - Create a new cluster
   - Select cloud provider and region

2. **Configure**
   - Add IP whitelist (0.0.0.0/0 for any IP)
   - Create database user
   - Get connection string

3. **Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/cravecart?retryWrites=true&w=majority
   ```

## Domain Setup

1. **Buy Domain**
   - Namecheap, GoDaddy, or Google Domains

2. **Configure DNS**
   - Add A record pointing to backend server
   - Add CNAME for www subdomain
   - Add A record for API subdomain

3. **SSL Certificate**
   - Use Let's Encrypt (free)
   - Or use hosting provider's SSL

## Security Checklist

- [ ] Change all default secrets and keys
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set secure cookie options
- [ ] Enable rate limiting
- [ ] Configure CSP headers
- [ ] Enable MongoDB authentication
- [ ] Use environment variables (never commit secrets)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Enable DDoS protection
- [ ] Use CDN for static assets

## Performance Optimization

1. **Enable Compression**
   ```javascript
   app.use(compression());
   ```

2. **Cache Static Assets**
   - Set cache headers
   - Use CDN (Cloudflare, AWS CloudFront)

3. **Database Indexing**
   ```javascript
   // Add indexes to frequently queried fields
   foodSchema.index({ name: 'text', category: 1 });
   ```

4. **Image Optimization**
   - Use Cloudinary transformations
   - Lazy load images
   - Use WebP format

## Monitoring

1. **Error Tracking**
   - Sentry.io
   - Bugsnag
   - LogRocket

2. **Performance Monitoring**
   - New Relic
   - Datadog
   - Google Analytics

3. **Uptime Monitoring**
   - UptimeRobot
   - Pingdom
   - StatusCake

## Post-Deployment

1. **Test Everything**
   - User registration/login
   - Browse and search
   - Add to cart
   - Payment flow
   - Order tracking
   - Admin functions

2. **Set Up Backups**
   - MongoDB backups
   - File storage backups
   - Database snapshots

3. **Documentation**
   - API documentation
   - User guide
   - Admin guide

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS_ORIGIN in backend
   - Verify API_BASE_URL in frontend

2. **Payment Failures**
   - Verify Stripe keys
   - Check webhook configuration

3. **Image Upload Issues**
   - Verify Cloudinary credentials
   - Check upload size limits

4. **Database Connection**
   - Verify MongoDB URI
   - Check IP whitelist
   - Verify network access

## Scaling

1. **Horizontal Scaling**
   - Use load balancer
   - Multiple backend instances
   - Session store (Redis)

2. **Database Scaling**
   - MongoDB sharding
   - Read replicas
   - Connection pooling

3. **CDN**
   - Cloudflare
   - AWS CloudFront
   - Fastly

## Support

For deployment issues:
- Check documentation
- Review logs
- Contact hosting support
- Create GitHub issue

---

**Last Updated:** February 2026
**Version:** 1.0.0
