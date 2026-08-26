const authService = require('../services/authService');

const loginAdmin = async (req, res) => {
  try {
    const result = await authService.loginAdmin(req.body);
    res.json(result);
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    res.json(result);
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const loginCustomer = async (req, res) => {
  try {
    const result = await authService.loginCustomer(req.body);
    res.json(result);
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication is required' });
  }

  try {
    const result = await authService.changePassword(token, req.body.newPassword);
    return res.json(result);
  } catch (error) {
    const status = /session|Authentication/.test(error.message) ? 401 : 400;
    return res.status(status).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication is required' });
  }

  try {
    const result = await authService.updateProfile(token, req.body);
    return res.json(result);
  } catch (error) {
    const status = /session|Authentication/.test(error.message) ? 401 : 400;
    return res.status(status).json({ success: false, message: error.message });
  }
};

module.exports = {
  loginAdmin,
  loginUser,
  loginCustomer,
  changePassword,
  updateProfile,
};
