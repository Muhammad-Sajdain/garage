'use strict';

module.exports = {

  async up(queryInterface, Sequelize) {

    await queryInterface.bulkDelete('sub_modules', null, {});
    await queryInterface.bulkDelete('modules', null, {});

    await queryInterface.bulkInsert('modules', [
      {
        id: 1,
        name: 'Company Management',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-20 06:34:19',
      },
      {
        id: 2,
        name: 'Operations',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:22:06',
      },
      {
        id: 3,
        name: 'Finance & Billing',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:23:41',
      },
      {
        id: 4,
        name: 'Account Settings',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:25:23',
      },
    ]);

    await queryInterface.bulkInsert('sub_modules', [
      {
        id: 1,
        module_id: 1,
        name: 'Payment',
        status: 1,
        is_deleted: 1,
        createdAt: '2026-09-20 06:34:19',
      },
      {
        id: 2,
        module_id: 1,
        name: 'Online Payment',
        status: 1,
        is_deleted: 1,
        createdAt: '2026-09-20 06:34:19',
      },
      {
        id: 3,
        module_id: 1,
        name: 'Company Employees',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:14:25',
      },
      {
        id: 4,
        module_id: 1,
        name: 'Role Management',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:14:25',
      },
      {
        id: 5,
        module_id: 1,
        name: 'Communication Logs',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:14:25',
      },
      {
        id: 6,
        module_id: 2,
        name: 'Customers',
        status: 1,
        is_deleted: 1,
        createdAt: '2026-09-22 10:22:06',
      },
      {
        id: 7,
        module_id: 2,
        name: 'Vehicles',
        status: 1,
        is_deleted: 1,
        createdAt: '2026-09-22 10:22:06',
      },
      {
        id: 8,
        module_id: 2,
        name: 'Quotation',
        status: 1,
        is_deleted: 1,
        createdAt: '2026-09-22 10:22:06',
      },
      {
        id: 9,
        module_id: 2,
        name: 'Towing Invoice',
        status: 1,
        is_deleted: 1,
        createdAt: '2026-09-22 10:22:06',
      },
      {
        id: 10,
        module_id: 2,
        name: 'Task Cards',
        status: 1,
        is_deleted: 1,
        createdAt: '2026-09-22 10:22:06',
      },
      {
        id: 11,
        module_id: 2,
        name: 'Invoice',
        status: 1,
        is_deleted: 1,
        createdAt: '2026-09-22 10:22:06',
      },
      {
        id: 12,
        module_id: 2,
        name: 'Customer Review',
        status: 1,
        is_deleted: 1,
        createdAt: '2026-09-22 10:22:06',
      },
      {
        id: 13,
        module_id: 2,
        name: 'All Vehicles',
        status: 1,
        is_deleted: 1,
        createdAt: '2026-09-22 10:22:06',
      },
      {
        id: 14,
        module_id: 2,
        name: 'Appointments',
        status: 1,
        is_deleted: 1,
        createdAt: '2026-09-22 10:22:06',
      },
      {
        id: 15,
        module_id: 2,
        name: 'Assigned Tasks',
        status: 1,
        is_deleted: 1,
        createdAt: '2026-09-22 10:22:06',
      },
      {
        id: 16,
        module_id: 3,
        name: 'All Invoices',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:23:41',
      },
      {
        id: 17,
        module_id: 3,
        name: 'Invoice Payments',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:23:41',
      },
      {
        id: 18,
        module_id: 3,
        name: 'Sales',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:23:41',
      },
      {
        id: 19,
        module_id: 3,
        name: 'Company Account',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:23:41',
      },
      {
        id: 20,
        module_id: 3,
        name: 'Account Ledger',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:23:41',
      },
      {
        id: 21,
        module_id: 2,
        name: 'Customers',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:24:24',
      },
      {
        id: 22,
        module_id: 2,
        name: 'Vehicles',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:24:24',
      },
      {
        id: 23,
        module_id: 2,
        name: 'Quotation',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:24:24',
      },
      {
        id: 24,
        module_id: 2,
        name: 'Towing Invoice',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:24:24',
      },
      {
        id: 25,
        module_id: 2,
        name: 'Task Cards',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:24:24',
      },
      {
        id: 26,
        module_id: 2,
        name: 'Invoice',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:24:24',
      },
      {
        id: 27,
        module_id: 2,
        name: 'Customer Review',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:24:24',
      },
      {
        id: 28,
        module_id: 2,
        name: 'All Vehicles',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:24:24',
      },
      {
        id: 29,
        module_id: 2,
        name: 'Appointments',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:24:24',
      },
      {
        id: 30,
        module_id: 2,
        name: 'Assigned Tasks',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:24:24',
      },
      {
        id: 31,
        module_id: 2,
        name: 'Online Payment',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:24:24',
      },
      {
        id: 32,
        module_id: 2,
        name: 'Cash Payment',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:24:24',
      },
      {
        id: 33,
        module_id: 4,
        name: 'Profile Setting',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:25:23',
      },
      {
        id: 34,
        module_id: 4,
        name: 'Notifications',
        status: 1,
        is_deleted: 0,
        createdAt: '2026-09-22 10:25:23',
      },
    ]);
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete('sub_modules', {
      id: {
        [Sequelize.Op.in]: Array.from({ length: 34 }, (_, i) => i + 1),
      },
    });

    await queryInterface.bulkDelete('modules', {
      id: {
        [Sequelize.Op.in]: [1, 2, 3, 4],
      },
    });
  },

};


