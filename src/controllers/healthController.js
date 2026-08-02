const healthCheck = (req, res) => {
  res.json({ success: true, message: 'Garage API is healthy' });
};

module.exports = { healthCheck };
