// models/vehicle_maintenance_picture.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const VehicleMaintenancePicture = sequelize.define('VehicleMaintenancePicture', {
    task_card_id: { type: DataTypes.STRING, allowNull: false },
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    picture: { type: DataTypes.STRING, allowNull: false },
    picture_tag: { type: DataTypes.ENUM('before', 'after'), allowNull: false },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: 'vehicle_maintenance_pictures',
    timestamps: true
  });

  VehicleMaintenancePicture.associate = models => {
    // define associations if needed, e.g., belongsTo TaskCard
  };

  return VehicleMaintenancePicture;
};
