const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency, description } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
      payment_method_types: ['card'],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.processDonation = async (req, res) => {
  try {
    const { amount, currency, institutionId } = req.body;
    const donorId = req.user.userId;

    const institution = await User.findOne({ _id: institutionId, role: 'institution' });
    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description: `Donation to ${institution.name}`,
      payment_method_types: ['card'],
      metadata: { donorId, institutionId }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Handle successful payment (e.g., update donation records)
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};