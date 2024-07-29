const Expense = require('../models/Expense');
const User = require('../models/User');
const { generateCSV } = require('../utils/generateBalancesheet');

exports.createExpense = async (req, res) => {
    const { description, amount, splits } = req.body;
    const userId = req.user.id;

    try {
        const expense = new Expense({ description, amount, splits, createdBy: userId });
        await expense.save();
        res.json(expense);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getUserExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ 'splits.user': req.params.userId });
        res.json(expenses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().populate('createdBy', 'name');
        res.json(expenses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.downloadBalanceSheet = async (req, res) => {
    try {
        const expenses = await Expense.find().populate('createdBy', 'name').populate('splits.user', 'name');
        const csv = generateCSV(expenses);
        res.setHeader('Content-disposition', 'attachment; filename=balance-sheet.csv');
        res.set('Content-Type', 'text/csv');
        res.status(200).send(csv);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
