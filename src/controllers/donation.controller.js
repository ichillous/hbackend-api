const Donation = require("../models/Donation");
const User = require("../models/User");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createDonation = async (req, res) => {
  try {
    const { recipientId, amount, currency, message } = req.body;
    const donorId = req.user.userId;

    const recipient = await User.findById(recipientId);
    if (!recipient || recipient.role !== "institution") {
      return res.status(400).json({ message: "Invalid recipient" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency: currency,
      metadata: { donorId, recipientId },
    });

    const donation = new Donation({
      donor: donorId,
      recipient: recipientId,
      amount,
      currency,
      message,
      stripePaymentIntentId: paymentIntent.id,
    });

    await donation.save();

    res.status(201).json({
      message: "Donation initiated",
      clientSecret: paymentIntent.client_secret,
      donationId: donation._id,
    });
  } catch (error) {
    console.error("Error creating donation:", error);
    res
      .status(500)
      .json({ message: "Error creating donation", error: error.message });
  }
};

exports.confirmDonation = async (req, res) => {
  try {
    const { donationId } = req.params;
    const donation = await Donation.findById(donationId);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      donation.stripePaymentIntentId
    );

    if (paymentIntent.status === "succeeded") {
      donation.status = "completed";
      await donation.save();
      res.json({ message: "Donation confirmed", status: "completed" });
    } else if (paymentIntent.status === "canceled") {
      donation.status = "failed";
      await donation.save();
      res.json({ message: "Donation failed", status: "failed" });
    } else {
      res.json({ message: "Donation pending", status: "pending" });
    }
  } catch (error) {
    console.error("Error confirming donation:", error);
    res
      .status(500)
      .json({ message: "Error confirming donation", error: error.message });
  }
};

exports.getDonationsByUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const donations = await Donation.find({ donor: userId }).populate(
      "recipient",
      "name"
    );
    res.json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    res
      .status(500)
      .json({ message: "Error fetching donations", error: error.message });
  }
};

exports.getDonationsByInstitution = async (req, res) => {
  try {
    const institutionId = req.params.institutionId;
    const donations = await Donation.find({
      recipient: institutionId,
      status: "completed",
    })
      .populate("donor", "name")
      .select("-stripePaymentIntentId");
    res.json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    res
      .status(500)
      .json({ message: "Error fetching donations", error: error.message });
  }
};

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  console.log("Webhook handler called");
  console.log("Received Stripe signature:", sig);

  let event;

  try {
    console.log("Raw body:", req.rawBody);

    const isNgrok = req.headers["x-forwarded-for"] !== undefined;
    console.log("Is Ngrok request:", isNgrok);

    if (isNgrok) {
      const payload = JSON.parse(req.rawBody);
      event = { type: payload.type, data: { object: payload.data.object } };
      console.log("Parsed event from ngrok:", event);
    } else {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("Constructed event from Stripe:", event);
    }

    // Acknowledge receipt of the event immediately
    res.sendStatus(200);

    // Process the event asynchronously
    handleEvent(event).catch(console.error);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    console.error(err.stack);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

async function handleEvent(event) {
  console.log("Event Type:", event.type);

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("PaymentIntent was successful!");
      await handleSuccessfulPayment(paymentIntent);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
}

async function handleSuccessfulPayment(paymentIntent) {
    console.log("Handling successful payment:", paymentIntent.id);
    const donation = await Donation.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });
  if (donation) {
    donation.status = "completed";
    await donation.save();
    // You might want to trigger some notifications or other actions here
  }
}
