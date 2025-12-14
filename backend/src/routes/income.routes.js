const express = require('express');

// FIX: Add { } to extract the function from the object
const { protect } = require('../middleware/auth.middleware');

const {
  createIncome,
  getMonthlyIncome,
} = require('../controllers/income.controller');

const router = express.Router();

router.post('/', protect, createIncome);
router.get('/', protect, getMonthlyIncome);

module.exports = router;