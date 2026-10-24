const usersService = require('../services/usersService');
const profilePictureService = require('../services/profilePictureService');

const withProfilePictureUrl = (req, user) => {
  if (!user) return user;
  const json = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
  if (json.logo && !/^https?:\/\//i.test(json.logo)) {
    json.logo = `${req.protocol}://${req.get('host')}/profile-pictures/${encodeURIComponent(json.logo)}`;
  }
  delete json.password;
  return json;
};

const getUsers = async (req, res) => {
  try {
    const users = await usersService.listUsers();
    res.json({ success: true, data: users.map((user) => withProfilePictureUrl(req, user)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, data: withProfilePictureUrl(req, user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const user = await usersService.createUser(req.body, req.file);
    res.status(201).json({ success: true, data: withProfilePictureUrl(req, user) });
  } catch (error) {
    profilePictureService.removeUploadedFile(req.file);
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await usersService.updateUser(req.params.id, req.body, req.file);
    res.json({ success: true, data: withProfilePictureUrl(req, user) });
  } catch (error) {
    profilePictureService.removeUploadedFile(req.file);
    if (error.message === 'User not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await usersService.deleteUser(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
