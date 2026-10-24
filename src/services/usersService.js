const bcrypt = require('bcrypt');
const db = require('../../models');
const profilePictureService = require('./profilePictureService');
const userWelcomeEmailService = require('./userWelcomeEmailService');

const Users = db.Users;
const DEFAULT_USER_PASSWORD = 'garage@123';

const listUsers = async () => {
  return Users.findAll({
    where: { is_deleted: 0 },
    order: [['id', 'ASC']],
  });
};

const getUserById = async (id) => {
  return Users.findOne({
    where: { id, is_deleted: 0 },
  });
};

const createUser = async (payload, file) => {
  const {
    name,
    country,
    state,
    email,
    phone,
    address,
    status = 1,
  } = payload;

  const hashedPassword = await bcrypt.hash(DEFAULT_USER_PASSWORD, 10);

  let logo;
  try {
    logo = await profilePictureService.saveProfilePicture(file);
    const user = await Users.create({
      name,
      country,
      state: state ?? '',
      email,
      password: hashedPassword,
      phone,
      address,
      logo,
      status,
      is_deleted: 0,
    });
    try {
      await userWelcomeEmailService.sendAccountCreatedEmail({ user });
    } catch (error) {
      console.error('User account welcome email failed:', error.message);
    }
    return user;
  } catch (error) {
    if (logo) profilePictureService.removeProfilePicture(logo);
    else profilePictureService.removeUploadedFile(file);
    throw error;
  }
};

const updateUser = async (id, payload, file) => {
  const user = await Users.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const updateData = { ...payload };
  const previousLogo = user.logo;
  let uploadedLogo;
  if (file) {
    uploadedLogo = await profilePictureService.saveProfilePicture(file);
    updateData.logo = uploadedLogo;
  } else if (payload.logo === null || payload.remove_logo === 'true') {
    updateData.logo = null;
  }

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  try {
    await user.update(updateData);
  } catch (error) {
    if (uploadedLogo) profilePictureService.removeProfilePicture(uploadedLogo);
    else profilePictureService.removeUploadedFile(file);
    throw error;
  }
  if (uploadedLogo && previousLogo) profilePictureService.removeProfilePicture(previousLogo);
  if (!uploadedLogo && updateData.logo === null && previousLogo) profilePictureService.removeProfilePicture(previousLogo);
  return getUserById(id);
};

const deleteUser = async (id) => {
  const user = await Users.findOne({
    where: { id, is_deleted: 0 },
  });

  if (!user) {
    throw new Error('User not found');
  }

  await user.update({ is_deleted: 1 });
  return { success: true, message: 'User deleted successfully' };
};

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
