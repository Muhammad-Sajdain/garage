// src/services/vehicleMaintenancePictureService.js
const db = require('../../models');
const { VehicleMaintenancePicture } = db;
const path = require('path');

// Helper: get full URL or relative path for stored picture
const getPicturePath = (filename) => path.join('uploads', 'vehicle_maintenance_pictures', filename);

// Fetch a picture record (soft‑delete safe)
const getById = async (id) => {
  return VehicleMaintenancePicture.findOne({ where: { id, is_deleted: 0 } });
};

// List with optional filters (task_card_id, company_id, picture_tag, status)
const list = async (filters = {}) => {
  const where = { is_deleted: 0, ...filters };
  return VehicleMaintenancePicture.findAll({ where, order: [['id', 'ASC']] });
};

// Create – supports multiple files via multer (req.files) and matching picture_tags array
const create = async (payload, files) => {
  const { task_card_id, company_id, picture_tag, status = 1, created_by, updated_by = null } = payload;

  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('At least one picture file must be uploaded');
  }

  // picture_tag may be a single value or an array matching files length
  let tags = [];
  if (Array.isArray(picture_tag)) {
    tags = picture_tag;
  } else if (typeof picture_tag === 'string') {
    // comma‑separated list
    tags = picture_tag.split(',').map(t => t.trim());
  }

  const rows = files.map((file, idx) => {
    const tag = tags[idx] || tags[0] || 'before'; // fallback
    return {
      task_card_id,
      company_id,
      picture: getPicturePath(file.filename),
      picture_tag: tag,
      status,
      created_by: created_by || 0,
      updated_by,
      is_deleted: 0
    };
  });

  await VehicleMaintenancePicture.bulkCreate(rows);
  // Return created rows
  return list({ task_card_id, company_id });
};

// Update – fields can be changed; optional new files replace/additional pictures
const update = async (id, payload, files) => {
  const pictureRecord = await VehicleMaintenancePicture.findOne({ where: { id, is_deleted: 0 } });
  if (!pictureRecord) throw new Error('Vehicle maintenance picture not found');

  const updatable = { ...payload };
  delete updatable.picture; // picture is handled via files
  delete updatable.picture_tag;

  await pictureRecord.update(updatable);

  if (Array.isArray(files) && files.length) {
    // create additional picture records linked to same task_card_id/company_id
    const { task_card_id, company_id } = pictureRecord;
    let tags = [];
    if (Array.isArray(payload.picture_tag)) tags = payload.picture_tag;
    else if (typeof payload.picture_tag === 'string') tags = payload.picture_tag.split(',').map(t => t.trim());
    const rows = files.map((file, idx) => {
      const tag = tags[idx] || tags[0] || 'before';
      return {
        task_card_id,
        company_id,
        picture: getPicturePath(file.filename),
        picture_tag: tag,
        status: payload.status !== undefined ? payload.status : pictureRecord.status,
        created_by: pictureRecord.created_by,
        updated_by: payload.updated_by || pictureRecord.updated_by,
        is_deleted: 0
      };
    });
    await VehicleMaintenancePicture.bulkCreate(rows);
  }

  return getById(id);
};

// Soft delete (set is_deleted = 1)
const remove = async (id) => {
  const pic = await VehicleMaintenancePicture.findOne({ where: { id, is_deleted: 0 } });
  if (!pic) throw new Error('Vehicle maintenance picture not found');
  await pic.update({ is_deleted: 1 });
  return { success: true, message: 'Deleted' };
};

module.exports = { getById, list, create, update, remove };
