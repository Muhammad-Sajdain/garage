// models/customer_review.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const CustomerReview = sequelize.define('CustomerReview', {
    task_card_id: { type: DataTypes.INTEGER, allowNull: false },
    company_id: { type: DataTypes.INTEGER, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    review: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    is_deleted: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: 'customer_reviews',
    timestamps: true
  });

  CustomerReview.associate = models => {
    CustomerReview.belongsTo(models.TaskCard, { foreignKey: 'task_card_id', as: 'taskCard' });
    // optional: associate with Company if needed
    if (models.Company) {
      CustomerReview.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    }
  };

  return CustomerReview;
};
