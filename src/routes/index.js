// src/routes/index.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const routesDir = path.join(__dirname, "./");

fs.readdirSync(routesDir)
  .filter((file) => file.endsWith(".routes.js"))
  .forEach((file) => {
    const routeFile = path.join(routesDir, file);
    const route = require(routeFile);
    router.use(`/${file.replace(".routes.js", "")}`, route);
  });

module.exports = router;