const express = require('express');
const router = express.Router();
const { createExpense, getUserExpenses, getAllExpenses, downloadBalanceSheet } = require('../controllers/expenseController');
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const generateBalanceSheet = require('../utils/generateBalancesheet');

// @route    POST api/expenses
// @desc     Add new expense
// @access   Private
router.post('/', auth, async (req, res) => {
    const { description, amount, splitMethod, participants } = req.body;

    if (!description || !amount || !splitMethod || !participants) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    let splits = [];
    if (splitMethod === 'equal') {
        const splitAmount = amount / participants.length;
        splits = participants.map(participant => ({ user: participant, amount: splitAmount }));
    } else if (splitMethod === 'exact') {
        splits = participants.map(participant => ({ user: participant.user, amount: participant.amount }));
    } else if (splitMethod === 'percentage') {
        const totalPercentage = participants.reduce((acc, p) => acc + parseFloat(p.percentage || 0), 0);
        if (totalPercentage !== 100) {
            return res.status(400).json({ message: 'Percentages must add up to 100%' });
        }
        splits = participants.map(participant => ({ user: participant.user, amount: (amount * participant.percentage) / 100 }));
    } else {
        return res.status(400).json({ message: 'Invalid split method' });
    }

    try {
        const newExpense = new Expense({
            description,
            amount,
            splits,
            createdBy: req.user.id
        });

        const expense = await newExpense.save();
        res.json(expense);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route    GET api/expenses/download
// @desc     Download balance sheet
// @access   Private
router.get('/download', auth, async (req, res) => {
    try {
        const expenses = await Expense.find({ createdBy: req.user.id });

        if (!expenses) {
            return res.status(404).json({ msg: 'No expenses found' });
        }

        const csv = generateBalanceSheet(expenses);

        res.header('Content-Type', 'text/csv');
        res.attachment('balance-sheet.csv');
        return res.send(csv);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Use controller methods
router.post('/create', auth, createExpense);
router.get('/user/:userId', auth, getUserExpenses);
router.get('/', auth, getAllExpenses);
router.get('/download', auth, downloadBalanceSheet);

module.exports = router;
