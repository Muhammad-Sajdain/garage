'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [existingRole] = await queryInterface.sequelize.query(
      'SELECT id FROM roles WHERE id = 1 LIMIT 1',
      { type: Sequelize.QueryTypes.SELECT },
    );

    if (!existingRole) {
      await queryInterface.bulkInsert('roles', [{
        id: 1,
        name: 'Company Owner',
        status: 1,
        is_deleted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', { id: 1 });
  },
};
