const router = require('express').Router();
const ctrl = require('../controllers/expense.controller');

// 1. Keep ONLY this import
const { protect } = require('../middleware/auth.middleware');

// 2. Use 'protect' instead of 'auth' in all lines below
router.post('/', protect, ctrl.create);
router.get('/', protect, ctrl.getAll);

router.post('/bulk', protect, ctrl.addBulkExpenses);
router.get('/weekly', protect, ctrl.weekly);
router.get('/summary/category', protect, ctrl.summary);
router.get('/balance', protect, ctrl.balance);
router.get('/summary/monthly', protect, ctrl.monthlySummary);
router.delete('/:id', protect, ctrl.delete);
router.get('/month', protect, ctrl.getByMonthYear);

module.exports = router;