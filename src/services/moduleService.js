const db = require('../../models');

const { Module, SubModule } = db;

const normalizeSubModules = (subModules) => {
  const values = Array.isArray(subModules) ? subModules : [subModules];
  const names = values
    .map((item) => (typeof item === 'object' ? item?.name ?? item?.value : item))
    .map((item) => String(item ?? '').trim())
    .filter(Boolean);

  if (!names.length) throw new Error('At least one sub module is required');
  return names;
};

const moduleInclude = {
  model: SubModule,
  as: 'subModules',
  where: { is_deleted: 0 },
  required: false,
};

const listModules = () => Module.findAll({
  where: { is_deleted: 0 },
  include: [moduleInclude],
  order: [['id', 'ASC'], [{ model: SubModule, as: 'subModules' }, 'id', 'ASC']],
});

const getModuleById = (id, options = {}) => Module.findOne({
  where: { id, is_deleted: 0 },
  include: [moduleInclude],
  ...options,
});

const createModule = async ({ name, status = 1, sub_modules }) => {
  if (!String(name ?? '').trim()) throw new Error('name is required');
  const subModuleNames = normalizeSubModules(sub_modules);

  return db.sequelize.transaction(async (transaction) => {
    const moduleRecord = await Module.create({
      name: String(name).trim(),
      status,
      is_deleted: 0,
    }, { transaction });

    await SubModule.bulkCreate(subModuleNames.map((subModuleName) => ({
      module_id: moduleRecord.id,
      name: subModuleName,
      status: 1,
      is_deleted: 0,
    })), { transaction });

    return getModuleById(moduleRecord.id, { transaction });
  });
};

const updateModule = async (id, { name, status, sub_modules }) => {
  const moduleRecord = await Module.findOne({ where: { id, is_deleted: 0 } });
  if (!moduleRecord) throw new Error('Module not found');

  if (name !== undefined && !String(name).trim()) throw new Error('name cannot be empty');
  const subModuleNames = sub_modules === undefined ? null : normalizeSubModules(sub_modules);

  return db.sequelize.transaction(async (transaction) => {
    await moduleRecord.update({
      ...(name !== undefined && { name: String(name).trim() }),
      ...(status !== undefined && { status }),
    }, { transaction });

    if (subModuleNames) {
      await SubModule.update(
        { is_deleted: 1 },
        { where: { module_id: id, is_deleted: 0 }, transaction },
      );
      await SubModule.bulkCreate(subModuleNames.map((subModuleName) => ({
        module_id: id,
        name: subModuleName,
        status: 1,
        is_deleted: 0,
      })), { transaction });
    }

    return getModuleById(id, { transaction });
  });
};

const deleteModule = async (id) => {
  const moduleRecord = await Module.findOne({ where: { id, is_deleted: 0 } });
  if (!moduleRecord) throw new Error('Module not found');

  await db.sequelize.transaction(async (transaction) => {
    await moduleRecord.update({ is_deleted: 1 }, { transaction });
    await SubModule.update(
      { is_deleted: 1 },
      { where: { module_id: id, is_deleted: 0 }, transaction },
    );
  });

  return { success: true, message: 'Module deleted successfully' };
};

module.exports = { listModules, getModuleById, createModule, updateModule, deleteModule };
