const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const winston = require('winston');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['exp://localhost:8081', 'https://localhost:8081'], // Add your app's origin
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Stripe webhook middleware (raw body needed for verification)
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

// Product configuration
const PRODUCTS = {
  monthly: {
    price_id: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly_placeholder',
    amount: 899, // $8.99 in cents
    currency: 'usd',
    interval: 'month'
  },
  annual: {
    price_id: process.env.STRIPE_ANNUAL_PRICE_ID || 'price_annual_placeholder',
    amount: 5999, // $59.99 in cents
    currency: 'usd',
    interval: 'year'
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Create payment intent endpoint
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { price_id, customer_id } = req.body;

    if (!price_id || !customer_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: price_id and customer_id' 
      });
    }

    // Find product configuration
    const product = Object.values(PRODUCTS).find(p => p.price_id === price_id);
    if (!product) {
      return res.status(400).json({ error: 'Invalid price_id' });
    }

    // Get or create Stripe customer
    let stripeCustomer;
    try {
      // First, try to find existing customer by metadata
      const customers = await stripe.customers.list({
        metadata: { user_id: customer_id },
        limit: 1
      });

      if (customers.data.length > 0) {
        stripeCustomer = customers.data[0];
      } else {
        // Create new customer
        stripeCustomer = await stripe.customers.create({
          metadata: { user_id: customer_id }
        });
      }
    } catch (error) {
      logger.error('Error creating/finding customer:', error);
      return res.status(500).json({ error: 'Failed to create customer' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: product.amount,
      currency: product.currency,
      customer: stripeCustomer.id,
      setup_future_usage: 'off_session',
      metadata: {
        user_id: customer_id,
        price_id: price_id,
        product_type: price_id.includes('monthly') ? 'monthly' : 'annual'
      }
    });

    logger.info('Payment intent created:', {
      payment_intent_id: paymentIntent.id,
      customer_id: customer_id,
      amount: product.amount
    });

    res.json({
      client_secret: paymentIntent.client_secret,
      customer_id: stripeCustomer.id
    });

  } catch (error) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Create subscription endpoint
app.post('/create-subscription', async (req, res) => {
  try {
    const { price_id, customer_id } = req.body;

    if (!price_id || !customer_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: price_id and customer_id' 
      });
    }

    // Get or create Stripe customer
    let stripeCustomer;
    try {
      const customers = await stripe.customers.list({
        metadata: { user_id: customer_id },
        limit: 1
      });

      if (customers.data.length > 0) {
        stripeCustomer = customers.data[0];
      } else {
        stripeCustomer = await stripe.customers.create({
          metadata: { user_id: customer_id }
        });
      }
    } catch (error) {
      logger.error('Error creating/finding customer:', error);
      return res.status(500).json({ error: 'Failed to create customer' });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomer.id,
      items: [{ price: price_id }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: customer_id
      }
    });

    res.json({
      subscription_id: subscription.id,
      client_secret: subscription.latest_invoice.payment_intent.client_secret,
      customer_id: stripeCustomer.id
    });

  } catch (error) {
    logger.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Update subscription in database
async function updateSubscriptionInDatabase(userId, subscriptionData) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        ...subscriptionData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      logger.error('Failed to update subscription in database:', error);
      return false;
    }

    logger.info('Subscription updated in database:', { userId, subscriptionData });
    return true;
  } catch (error) {
    logger.error('Error updating subscription in database:', error);
    return false;
  }
}

// Stripe webhook handler
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  logger.info('Webhook received:', { type: event.type, id: event.id });

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata.user_id;
        const productType = paymentIntent.metadata.product_type;

        if (userId) {
          const subscriptionData = {
            subscription_status: 'active',
            subscription_type: productType,
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: new Date(
              Date.now() + (productType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000
            ).toISOString(),
            stripe_customer_id: paymentIntent.customer
          };

          await updateSubscriptionInDatabase(userId, subscriptionData);
        }
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        const customerUserId = subscription.metadata.user_id;

        if (customerUserId) {
          const isActive = subscription.status === 'active';
          const subscriptionType = subscription.items.data[0].price.recurring.interval === 'month' ? 'monthly' : 'annual';

          const subscriptionData = {
            subscription_status: isActive ? 'active' : 'expired',
            subscription_type: subscriptionType,
            subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            stripe_customer_id: subscription.customer
          };

          await updateSubscriptionInDatabase(customerUserId, subscriptionData);
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        const deletedUserId = deletedSubscription.metadata.user_id;

        if (deletedUserId) {
          await updateSubscriptionInDatabase(deletedUserId, {
            subscription_status: 'cancelled'
          });
        }
        break;

      default:
        logger.info('Unhandled event type:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get subscription status
app.get('/subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('subscription_status, subscription_type, subscription_start_date, subscription_end_date, stripe_customer_id')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      subscription_status: data.subscription_status,
      subscription_type: data.subscription_type,
      subscription_start_date: data.subscription_start_date,
      subscription_end_date: data.subscription_end_date,
      stripe_customer_id: data.stripe_customer_id,
      is_active: data.subscription_status === 'active' && 
                new Date(data.subscription_end_date) > new Date()
    });

  } catch (error) {
    logger.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

module.exports = app; 