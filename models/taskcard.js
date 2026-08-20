// src/models/taskcard.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const TaskCard = sequelize.define('TaskCard', {
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    quotation_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName: 'task_cards',
    timestamps: true,
  });

  TaskCard.associate = models => {
    TaskCard.belongsTo(models.Quotation, { foreignKey: 'quotation_id', as: 'quotation' });
    TaskCard.hasMany(models.Task, { foreignKey: 'task_card_id', as: 'tasks' });
  };

  return TaskCard;
};
