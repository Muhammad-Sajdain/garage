'use strict';

const packageSaleService = require('../services/packageSaleService');

const getPackageSales = async (_req, res) => {
  try {
    const data = await packageSaleService.listPackageSales();
    return res.status(200).json({ success: true, data, total: data.length, totalPages: 1 });
  } catch (error) {
    console.error('Failed to load company sales:', error);
    return res.status(500).json({ success: false, message: 'Unable to load company sales.' });
  }
};

module.exports = { getPackageSales };
