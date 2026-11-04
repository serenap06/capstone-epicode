const stockService = require("./service");

const findAll = async (req, res, next) => {
  try {
    const { store, product, lowStock } = req.query;
    const stocks = await stockService.findAll(
      { store, product, lowStock },
      req.user,
    );
    res.status(200).send({
      statusCode: 200,
      stocks,
    });
  } catch (e) {
    next(e);
  }
};

const findOne = async (req, res, next) => {
  try {
    const { stockId } = req.params;
    const stock = await stockService.findOne(stockId, req.user);
    res.status(200).send({
      statusCode: 200,
      stock,
    });
  } catch (e) {
    next(e);
  }
};

const create = async (req, res, next) => {
  try {
    const { product, store, amount, minThreshold } = req.body;
    const stock = await stockService.create({
      product,
      store,
      amount,
      minThreshold,
    });
    res.status(201).send({
      statusCode: 201,
      message: "Stock created successfully",
      stock,
    });
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const { stockId } = req.params;
    const { amount, minThreshold } = req.body;
    const stock = await stockService.update(stockId, {
      amount,
      minThreshold,
    });
    res.status(200).send({
      statusCode: 200,
      message: "Stock updated successfully",
      stock,
    });
  } catch (e) {
    next(e);
  }
};

const deleteStock = async (req, res, next) => {
  try {
    const { stockId } = req.params;
    await stockService.deleteStock(stockId);
    res.status(200).send({
      statusCode: 200,
      message: "Stock deleted successfully",
    });
  } catch (e) {
    next(e);
  }
};

module.exports = { findAll, findOne, create, update, deleteStock };
