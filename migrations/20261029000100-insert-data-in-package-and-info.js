
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const packages = [
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
    ];

    const packageInfos = [
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
    ];

    const transaction = await queryInterface.sequelize.transaction();
    try {
      const existingPackages = await queryInterface.sequelize.query(
        'SELECT id, name, monthly, yearly FROM packages WHERE id IN (1, 2, 3)',
        { type: Sequelize.QueryTypes.SELECT, transaction },
      );
      const existingPackagesById = new Map(existingPackages.map((item) => [Number(item.id), item]));

      for (const packageRecord of packages) {
        const existing = existingPackagesById.get(packageRecord.id);
        if (existing && (
          existing.name !== packageRecord.name
          || Number(existing.monthly) !== Number(packageRecord.monthly)
          || Number(existing.yearly) !== Number(packageRecord.yearly)
        )) {
          throw new Error(`Package ID ${packageRecord.id} already exists with different data`);
        }
      }

      await queryInterface.bulkInsert('packages', packages, { ignoreDuplicates: true, transaction });

      const existingPackageInfos = await queryInterface.sequelize.query(
        'SELECT package_id, information FROM package_infos WHERE is_deleted = 0',
        { type: Sequelize.QueryTypes.SELECT, transaction },
      );
      const existingInfoKeys = new Set(existingPackageInfos.map((item) => `${item.package_id}:${item.information}`));
      const missingPackageInfos = packageInfos
        .filter((item) => !existingInfoKeys.has(`${item.package_id}:${item.information}`))
        .map(({ id, ...item }) => item);

      if (missingPackageInfos.length > 0) {
        await queryInterface.bulkInsert('package_infos', missingPackageInfos, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down() {
    // Keep seed data on rollback: these rows may have existed before this
    // idempotent migration was applied in a given environment.
  },
};
