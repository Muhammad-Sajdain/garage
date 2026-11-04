'use strict';

const BALANCE_PAYMENT_STATUSES = Object.freeze([
  'pending',
  'verified',
  'verified_with_adjustment',
]);

const VERIFIED_PAYMENT_STATUSES = Object.freeze([
  'verified',
  'verified_with_adjustment',
]);

const toCents = (value) => Math.round((Number(value) + Number.EPSILON) * 100);

const calculateInvoiceBalance = (total, paidAmount) =>
  Math.max(0, (toCents(total) - toCents(paidAmount)) / 100);

const isInvoiceFullyPaid = (total, verifiedAmount) =>
  toCents(total) > 0 && calculateInvoiceBalance(total, verifiedAmount) === 0;

const determineVerificationStatus = (originalAmount, finalAmount) =>
  toCents(originalAmount) === toCents(finalAmount)
    ? 'verified'
    : 'verified_with_adjustment';

module.exports = {
  BALANCE_PAYMENT_STATUSES,
  VERIFIED_PAYMENT_STATUSES,
  calculateInvoiceBalance,
  determineVerificationStatus,
  isInvoiceFullyPaid,
  toCents,
};
