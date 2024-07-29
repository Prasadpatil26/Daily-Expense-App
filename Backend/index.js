const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const expenseRoutes = require('./routes/expenses'); 
const app = express();

connectDB();

app.use(cors());
app.use(express.json({ extended: false }));
app.use('/api/expenses', expenseRoutes);
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
