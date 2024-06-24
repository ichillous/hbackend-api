// src/controllers/payment.controller.js

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");
const User = require("../models/User");
const Group = require("../models/Group");

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency, type, recipientId, relatedEntityId } = req.body;
    const payerId = req.user.userId;

    let relatedEntityType;
    if (type === 'donation') {
      relatedEntityType = 'Donation';
    } else if (type === 'class_payment') {
      relatedEntityType = 'Group';
    } else {
      return res.status(400).json({ message: "Invalid payment type" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(400).json({ message: "Invalid recipient" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency: currency,
      metadata: { payerId, recipientId, type, relatedEntityId },
    });

    const payment = new Payment({
      payer: payerId,
      recipient: recipientId,
      amount,
      currency,
      type,
      relatedEntity: relatedEntityId,
      relatedEntityType,
      stripePaymentIntentId: paymentIntent.id,
    });

    await payment.save();

    res.status(201).json({
      message: "Payment initiated",
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Error creating payment", error: error.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      payment.stripePaymentIntentId
    );

    if (paymentIntent.status === "succeeded") {
      payment.status = "completed";
      await payment.save();
      res.json({ message: "Payment confirmed", status: "completed" });
    } else if (paymentIntent.status === "canceled") {
      payment.status = "failed";
      await payment.save();
      res.json({ message: "Payment failed", status: "failed" });
    } else {
      res.json({ message: "Payment pending", status: "pending" });
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ message: "Error confirming payment", error: error.message });
  }
};

exports.getPaymentsByUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const payments = await Payment.find({ payer: userId })
      .populate("recipient", "name")
      .populate("relatedEntity");
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
};

exports.getPaymentsByRecipient = async (req, res) => {
  try {
    const recipientId = req.params.recipientId;
    const payments = await Payment.find({
      recipient: recipientId,
      status: "completed",
    })
      .populate("payer", "name")
      .populate("relatedEntity")
      .select("-stripePaymentIntentId");
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
};

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Acknowledge receipt of the event immediately
    res.sendStatus(200);

    // Process the event asynchronously
    handleEvent(event).catch(console.error);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

async function handleEvent(event) {
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
}

async function handleSuccessfulPayment(paymentIntent) {
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });
  if (payment) {
    payment.status = "completed";
    await payment.save();
    
    // Handle specific actions based on payment type
    if (payment.type === 'class_payment') {
      await handleClassPayment(payment);
    }
    // You might want to trigger some notifications or other actions here
  }
}

async function handleClassPayment(payment) {
  const group = await Group.findById(payment.relatedEntity);
  if (group) {
    group.members.push(payment.payer);
    await group.save();
  }
}

module.exports = exports;