// import
const saleService = require("./service");

// GET /api/sales: le vendite con filtri, pagine e totali
const findAll = async (req, res, next) => {
  try {
    const { store, soldBy, from, to, status, sortBy, order, page, limit } =
      req.query;
    const result = await saleService.findAll(
      {
        store,
        soldBy,
        from,
        to,
        status,
        sortBy,
        order,
        page,
        limit,
      },
      req.user,
    );
    res.status(200).send({
      statusCode: 200,
      sales: result.sales,
      totals: result.totals,
      pagination: result.pagination,
    });
  } catch (e) {
    next(e);
  }
};

// POST /api/sales: registro una vendita dalla Cassa
const create = async (req, res, next) => {
  try {
    const { items, paymentMethod } = req.body;
    const { sale, lowStock } = await saleService.create(
      { items, paymentMethod },
      req.user,
    );
    res.status(201).send({
      statusCode: 201,
      message: "Sale created successfully",
      sale,
      lowStock,
    });
  } catch (e) {
    next(e);
  }
};

// PATCH /api/sales/:saleId/cancel: annullo una vendita con il motivo
const cancel = async (req, res, next) => {
  try {
    const { saleId } = req.params;
    const { reason } = req.body;
    const sale = await saleService.cancel(saleId, reason, req.user);
    res.status(200).send({
      statusCode: 200,
      message: "Sale cancelled successfully",
      sale,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = { findAll, create, cancel };
