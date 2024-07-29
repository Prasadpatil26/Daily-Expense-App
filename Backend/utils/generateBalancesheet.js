const { Parser } = require('json2csv');

const generateBalanceSheet = (expenses) => {
  const fields = [
    { label: 'Description', value: 'description' },
    { label: 'Total Amount', value: 'totalAmount' },
    { label: 'Method', value: 'method' },
    {
      label: 'Participants',
      value: (row) => row.participants.map(p => `${p.name} owes ${p.amount || (row.totalAmount * (p.percentage / 100)).toFixed(2)}`).join('; '),
    },
  ];

  const json2csvParser = new Parser({ fields });
  return json2csvParser.parse(expenses);
};

module.exports = generateBalanceSheet;
