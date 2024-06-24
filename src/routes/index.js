const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const instructorRoutes = require("./instructor.routes");
const institutionRoutes = require("./institution.routes");
const eventRoutes = require("./event.routes");
const groupRoutes = require("./group.routes"); // Changed from classRoutes
const chatRoutes = require("./chat.routes");
const paymentRoutes = require("./payment.routes");


router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/instructors", instructorRoutes);
router.use("/institutions", institutionRoutes);
router.use("/events", eventRoutes);
// Changed from '/classes'
router.use("/groups", groupRoutes);
router.use("/chat", chatRoutes);
router.use("/payments", paymentRoutes);

router.get("/", (req, res) => {
  res.json({ message: "Welcome to the Islamic Social App API" });
});

module.exports = router;
