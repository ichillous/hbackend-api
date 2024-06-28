// src/controllers/payment.controller.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Payment = require('../models/Payment');
const Group = require('../models/Group'); // Changed from Class to Group

exports.createStripeAccount = async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // Change as needed
      email: req.user.email,
      capabilities: {
        card_payments: {requested: true},
        transfers: {requested: true},
      },
    });

    await req.user.updateStripeAccount(account.id);

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/stripe/refresh`,
      return_url: `${process.env.FRONTEND_URL}/stripe/return`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating Stripe account:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'account.updated') {
    const account = event.data.object;
    const user = await User.findOne({ stripeAccountId: account.id });
    if (user) {
      await user.updateStripeAccount(account.id, account.details_submitted);
    }
  }

  res.json({received: true});
};

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency, type, recipientId, groupId } = req.body;
    const payerId = req.user._id;

    const recipient = await User.findById(recipientId);
    if (!recipient || !recipient.stripeAccountId) {
      return res.status(400).json({ message: "Invalid recipient" });
    }

    let description;
    if (type === 'class') {
      const group = await Group.findById(groupId);
      if (!group || group.type !== 'class') {
        return res.status(400).json({ message: "Invalid class" });
      }
      description = `Payment for class: ${group.name}`;
    } else if (type === 'donation') {
      description = 'Donation';
    } else {
      return res.status(400).json({ message: "Invalid payment type" });
    }

    const platformFee = Math.round(amount * 0.025); // 2.5% platform fee

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      application_fee_amount: platformFee,
      transfer_data: {
        destination: recipient.stripeAccountId,
      },
      description: description,
      metadata: { payerId, recipientId, type, groupId },
    });

    const payment = new Payment({
      amount,
      currency,
      payerId,
      recipientId,
      type,
      groupId, // Changed from classId to groupId
      stripePaymentIntentId: paymentIntent.id,
      platformFee,
    });
    await payment.save();

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const payments = await Payment.getAll({}, page, limit);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPlatformEarnings = async (req, res) => {
  try {
    const earnings = await Payment.getTotalPlatformEarnings();
    res.json({ totalEarnings: earnings });
  } catch (error) {
    console.error('Error fetching platform earnings:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.syncStripeTransactions = async () => {
  try {
    console.log("Starting Stripe transaction synchronization");
    const stripeTransactions = await stripe.paymentIntents.list({ limit: 100 });
    console.log(`Retrieved ${stripeTransactions.data.length} transactions from Stripe`);

    for (const transaction of stripeTransactions.data) {
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: transaction.id },
        {
          amount: transaction.amount / 100, // Convert cents to dollars
          currency: transaction.currency,
          status: transaction.status,
          // Add other fields as necessary
        },
        { upsert: true, new: true }
      );
    }

    console.log(`Synced ${stripeTransactions.data.length} transactions to database`);
  } catch (error) {
    console.error("Error synchronizing Stripe transactions:", error);
  }
};