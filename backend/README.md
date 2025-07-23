# Pupil Backend Server

Express server with Stripe integration for handling payments and subscriptions.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id
STRIPE_ANNUAL_PRICE_ID=price_your_annual_price_id

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Optional: For production deployment
ALLOWED_ORIGINS=https://your-app-domain.com,exp://localhost:8081
```

### 3. Stripe Product Setup

1. Create products in your Stripe Dashboard:
   - Monthly Subscription: $8.99/month
   - Annual Subscription: $59.99/year

2. Get the price IDs and add them to your `.env` file

3. Set up webhook endpoint pointing to `https://your-server.com/webhook`

### 4. Start the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Payment Endpoints
- `POST /create-payment-intent` - Create payment intent for one-time purchase
- `POST /create-subscription` - Create recurring subscription
- `GET /subscription/:userId` - Get user subscription status

### Webhook
- `POST /webhook` - Stripe webhook handler

### Health Check
- `GET /health` - Server health check

## Features

- ✅ Stripe payment processing
- ✅ Subscription management
- ✅ Webhook handling for real-time updates
- ✅ Supabase integration
- ✅ Security middleware (CORS, rate limiting, helmet)
- ✅ Logging with Winston
- ✅ Error handling

## Security

- Rate limiting (100 requests per 15 minutes per IP)
- CORS protection
- Helmet security headers
- Webhook signature verification
- Environment variable configuration 