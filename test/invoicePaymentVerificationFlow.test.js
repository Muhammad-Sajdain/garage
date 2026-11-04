'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../models');
const { updatePayment } = require('../src/services/invoicePaymentService');
const { listInvoices } = require('../src/services/invoiceService');

const makeFlow = () => {
  const payment = {
    id: 10,
    company_id: 3,
    invoice_id: 7,
    invoice_type: 'Service',
    total_amount: 1200,
    balance_amount: 1100,
    paid_amount: 100,
    payment_method: 'online',
    payment_status: 'pending',
    payment_done_by: 'customer',
    created_by: 5,
    picture: 'proof.png',
    invoice: { invoice_number: 'INV-7' },
    async update(values) { Object.assign(this, values); return this; },
    toJSON() { return { ...this }; },
  };
  const invoice = {
    id: 7,
    total: 1200,
    invoice_number: 'INV-7',
    payment_status: 'pending',
    async update(values) { Object.assign(this, values); return this; },
  };
  const account = {
    current_amount: 0,
    async update(values) { Object.assign(this, values); return this; },
  };
  const sales = [];
  const expenses = [];
  const original = {
    transaction: db.sequelize.transaction,
    invoiceFindOne: db.Invoice.findOne,
    paymentFindOne: db.InvoicePayment.findOne,
    paymentFindAll: db.InvoicePayment.findAll,
    salesCreate: db.Sales.create,
    accountFindOne: db.CompanyAccount.findOne,
    accountCreate: db.CompanyAccount.create,
    expenseCreate: db.CompanyExpense.create,
  };

  db.sequelize.transaction = async () => ({
    LOCK: { UPDATE: 'UPDATE' },
    async commit() {},
    async rollback() {},
  });
  db.Invoice.findOne = async () => invoice;
  db.InvoicePayment.findOne = async () => payment;
  db.InvoicePayment.findAll = async () => {
    if (['rejected'].includes(payment.payment_status)) return [];
    return [{
      invoice_id: payment.invoice_id,
      payment_status: payment.payment_status,
      paid_amount: payment.paid_amount,
    }];
  };
  db.Sales.create = async (row) => { sales.push(row); return row; };
  db.CompanyAccount.findOne = async () => account;
  db.CompanyAccount.create = async (row) => Object.assign(account, row);
  db.CompanyExpense.create = async (row) => { expenses.push(row); return row; };

  return {
    payment,
    invoice,
    account,
    sales,
    expenses,
    restore() {
      db.sequelize.transaction = original.transaction;
      db.Invoice.findOne = original.invoiceFindOne;
      db.InvoicePayment.findOne = original.paymentFindOne;
      db.InvoicePayment.findAll = original.paymentFindAll;
      db.Sales.create = original.salesCreate;
      db.CompanyAccount.findOne = original.accountFindOne;
      db.CompanyAccount.create = original.accountCreate;
      db.CompanyExpense.create = original.expenseCreate;
    },
  };
};

const cases = [
  { paidAmount: 100, expectedStatus: 'verified', expectedBalance: 1100 },
  { paidAmount: 80, expectedStatus: 'verified_with_adjustment', expectedBalance: 1120 },
  { paidAmount: 120, expectedStatus: 'verified_with_adjustment', expectedBalance: 1080 },
];

test('customer online claims immediately reduce the service invoice listing balance', async () => {
  const originalInvoiceFindAll = db.Invoice.findAll;
  const originalPaymentFindAll = db.InvoicePayment.findAll;
  db.Invoice.findAll = async () => [{
    id: 7,
    total: 1200,
    payment_status: 'pending',
    toJSON() { return { id: 7, total: 1200, payment_status: 'pending' }; },
  }];
  db.InvoicePayment.findAll = async () => [{
    invoice_id: 7,
    payment_status: 'pending',
    paid_amount: 100,
  }];

  try {
    const [invoice] = await listInvoices();
    assert.equal(invoice.balance_amount, 1100);
    assert.equal(invoice.pending_payment_amount, 100);
    assert.equal(invoice.paid_amount, 0);
    assert.equal(invoice.payment_status, 'pending');
  } finally {
    db.Invoice.findAll = originalInvoiceFindAll;
    db.InvoicePayment.findAll = originalPaymentFindAll;
  }
});

for (const scenario of cases) {
  test(`verifies $${scenario.paidAmount} and sets the invoice balance to $${scenario.expectedBalance}`, async () => {
    const flow = makeFlow();
    try {
      const result = await updatePayment(10, {
        paid_amount: String(scenario.paidAmount),
        payment_status: 'verified',
      }, null, 42);

      assert.equal(result.paid_amount, scenario.paidAmount);
      assert.equal(result.payment_status, scenario.expectedStatus);
      assert.equal(result.balance_amount, scenario.expectedBalance);
      assert.equal(flow.invoice.payment_status, 'pending');
      assert.equal(flow.sales.length, 1);
      assert.equal(flow.sales[0].amount, scenario.paidAmount);
      assert.equal(flow.account.current_amount, scenario.paidAmount);
      assert.equal(flow.expenses[0].amount, scenario.paidAmount);
      assert.equal(flow.payment.verified_by, 42);
      assert.ok(flow.payment.verifiedAt instanceof Date);
    } finally {
      flow.restore();
    }
  });
}
