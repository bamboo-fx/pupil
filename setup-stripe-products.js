#!/usr/bin/env node

/**
 * Stripe Product Setup Script
 * 
 * This script creates the necessary products and prices in your Stripe account
 * for the Pupil app subscription plans.
 * 
 * Usage:
 * 1. Set your STRIPE_SECRET_KEY environment variable
 * 2. Run: node setup-stripe-products.js
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRODUCTS = {
  monthly: {
    name: 'Monthly Premium',
    description: 'Access to all premium features, unlimited content, and ad-free experience',
    amount: 899, // $8.99 in cents
    currency: 'usd',
    interval: 'month',
    interval_count: 1,
  },
  annual: {
    name: 'Annual Premium', 
    description: 'Best value! Access to all premium features for a full year',
    amount: 5999, // $59.99 in cents
    currency: 'usd',
    interval: 'year',
    interval_count: 1,
  }
};

async function createStripeProducts() {
  console.log('🚀 Setting up Stripe products for Pupil app...\n');

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ Error: STRIPE_SECRET_KEY environment variable is required');
    console.log('Please set your Stripe secret key:');
    console.log('export STRIPE_SECRET_KEY=sk_test_your_key_here');
    process.exit(1);
  }

  try {
    // Check if we can connect to Stripe
    await stripe.account.retrieve();
    console.log('✅ Connected to Stripe successfully\n');

    for (const [key, productConfig] of Object.entries(PRODUCTS)) {
      console.log(`📦 Creating ${productConfig.name}...`);

      // Create product
      const product = await stripe.products.create({
        name: productConfig.name,
        description: productConfig.description,
        metadata: {
          app: 'pupil',
          plan_type: key
        }
      });

      console.log(`   Product ID: ${product.id}`);

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: productConfig.amount,
        currency: productConfig.currency,
        recurring: {
          interval: productConfig.interval,
          interval_count: productConfig.interval_count,
        },
        metadata: {
          app: 'pupil',
          plan_type: key
        }
      });

      console.log(`   Price ID: ${price.id}`);
      console.log(`   Amount: $${(productConfig.amount / 100).toFixed(2)}/${productConfig.interval}`);
      console.log('');
    }

    console.log('🎉 All products created successfully!\n');
    console.log('📋 Next steps:');
    console.log('1. Copy the Price IDs above');
    console.log('2. Add them to your backend/.env file:');
    console.log('   STRIPE_MONTHLY_PRICE_ID=price_xxx');
    console.log('   STRIPE_ANNUAL_PRICE_ID=price_xxx');
    console.log('3. Add your publishable key to src/config/stripe.ts');
    console.log('4. Set up webhook endpoint at: /webhook');
    console.log('5. Add webhook secret to backend/.env file');

  } catch (error) {
    console.error('❌ Error creating products:', error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n💡 Make sure your STRIPE_SECRET_KEY is correct and has the right permissions');
    }
    
    process.exit(1);
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  createStripeProducts();
}

module.exports = createStripeProducts; 