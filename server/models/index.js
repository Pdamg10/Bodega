const sequelize = require("../database");
const User = require("./User");
const Product = require("./Product");
const Category = require("./Category");
const Movement = require("./Movement");
const Payment = require("./Payment");
const Setting = require("./Setting");
const AuditLog = require("./AuditLog");

// Associations

// Product - Category
Category.hasMany(Product, { foreignKey: "category_id" });
Product.belongsTo(Category, { foreignKey: "category_id" });

// Movement - Product
Product.hasMany(Movement, { foreignKey: "product_id" });
Movement.belongsTo(Product, { foreignKey: "product_id" });

// Movement - User (who performed the action)
User.hasMany(Movement, { foreignKey: "user_id" });
Movement.belongsTo(User, { foreignKey: "user_id" });

// Payment - User (Client)
User.hasMany(Payment, { foreignKey: "user_id" });
Payment.belongsTo(User, { foreignKey: "user_id" });

module.exports = {
  sequelize,
  User,
  Product,
  Category,
  Movement,
  Payment,
  Setting,
  AuditLog,
};
