const sequelize = require('../src/config/database');

async function applyDefaultTimestamps() {
  try {
    await sequelize.authenticate();
    console.log('--- Connected to Database ---');

    const [tables] = await sequelize.query('SHOW TABLES');
    const tableKey = Object.keys(tables[0])[0];

    for (const row of tables) {
      const tableName = row[tableKey];
      if (tableName === 'SequelizeMeta') continue;

      try {
        console.log(`Updating table: ${tableName}`);
        await sequelize.query(
          `ALTER TABLE \`${tableName}\` 
           MODIFY \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
           MODIFY \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;`
        );
        console.log(`✅ Successfully updated ${tableName}`);
      } catch (tableErr) {
        console.error(`❌ Error updating table ${tableName}:`, tableErr.message);
      }
    }

    console.log('\n--- Displaying Updated Table Structures ---');
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
    console.error('Database connection error:', err);
  } finally {
    await sequelize.close();
  }
}

applyDefaultTimestamps();
