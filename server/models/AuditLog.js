const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const AuditLog = sequelize.define(
  "AuditLog",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Can be null for system actions
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING, // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, RESTORE, etc.
      allowNull: false,
    },
    table_name: {
      type: DataTypes.STRING,
      allowNull: true, // e.g., 'Products', 'Users', etc.
    },
    row_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // ID of the affected row
    },
    before_value: {
      type: DataTypes.TEXT,
      allowNull: true, // JSON string of previous state
    },
    after_value: {
      type: DataTypes.TEXT,
      allowNull: true, // JSON string of new state
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    updatedAt: false, // Only track creation
  }
);

module.exports = AuditLog;
