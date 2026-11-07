const SupplyRequest = require("./schema");
const Store = require("../stores/schema");
const Product = require("../products/schema");
const User = require("../users/schema");
const NotFoundException = require("../../exceptions/auth/NotFoundException");
const ForbiddenException = require("../../exceptions/auth/ForbiddenException");

const findAll = async (filters, currentUser) => {
  const { store, product, state } = filters;
  const query = {};
  if (currentUser.role === "employee") {
    query.store = currentUser.store;
  } else if (store) {
    query.store = store;
  }
  if (product) query.product = product;
  if (state) query.state = state;

  return await SupplyRequest.find(query)
    .populate("product", "name price category")
    .populate("store", "name")
    .populate("requestedBy", "name surname")
    .sort({ createdAt: -1 });
};

const findOne = async (supplyId, currentUser) => {
  const supplyRequest = await SupplyRequest.findById(supplyId)
    .populate("product", "name price category image")
    .populate("requestedBy", "name surname")
    .populate("store", "name");
  if (
    !supplyRequest ||
    (currentUser.role === "employee" &&
      supplyRequest.store._id.toString() !== currentUser.store.toString())
  ) {
    throw new NotFoundException("Supply Request not found");
  }
  return supplyRequest;
};

const create = async (supplyData, currentUser) => {
  const product = await Product.findById(supplyData.product);
  if (!product || !product.active) {
    throw new NotFoundException("Product not found");
  }
  const supplyRequest = new SupplyRequest({
    product: supplyData.product,
    requestedAmount: supplyData.requestedAmount,
    requestedBy: currentUser._id,
    store: currentUser.store,
  });
  return await supplyRequest.save();
};

const update = async (supplyId, supplyData) => {
  const supplyRequest = await SupplyRequest.findById(supplyId);
  if (!supplyRequest) {
    throw new NotFoundException("Supply request not found");
  }
  Object.entries(supplyData).forEach(([field, value]) => {
    if (value !== undefined) {
      supplyRequest[field] = value;
    }
  });
  return await supplyRequest.save();
};

const deleteSupplyRequest = async (supplyId, currentUser) => {
  const supplyRequest = await SupplyRequest.findById(supplyId);
  if (
    !supplyRequest ||
    (currentUser.role === "employee" &&
      supplyRequest.requestedBy.toString() !== currentUser._id.toString())
  ) {
    throw new NotFoundException("Supply request not found");
  }
  if (currentUser.role === "employee" && supplyRequest.state !== "open") {
    throw new ForbiddenException("Handled requests cannot be deleted");
  }
  await supplyRequest.deleteOne();
};

module.exports = {
  findAll,
  findOne,
  create,
  update,
  deleteSupplyRequest,
};
