const db = require('../../models');

const InsuredVehicle = db.InsuredVehicle;

const listInsuredVehicles = async () => {
  return InsuredVehicle.findAll({
    where: { is_deleted: 0 },
    order: [['id', 'ASC']],
  });
};

const getInsuredVehicleById = async (id) => {
  return InsuredVehicle.findOne({
    where: { id, is_deleted: 0 },
  });
};

const createInsuredVehicle = async (payload) => {
  const {
    vehicle_id,
    insurance_number,
    policy_number,
    expiry_date,
    claim_number,
    insurance_company,
    insurance_company_phone,
    status = 1,
  } = payload;

  return InsuredVehicle.create({
    vehicle_id,
    insurance_number,
    policy_number,
    expiry_date,
    claim_number,
    insurance_company,
    insurance_company_phone,
    status,
    is_deleted: 0,
  });
};

const updateInsuredVehicle = async (id, payload) => {
  const insuredVehicle = await InsuredVehicle.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!insuredVehicle) {
    throw new Error('InsuredVehicle not found');
  }

  await insuredVehicle.update(payload);
  return getInsuredVehicleById(id);
};

const deleteInsuredVehicle = async (id) => {
  const insuredVehicle = await InsuredVehicle.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!insuredVehicle) {
    throw new Error('InsuredVehicle not found');
  }

  await insuredVehicle.update({ is_deleted: 1 });
  return { success: true, message: 'InsuredVehicle deleted successfully' };
};

module.exports = {
  listInsuredVehicles,
  getInsuredVehicleById,
  createInsuredVehicle,
  updateInsuredVehicle,
  deleteInsuredVehicle,
};
