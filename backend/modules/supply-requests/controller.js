const supplyRequestService = require("./service");

const findAll = async (req, res, next) => {
  try {
    const { store, product, state, search, sortBy, order, page, limit } =
      req.query;
    const result = await supplyRequestService.findAll(
      { store, product, state, search, sortBy, order, page, limit },
      req.user,
    );
    res.status(200).send({
      statusCode: 200,
      supplyRequests: result.supplyRequests,
      totals: result.totals,
      pagination: result.pagination,
    });
  } catch (e) {
    next(e);
  }
};
const findOne = async (req, res, next) => {
  try {
    const { supplyId } = req.params;
    const supplyRequest = await supplyRequestService.findOne(
      supplyId,
      req.user,
    );
    res.status(200).send({
      statusCode: 200,
      supplyRequest,
    });
  } catch (e) {
    next(e);
  }
};
const create = async (req, res, next) => {
  try {
    const { product, requestedAmount } = req.body;
    const supplyRequest = await supplyRequestService.create(
      { product, requestedAmount },
      req.user,
    );
    res.status(201).send({
      statusCode: 201,
      message: "Supply request created successfully",
      supplyRequest,
    });
  } catch (e) {
    next(e);
  }
};
const update = async (req, res, next) => {
  try {
    const { supplyId } = req.params;
    const { state, reason } = req.body;
    const supplyRequest = await supplyRequestService.update(
      supplyId,
      { state, reason },
      req.user,
    );
    res.status(200).send({
      statusCode: 200,
      message: "Supply request updated successfully",
      supplyRequest,
    });
  } catch (e) {
    next(e);
  }
};
const deleteSupplyRequest = async (req, res, next) => {
  try {
    const { supplyId } = req.params;
    await supplyRequestService.deleteSupplyRequest(supplyId, req.user);
    res.status(200).send({
      statusCode: 200,
      message: "Supply request deleted successfully",
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  findAll,
  findOne,
  create,
  update,
  deleteSupplyRequest,
};
