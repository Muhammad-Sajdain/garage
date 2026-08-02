const sequelize = require('../src/config/database');

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection successful.');
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

runMigrations();
