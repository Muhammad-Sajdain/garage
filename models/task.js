// src/models/task.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    task_card_id: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM('service', 'parts'), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    qty: { type: DataTypes.INTEGER, allowNull: false },
    task_status: { type: DataTypes.ENUM('pending', 'Inprogress', 'compeleted', 'cancelled'), allowNull: false, defaultValue: 'pending' },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName: 'tasks',
    timestamps: true,
  });

  Task.associate = models => {
    Task.belongsTo(models.TaskCard, { foreignKey: 'task_card_id', as: 'taskCard' });
  };

  return Task;
};
