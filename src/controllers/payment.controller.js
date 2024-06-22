const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
});
const User = require("../models/User");

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    console.log("Creating payment intent:", { amount, currency });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"],
    });

    console.log("Payment intent created:", paymentIntent.id);

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe API Error:", error);
    res.status(500).json({
      message: "An error occurred with the payment service.",
      error: error.message,
      type: error.type,
    });
  }
};

exports.processDonation = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      // Handle successful payment (e.g., update donation records)
      console.log("PaymentIntent was successful!");
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

exports.webhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      // Handle successful payment (e.g., update donation records)
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

exports.testStripeConnection = async (req, res) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      limit: 1,
      type: "card",
    });
    res.json({ message: "Stripe connection successful", data: paymentMethods });
  } catch (error) {
    console.error("Stripe connection error:", error);
    res
      .status(500)
      .json({ message: "Failed to connect to Stripe", error: error.message });
  }
};
