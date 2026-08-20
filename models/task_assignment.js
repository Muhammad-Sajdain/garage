'use strict';

module.exports = (sequelize, DataTypes) => {
  const TaskAssignment = sequelize.define('TaskAssignment', {
    task_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
  }, {
    tableName: 'task_assignment',
    timestamps: true,
  });

  TaskAssignment.associate = models => {
    TaskAssignment.belongsTo(models.Task, { foreignKey: 'task_id', as: 'task' });
  };

  return TaskAssignment;
};
