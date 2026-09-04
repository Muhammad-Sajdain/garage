const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function paginationMiddleware(req, res, next) {
  if (req.method !== 'GET') return next();

  const requestedPage = Number.parseInt(req.query.page, 10);
  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
    ? Math.min(requestedLimit, MAX_LIMIT)
    : DEFAULT_LIMIT;
  const sendJson = res.json.bind(res);
  const search = String(req.query.search || '').trim().toLowerCase();
  const status = req.query.status && String(req.query.status).toLowerCase();
  const dateField = String(req.query.dateField || 'createdAt');
  const startDate = req.query.startDate ? new Date(`${req.query.startDate}T00:00:00`) : null;
  const endDate = req.query.endDate ? new Date(`${req.query.endDate}T23:59:59.999`) : null;

  res.json = (body) => {
    if (!body || body.success !== true || !Array.isArray(body.data)) {
      return sendJson(body);
    }

    const filteredData = body.data.filter((record) => {
      const matchesSearch = !search || JSON.stringify(record).toLowerCase().includes(search);
      const matchesStatus = !status || status === 'all' || String(record.status ?? '').toLowerCase() === status;
      const rawDate = record[dateField] ?? record[dateField.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)];
      const recordDate = rawDate ? new Date(rawDate) : null;
      const matchesStart = !startDate || (recordDate && recordDate >= startDate);
      const matchesEnd = !endDate || (recordDate && recordDate <= endDate);
      return matchesSearch && matchesStatus && matchesStart && matchesEnd;
    });
    const total = filteredData.length;
    const statusCounts = filteredData.reduce((counts, record) => {
      if (record && record.status !== undefined && record.status !== null) {
        const status = String(record.status).toLowerCase();
        counts[status] = (counts[status] || 0) + 1;
      }
      return counts;
    }, {});
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * limit;

    return sendJson({
      ...body,
      data: filteredData.slice(start, start + limit),
      total,
      page: currentPage,
      totalPages,
      limit,
      statusCounts,
    });
  };

  next();
}

module.exports = paginationMiddleware;