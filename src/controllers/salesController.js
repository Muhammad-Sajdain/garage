const salesService = require('../services/salesService');

const listSales = async (req, res) => {
  try {
    const sales = await salesService.listSales(req.query);
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { listSales };
