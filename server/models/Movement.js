const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Movement = sequelize.define('Movement', {
  type: {
    type: DataTypes.ENUM('IN', 'OUT', 'ADJUSTMENT'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  reference_doc: {
    type: DataTypes.STRING,
  },
  note: {
    type: DataTypes.TEXT,
  },
});

module.exports = Movement;
