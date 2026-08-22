const express = require('express');
const path = require('path');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use('/company_logo', express.static(path.join(__dirname, '../uploads/company_logo')));
app.use('/original_company_logo', express.static(path.join(__dirname, '../uploads/original_company_logo')));
app.use('/quotation_files', express.static(path.join(__dirname, '../uploads/quotations_files')));
app.use('/payment_proof_images', express.static(path.join(__dirname, '../uploads/payment_proof_images')));
app.use('/api', routes);

module.exports = app;
