const db = require('../../models');

const Vehicle = db.Vehicle;
const InsuredVehicle = db.InsuredVehicle;
const Customer = db.Customer;

const listVehicles = async ({ customer_id, company_id } = {}) => {
  return Vehicle.findAll({
    where: {
      is_deleted: 0,
      ...(customer_id ? { customer_id } : {}),
    },
    include: [
      {
        model: Customer,
        as: 'customer',
        attributes: ['id', 'name', 'company_id'],
        where: { is_deleted: 0, ...(company_id ? { company_id } : {}) },
        required: Boolean(company_id),
      },
      {
        model: InsuredVehicle,
        as: 'insuredVehicle',
        where: { is_deleted: 0 },
        required: false,
      },
    ],
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
  } = payload;

  // merge top-level insurance fields with nested `insuranceDetails` (nested overrides top-level)
  const insuranceDetails = {
    insurance_number: payload.insurance_number ?? payload.insuranceNumber,
    policy_number: payload.policy_number ?? payload.policyNumber,
    expiry_date: payload.expiry_date ?? payload.expiryDate,
    claim_number: payload.claim_number ?? payload.claimNumber,
    insurance_company: payload.insurance_company ?? payload.insuranceCompany,
    insurance_company_phone: payload.insurance_company_phone ?? payload.insuranceCompanyPhone,
    ...(payload.insuranceDetails || {}),
  };

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

  if (insured === 1 && insuranceDetails && (insuranceDetails.claim_number || insuranceDetails.claimNumber)) {
    await InsuredVehicle.create({
      vehicle_id: createdVehicle.id,
      insurance_number: insuranceDetails.insurance_number,
      policy_number: insuranceDetails.policy_number,
      expiry_date: insuranceDetails.expiry_date,
      claim_number: insuranceDetails.claim_number || insuranceDetails.claimNumber,
      insurance_company: insuranceDetails.insurance_company,
      insurance_company_phone: insuranceDetails.insurance_company_phone,
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

  const { insuranceDetails, insurance_number, policy_number, expiry_date, claim_number, insurance_company, insurance_company_phone, ...vehicleData } = payload;
  await vehicle.update(vehicleData);

  // Merge top-level insurance fields with nested insuranceDetails (nested overrides)
  const resolvedInsurance = {
    insurance_number,
    policy_number,
    expiry_date,
    claim_number,
    insurance_company,
    insurance_company_phone,
    ...(insuranceDetails || {}),
  };

  if (vehicleData.insured === 1) {
    const existingInsurance = await InsuredVehicle.findOne({
      where: { vehicle_id: id, is_deleted: 0 },
    });

    if (existingInsurance) {
      await existingInsurance.update(resolvedInsurance);
    } else {
      await InsuredVehicle.create({
        vehicle_id: id,
        insurance_number: resolvedInsurance.insurance_number,
        policy_number: resolvedInsurance.policy_number,
        expiry_date: resolvedInsurance.expiry_date,
        claim_number: resolvedInsurance.claim_number,
        insurance_company: resolvedInsurance.insurance_company,
        insurance_company_phone: resolvedInsurance.insurance_company_phone,
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
