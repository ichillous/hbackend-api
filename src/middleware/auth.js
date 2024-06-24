const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

async function isInstructor(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== "instructor") {
      return res
        .status(403)
        .json({
          message: "Access denied. Only instructors can perform this action.",
        });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const institutionAuthMiddleware = async (req, res, next) => {
  try {
    // Assuming the user object is attached to the request by the previous authMiddleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'institution' || !user.isVerified) {
      return res.status(403).json({ message: 'Access denied. Only verified institutions can perform this action.' });
    }

    // If the user is a verified institution, attach the institution ID to the request
    req.institutionId = user.id;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error authenticating institution', error: error.message });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  authMiddleware,
  isInstructor,
  institutionAuthMiddleware,
  isAdmin
};
