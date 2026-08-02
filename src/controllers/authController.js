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

module.exports = {
  loginAdmin,
  loginUser,
};
