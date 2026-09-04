// src/controllers/dashboardController.js
const db = require('../../models');
const { Op } = require('sequelize');

const getCompanyDashboardStats = async (req, res) => {
  try {
    const companyId = req.query.company_id || req.body.company_id;
    if (!companyId) return res.status(400).json({ success: false, message: 'company_id is required' });

    const company_id = Number(companyId);
    const startDate = req.query.startDate ? new Date(`${req.query.startDate}T00:00:00`) : null;
    const endDate = req.query.endDate ? new Date(`${req.query.endDate}T23:59:59.999`) : null;
    const createdBetween = startDate && endDate ? { createdAt: { [Op.between]: [startDate, endDate] } } : {};

    const [
      revenue,
      pendingInvoices,
      pendingQuotations,
      pendingPayments,
      totalEmployees,
      totalCustomers,
      totalVehicles,
      totalAppointments,
      totalTaskCards,
      taskCardRows,
    ] = await Promise.all([
      // Total Revenue (sum from sales)
      db.Sales.sum('amount', { where: { company_id, is_deleted: 0, ...createdBetween } }),
      // Total Pending Invoices (invoice_status = 'pending')
      db.Invoice.count({ where: { company_id, is_deleted: 0, invoice_status: 'pending', ...createdBetween } }),
      // Total Pending Quotations (quotation_status in draft,pending)
      db.Quotation.count({ where: { company_id, is_deleted: 0, quotation_status: { [Op.in]: ['draft', 'pending'] }, ...createdBetween } }),
      // Total Pending Payments (invoice_payments with payment_status pending or not_verified)
      db.InvoicePayment.count({ where: { company_id, is_deleted: 0, payment_status: { [Op.in]: ['pending', 'not_verified'] }, ...createdBetween } }),
      // Total Employees (company_users)
      db.CompanyUser.count({ where: { company_id, status: 1, is_deleted: 0, ...createdBetween } }),
      // Total Customers
      db.Customer.count({ where: { company_id, is_deleted: 0, ...createdBetween } }),
      // Total Vehicles — vehicles don't have company_id; join via Customer
      db.Vehicle.count({
        where: { is_deleted: 0 },
        include: [{ model: db.Customer, as: 'customer', where: { company_id, is_deleted: 0 } }],
      }),
      // Total Appointments
      db.Appointment.count({ where: { company_id, is_deleted: 0, ...createdBetween } }),
      // Total Task Cards
      db.TaskCard.count({ where: { company_id, is_deleted: 0, ...createdBetween } }),
      // fetch task card ids to count tasks by status
      db.TaskCard.findAll({ where: { company_id, is_deleted: 0, ...createdBetween }, attributes: ['id'] }),
    ]);

    const taskCardIds = (taskCardRows || []).map((r) => r.id);

    let totalTasks = 0;
    let totalPendingTasks = 0;
    let totalCompletedTasks = 0;
    let totalInProgressTasks = 0;

    if (taskCardIds.length > 0) {
      const [
        tasksCount,
        pendingCount,
        completedCount,
        inProgressCount,
      ] = await Promise.all([
        db.Task.count({ where: { task_card_id: { [Op.in]: taskCardIds }, is_deleted: 0 } }),
        db.Task.count({ where: { task_card_id: { [Op.in]: taskCardIds }, is_deleted: 0, task_status: 'pending' } }),
        db.Task.count({ where: { task_card_id: { [Op.in]: taskCardIds }, is_deleted: 0, task_status: { [Op.in]: ['compeleted', 'completed'] } } }),
        db.Task.count({ where: { task_card_id: { [Op.in]: taskCardIds }, is_deleted: 0, task_status: { [Op.in]: ['Inprogress', 'inprogress', 'in-progress', 'in progress'] } } }),
      ]);

      totalTasks = tasksCount;
      totalPendingTasks = pendingCount;
      totalCompletedTasks = completedCount;
      totalInProgressTasks = inProgressCount;
    }

    return res.json({
      success: true,
      data: {
        totalRevenue: Number(revenue || 0),
        totalPendingInvoices: Number(pendingInvoices || 0),
        totalPendingQuotations: Number(pendingQuotations || 0),
        totalPendingPayments: Number(pendingPayments || 0),

        totalEmployees: Number(totalEmployees || 0),
        totalCustomers: Number(totalCustomers || 0),
        totalVehicles: Number(totalVehicles || 0),
        totalAppointments: Number(totalAppointments || 0),

        totalTaskCards: Number(totalTaskCards || 0),
        totalTasks: Number(totalTasks || 0),
        totalPendingTasks: Number(totalPendingTasks || 0),
        totalCompletedTasks: Number(totalCompletedTasks || 0),
        totalInProgressTasks: Number(totalInProgressTasks || 0),
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getCompanyRevenueOverview = async (req, res) => {
  try {
    const companyId = req.query.company_id || req.body.company_id
    if (!companyId) return res.status(400).json({ success: false, message: 'company_id is required' })
    const company_id = Number(String(companyId).replace(/^c/i, ''))

    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months.push({ date: d, key })
    }

    const selectedStartDate = req.query.startDate ? new Date(`${req.query.startDate}T00:00:00`) : months[0].date
    const selectedEndDate = req.query.endDate ? new Date(`${req.query.endDate}T23:59:59.999`) : new Date()

    // raw queries to aggregate by YYYY-MM (works reliably across dialects)
    const salesQuery = `SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, SUM(amount) AS total FROM sales WHERE company_id = ? AND is_deleted = 0 AND createdAt >= ? GROUP BY month ORDER BY month ASC`
    // company_expenses model does not define `is_deleted`, so omit that filter
    const expensesQuery = `SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, SUM(amount) AS total FROM company_expenses WHERE company_id = ? AND transaction_type = 'Debit' AND createdAt >= ? GROUP BY month ORDER BY month ASC`

    const replacements = [company_id, selectedStartDate, selectedEndDate]

    const salesRows = await db.sequelize.query(salesQuery.replace('createdAt >= ?', 'createdAt >= ? AND createdAt <= ?'), { replacements, type: db.Sequelize.QueryTypes.SELECT })
    const expenseRows = await db.sequelize.query(expensesQuery.replace('createdAt >= ?', 'createdAt >= ? AND createdAt <= ?'), { replacements, type: db.Sequelize.QueryTypes.SELECT })

    const revenueMap = new Map(salesRows.map((r) => [r.month, Number(r.total || 0)]))
    const expenseMap = new Map(expenseRows.map((r) => [r.month, Number(r.total || 0)]))

    const labels = months.map((m) => m.key)
    const revenue = labels.map((k) => revenueMap.get(k) || 0)
    const expenses = labels.map((k) => expenseMap.get(k) || 0)

    return res.json({ success: true, data: { labels, revenue, expenses } })
  } catch (err) {
    console.error('Revenue overview error:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

const getCompanyTasksDoughnut = async (req, res) => {
  try {
    const companyId = req.query.company_id || req.body.company_id;
    if (!companyId) return res.status(400).json({ success: false, message: 'company_id is required' });
    const company_id = Number(companyId);
    const startDate = req.query.startDate ? new Date(`${req.query.startDate}T00:00:00`) : null;
    const endDate = req.query.endDate ? new Date(`${req.query.endDate}T23:59:59.999`) : null;
    const createdBetween = startDate && endDate ? { createdAt: { [Op.between]: [startDate, endDate] } } : {};

    // Total Task Cards for the company
    const totalTaskCards = await db.TaskCard.count({ where: { company_id, is_deleted: 0, ...createdBetween } });

    // Get task card ids for the company
    const taskCardRows = await db.TaskCard.findAll({ where: { company_id, is_deleted: 0, ...createdBetween }, attributes: ['id'] });
    const taskCardIds = (taskCardRows || []).map((r) => r.id);

    let totalTasks = 0;
    let totalPendingTasks = 0;
    let totalCompletedTasks = 0;
    let totalInProgressTasks = 0;

    if (taskCardIds.length > 0) {
      const [tasksCount, pendingCount, completedCount, inProgressCount] = await Promise.all([
        db.Task.count({ where: { task_card_id: { [Op.in]: taskCardIds }, is_deleted: 0 } }),
        db.Task.count({ where: { task_card_id: { [Op.in]: taskCardIds }, is_deleted: 0, task_status: 'pending' } }),
        db.Task.count({ where: { task_card_id: { [Op.in]: taskCardIds }, is_deleted: 0, task_status: { [Op.in]: ['compeleted', 'completed'] } } }),
        db.Task.count({ where: { task_card_id: { [Op.in]: taskCardIds }, is_deleted: 0, task_status: { [Op.in]: ['Inprogress', 'inprogress', 'in-progress', 'in progress'] } } }),
      ]);

      totalTasks = tasksCount;
      totalPendingTasks = pendingCount;
      totalCompletedTasks = completedCount;
      totalInProgressTasks = inProgressCount;
    }

    // Provide both totals and doughnut-friendly arrays
    const labels = ['Pending', 'In Progress', 'Completed'];
    const values = [Number(totalPendingTasks || 0), Number(totalInProgressTasks || 0), Number(totalCompletedTasks || 0)];

    return res.json({
      success: true,
      data: {
        totalTaskCards: Number(totalTaskCards || 0),
        totalTasks: Number(totalTasks || 0),
        totalPendingTasks: Number(totalPendingTasks || 0),
        totalCompletedTasks: Number(totalCompletedTasks || 0),
        totalInProgressTasks: Number(totalInProgressTasks || 0),
        doughnut: { labels, values },
      },
    });
  } catch (err) {
    console.error('Tasks doughnut error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCompanyDashboardStats, getCompanyRevenueOverview, getCompanyTasksDoughnut };
