const { sequelize, User } = require('./models');
const bcrypt = require('bcrypt');

const seed = async () => {
  try {
    await sequelize.sync({ force: true }); // Reset DB
    console.log('Database synced');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      password_hash: hashedPassword,
      role: 'admin',
      status: 'active',
    });

    console.log('Admin user created');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed database:', err);
    process.exit(1);
  }
};

seed();
