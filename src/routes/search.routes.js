const express = require("express");
const router = express.Router();
const searchController = require("../controllers/search.controller");
const {authMiddleware} = require("../middleware/auth");

router.get('/', authMiddleware, searchController.search);

module.exports = router;
