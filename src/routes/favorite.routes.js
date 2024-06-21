const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favorite.controller");
const authMiddleware = require("../middleware/auth");

router.post("/toggle", authMiddleware, favoriteController.toggleFavorite);
router.get("/", authMiddleware, favoriteController.getFavorites);

module.exports = router;
