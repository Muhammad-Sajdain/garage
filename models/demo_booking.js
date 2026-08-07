// models/demo_booking.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const DemoBooking = sequelize.define('DemoBooking', {
    name: { type: DataTypes.STRING, allowNull: false },
    company_name: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: 'demo_bookings',
    timestamps: true
  });

  // Associations can be added later if needed
  DemoBooking.associate = models => {};

  return DemoBooking;
};
