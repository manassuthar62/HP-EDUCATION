const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Student = require('../models/Student');

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('studentId courseId').lean();
    // Filter out transactions where student was deleted (studentId will be null after populate)
    const validTransactions = transactions.filter(t => t.studentId !== null);
    console.log(`[Fee API] Fetched ${validTransactions.length} valid transactions (Total: ${transactions.length})`);
    res.json(validTransactions);
  } catch (err) {
    console.error('[Fee API] Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Record new payment
router.post('/', async (req, res) => {
  const transaction = new Transaction(req.body);
  try {
    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get transactions for a specific student
router.get('/student/:id', async (req, res) => {
  try {
    const transactions = await Transaction.find({ studentId: req.params.id }).populate('courseId');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
