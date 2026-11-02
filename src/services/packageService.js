const db = require('../../models');

const Package = db.Package;
const PackageInfo = db.PackageInfo;

const normalizeInformation = (information) => {
  if (Array.isArray(information)) {
    return information.filter((item) => item && String(item).trim() !== '');
  }

  if (typeof information === 'string' && information.trim() !== '') {
    return [information];
  }

  return [];
};

const listPackages = async () => {
  return Package.findAll({
    where: { is_deleted: 0 },
    include: [{
      model: PackageInfo,
      as: 'packageInfos',
      where: { is_deleted: 0 },
      required: false,
    }],
    order: [['id', 'ASC']],
  });
};

const getPackageById = async (id) => {
  return Package.findOne({
    where: { id, is_deleted: 0 },
    include: [{
      model: PackageInfo,
      as: 'packageInfos',
      where: { is_deleted: 0 },
      required: false,
    }],
  });
};

const createPackage = async (payload) => {
  const { name, monthly, yearly, status = 1, information } = payload;
  const cleanedInformation = normalizeInformation(information);

  const createdPackage = await Package.create({
    name,
    monthly,
    yearly,
    status,
    is_deleted: 0,
  });

  if (cleanedInformation.length > 0) {
    await PackageInfo.bulkCreate(
      cleanedInformation.map((item) => ({
        package_id: createdPackage.id,
        information: item,
        status: 1,
        is_deleted: 0,
      }))
    );
  }

  return getPackageById(createdPackage.id);
};

const updatePackage = async (id, payload) => {
  const { name, monthly, yearly, status, information } = payload;
  const packageRecord = await Package.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!packageRecord) {
    throw new Error('Package not found');
  }

  await packageRecord.update({
    ...(name !== undefined && { name }),
    ...(monthly !== undefined && { monthly }),
    ...(yearly !== undefined && { yearly }),
    ...(status !== undefined && { status }),
  });

  if (information !== undefined) {
    const cleanedInformation = normalizeInformation(information);

    await PackageInfo.update(
      { is_deleted: 1 },
      { where: { package_id: id, is_deleted: 0 } }
    );

    if (cleanedInformation.length > 0) {
      await PackageInfo.bulkCreate(
        cleanedInformation.map((item) => ({
          package_id: id,
          information: item,
          status: 1,
          is_deleted: 0,
        }))
      );
    }
  }

  return getPackageById(id);
};

const deletePackage = async (id) => {
  const packageRecord = await Package.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!packageRecord) {
    throw new Error('Package not found');
  }

  await Package.update({ is_deleted: 1 }, { where: { id } });
  await PackageInfo.update(
    { is_deleted: 1 },
    { where: { package_id: id, is_deleted: 0 } }
  );

  return { success: true, message: 'Package deleted successfully' };
};

module.exports = {
  listPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
};
