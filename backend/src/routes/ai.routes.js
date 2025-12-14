// src/routes/ai.routes.js
const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const { handleAIQuery } = require("../controllers/aiController");

const router = express.Router();

// // --- ADD THESE 2 LINES ---
// console.log("Protect Middleware:", protect);
// console.log("AI Controller:", handleAIQuery);
// // -------------------------

router.post("/query", protect, handleAIQuery);

module.exports = router;