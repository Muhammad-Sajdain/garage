const db = require('../../models');

const Vehicle = db.Vehicle;
const InsuredVehicle = db.InsuredVehicle;

const listVehicles = async () => {
  return Vehicle.findAll({
    where: { is_deleted: 0 },
    include: [{
      model: InsuredVehicle,
      as: 'insuredVehicle',
      where: { is_deleted: 0 },
      required: false,
    }],
    order: [['id', 'ASC']],
  });
};

const getVehicleById = async (id) => {
  return Vehicle.findOne({
    where: { id, is_deleted: 0 },
    include: [{
      model: InsuredVehicle,
      as: 'insuredVehicle',
      where: { is_deleted: 0 },
      required: false,
    }],
  });
};

const createVehicle = async (payload) => {
  const {
    customer_id,
    name,
    make,
    model,
    variant,
    year,
    VIN,
    license_plate,
    insured = 0,
    created_by,
    status = 1,
    insuranceDetails,
  } = payload;

  const createdVehicle = await Vehicle.create({
    customer_id,
    name,
    make,
    model,
    variant,
    year,
    VIN,
    license_plate,
    insured,
    created_by,
    status,
    is_deleted: 0,
  });

  if (insured === 1 && insuranceDetails) {
    await InsuredVehicle.create({
      vehicle_id: createdVehicle.id,
      ...insuranceDetails,
      status: 1,
      is_deleted: 0,
    });
  }

  return getVehicleById(createdVehicle.id);
};

const updateVehicle = async (id, payload) => {
  const vehicle = await Vehicle.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  const { insuranceDetails, ...vehicleData } = payload;
  await vehicle.update(vehicleData);

  if (vehicleData.insured === 1 && insuranceDetails) {
    const existingInsurance = await InsuredVehicle.findOne({
      where: { vehicle_id: id, is_deleted: 0 },
    });

    if (existingInsurance) {
      await existingInsurance.update(insuranceDetails);
    } else {
      await InsuredVehicle.create({
        vehicle_id: id,
        ...insuranceDetails,
        status: 1,
        is_deleted: 0,
      });
    }
  }

  if (vehicleData.insured === 0) {
    await InsuredVehicle.update(
      { is_deleted: 1 },
      { where: { vehicle_id: id, is_deleted: 0 } }
    );
  }

  return getVehicleById(id);
};

const deleteVehicle = async (id) => {
  const vehicle = await Vehicle.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  await vehicle.update({ is_deleted: 1 });
  await InsuredVehicle.update(
    { is_deleted: 1 },
    { where: { vehicle_id: id, is_deleted: 0 } }
  );

  return { success: true, message: 'Vehicle deleted successfully' };
};

module.exports = {
  listVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
