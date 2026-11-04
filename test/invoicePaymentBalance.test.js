'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateInvoiceBalance,
  determineVerificationStatus,
} = require('../src/utils/invoicePaymentBalance');

test('unchanged customer claim verifies for the claimed amount', () => {
  assert.equal(determineVerificationStatus(100, 100), 'verified');
  assert.equal(calculateInvoiceBalance(1200, 100), 1100);
});

test('lower adjusted payment determines the balance from the adjusted amount', () => {
  assert.equal(determineVerificationStatus(100, 80), 'verified_with_adjustment');
  assert.equal(calculateInvoiceBalance(1200, 80), 1120);
});

test('higher adjusted payment determines the balance from the adjusted amount', () => {
  assert.equal(determineVerificationStatus(100, 120), 'verified_with_adjustment');
  assert.equal(calculateInvoiceBalance(1200, 120), 1080);
});
