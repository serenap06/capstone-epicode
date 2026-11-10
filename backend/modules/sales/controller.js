const saleService = require("./service");

const findAll = async (req, res, next) => {
  try {
    const { store, soldBy, from, to, page, limit } = req.query;
    const result = await saleService.findAll(
      {
        store,
        soldBy,
        from,
        to,
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

const create = async (req, res, next) => {
  try {
    const { items, paymentMethod } = req.body;
    const sale = await saleService.create({ items, paymentMethod }, req.user);
    res.status(201).send({
      statusCode: 201,
      message: "Sale registered",
      sale,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = { findAll, create };
