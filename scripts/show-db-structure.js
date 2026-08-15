const sequelize = require('../src/config/database');

async function showDbStructure() {
  try {
    await sequelize.authenticate();
    console.log('--- Connected to Database ---');

    const [tables] = await sequelize.query('SHOW TABLES');
    const tableKey = Object.keys(tables[0])[0];

    for (const row of tables) {
      const tableName = row[tableKey];
      if (tableName === 'SequelizeMeta') continue;

      console.log(`\n========================================`);
      console.log(`TABLE: ${tableName}`);
      console.log(`========================================`);

      const [columns] = await sequelize.query(`DESCRIBE \`${tableName}\``);
      console.table(columns);
    }
  } catch (err) {
    console.error('Error describing database structure:', err);
  } finally {
    await sequelize.close();
  }
}

showDbStructure();
