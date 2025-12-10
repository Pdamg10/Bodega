const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Payment = sequelize.define('Payment', {
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD',
  },
  status: {
    type: DataTypes.ENUM('PAID', 'PARTIAL', 'LATE', 'PENDING'),
    defaultValue: 'PENDING',
  },
  due_date: {
    type: DataTypes.DATEONLY,
  },
  date_paid: {
    type: DataTypes.DATE,
  },
  note: {
    type: DataTypes.TEXT,
  },
});

module.exports = Payment;
