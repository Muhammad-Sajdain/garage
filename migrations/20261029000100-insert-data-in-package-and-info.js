
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('packages', [
      {
        id: 1,
        name: 'Software Essentials',
        monthly: '300.00',
        yearly: '3000.00',
        status: 1,
        createdAt: '2026-10-22 22:47:04',
        updatedAt: '2026-10-22 22:47:04',
        is_deleted: 0,
      },
      {
        id: 2,
        name: 'Communication & Management',
        monthly: '400.00',
        yearly: '4000.00',
        status: 1,
        createdAt: '2026-08-18 21:55:19',
        updatedAt: '2026-10-22 22:46:36',
        is_deleted: 0,
      },
      {
        id: 3,
        name: 'Complete Growth Package',
        monthly: '600.00',
        yearly: '6000.00',
        status: 1,
        createdAt: '2026-08-02 04:58:45',
        updatedAt: '2026-10-22 22:58:38',
        is_deleted: 0,
      },
    ]);

    await queryInterface.bulkInsert('package_infos', [
      // Package 1: Software Essentials
      {
        id: 1,
        package_id: 1,
        information: 'Job/workflow management',
        status: 1,
        createdAt: '2026-10-22 22:47:04',
        updatedAt: '2026-10-22 22:47:04',
        is_deleted: 0,
      },
      {
        id: 2,
        package_id: 1,
        information: 'Reporting and analytics',
        status: 1,
        createdAt: '2026-10-22 22:47:04',
        updatedAt: '2026-10-22 22:47:04',
        is_deleted: 0,
      },
      {
        id: 3,
        package_id: 1,
        information: 'Staff and task management',
        status: 1,
        createdAt: '2026-10-22 22:47:04',
        updatedAt: '2026-10-22 22:47:04',
        is_deleted: 0,
      },
      {
        id: 4,
        package_id: 1,
        information: 'Estimates and invoicing',
        status: 1,
        createdAt: '2026-10-22 22:47:04',
        updatedAt: '2026-10-22 22:47:04',
        is_deleted: 0,
      },
      {
        id: 5,
        package_id: 1,
        information: 'Vehicle and repair order management',
        status: 1,
        createdAt: '2026-10-22 22:47:04',
        updatedAt: '2026-10-22 22:47:04',
        is_deleted: 0,
      },
      {
        id: 6,
        package_id: 1,
        information: 'Customer management (CRM)',
        status: 1,
        createdAt: '2026-10-22 22:47:04',
        updatedAt: '2026-10-22 22:47:04',
        is_deleted: 0,
      },
      {
        id: 7,
        package_id: 1,
        information: 'Full access to Shop management software',
        status: 1,
        createdAt: '2026-10-22 22:47:04',
        updatedAt: '2026-10-22 22:47:04',
        is_deleted: 0,
      },
      {
        id: 8,
        package_id: 1,
        information: 'Customer communication tools within the platform',
        status: 1,
        createdAt: '2026-10-22 22:47:04',
        updatedAt: '2026-10-22 22:47:04',
        is_deleted: 0,
      },

      // Package 2: Communication & Management
      {
        id: 9,
        package_id: 2,
        information: 'Car Maintenance History Reports',
        status: 1,
        createdAt: '2026-08-18 21:55:19',
        updatedAt: '2026-08-18 21:55:19',
        is_deleted: 0,
      },
      {
        id: 10,
        package_id: 2,
        information: 'Repair-status notifications',
        status: 1,
        createdAt: '2026-08-18 21:55:19',
        updatedAt: '2026-08-18 21:55:19',
        is_deleted: 0,
      },
      {
        id: 11,
        package_id: 2,
        information: 'Communication history and tracking',
        status: 1,
        createdAt: '2026-08-18 21:55:19',
        updatedAt: '2026-08-18 21:55:19',
        is_deleted: 0,
      },
      {
        id: 12,
        package_id: 2,
        information: 'Automated email notifications',
        status: 1,
        createdAt: '2026-08-18 21:55:19',
        updatedAt: '2026-08-18 21:55:19',
        is_deleted: 0,
      },
      {
        id: 13,
        package_id: 2,
        information: 'Includes everything  in Software Essentials',
        status: 1,
        createdAt: '2026-08-18 21:55:19',
        updatedAt: '2026-08-18 21:55:19',
        is_deleted: 0,
      },
      {
        id: 14,
        package_id: 2,
        information: 'Customer communication and follow-ups',
        status: 1,
        createdAt: '2026-08-18 21:55:19',
        updatedAt: '2026-08-18 21:55:19',
        is_deleted: 0,
      },
      {
        id: 15,
        package_id: 2,
        information: 'Email management',
        status: 1,
        createdAt: '2026-08-18 21:55:19',
        updatedAt: '2026-08-18 21:55:19',
        is_deleted: 0,
      },
      {
        id: 16,
        package_id: 2,
        information: 'Limited support to setup system',
        status: 1,
        createdAt: '2026-08-18 21:55:19',
        updatedAt: '2026-08-18 21:55:19',
        is_deleted: 0,
      },

      // Package 3: Complete Growth Package
      {
        id: 17,
        package_id: 3,
        information: 'Social Media Marketing & Content Management',
        status: 1,
        createdAt: '2026-08-02 04:58:45',
        updatedAt: '2026-08-02 04:58:45',
        is_deleted: 0,
      },
      {
        id: 18,
        package_id: 3,
        information: 'Social media advertising',
        status: 1,
        createdAt: '2026-08-02 04:58:45',
        updatedAt: '2026-08-02 04:58:45',
        is_deleted: 0,
      },
      {
        id: 19,
        package_id: 3,
        information: 'Google PPC advertising',
        status: 1,
        createdAt: '2026-08-02 04:58:45',
        updatedAt: '2026-08-02 04:58:45',
        is_deleted: 0,
      },
      {
        id: 20,
        package_id: 3,
        information: 'Google Ads campaign management',
        status: 1,
        createdAt: '2026-08-02 04:58:45',
        updatedAt: '2026-08-02 04:58:45',
        is_deleted: 0,
      },
      {
        id: 21,
        package_id: 3,
        information: 'Lead generation campaigns',
        status: 1,
        createdAt: '2026-08-02 04:58:45',
        updatedAt: '2026-08-02 04:58:45',
        is_deleted: 0,
      },
      {
        id: 22,
        package_id: 3,
        information: 'Marketing performance tracking',
        status: 1,
        createdAt: '2026-08-02 04:58:45',
        updatedAt: '2026-08-02 04:58:45',
        is_deleted: 0,
      },
      {
        id: 23,
        package_id: 3,
        information: 'Campaign reporting and optimization',
        status: 1,
        createdAt: '2026-08-02 04:58:45',
        updatedAt: '2026-08-02 04:58:45',
        is_deleted: 0,
      },
      {
        id: 24,
        package_id: 3,
        information: 'Includes everything in Both Packages',
        status: 1,
        createdAt: '2026-08-02 04:58:45',
        updatedAt: '2026-08-02 04:58:45',
        is_deleted: 0,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'package_infos',
      {
        id: {
          [Sequelize.Op.in]: [
            124, 125, 126, 127, 128, 129, 130, 131,
            132, 133, 134, 135, 136, 137, 138, 139,
            156, 157, 158, 159, 160, 161, 162, 163,
          ],
        },
      }
    );

    await queryInterface.bulkDelete(
      'packages',
      {
        id: {
          [Sequelize.Op.in]: [1, 2, 3],
        },
      }
    );
  },
};
