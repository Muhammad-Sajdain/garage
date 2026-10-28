const express = require('express');
const path = require('path');
const routes = require('./routes');
const paginationMiddleware = require('./middleware/paginationMiddleware');
const { healthCheck } = require('./controllers/healthController');

const app = express();

app.use(express.json());
app.get('/health', healthCheck);
app.use('/company_logo', express.static(path.join(__dirname, '../uploads/company_logo')));
app.use('/original_company_logo', express.static(path.join(__dirname, '../uploads/original_company_logo')));
app.use('/profile-pictures', express.static(path.join(__dirname, '../uploads/profile-pictures')));
app.use('/quotation_files', express.static(path.join(__dirname, '../uploads/quotations_files')));
app.use('/payment_proof_images', express.static(path.join(__dirname, '../uploads/payment_proof_images')));
app.use(paginationMiddleware);
app.use('/api', (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store',
  });
  next();
}, routes);

module.exports = app;
