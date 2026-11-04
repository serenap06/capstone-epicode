const Stock = require("./schema");
const Product = require("../products/schema");
const Store = require("../stores/schema");
const NotFoundException = require("../../exceptions/auth/NotFoundException");

const findAll = async (filters, currentUser) => {
  const { store, product, lowStock } = filters;
  const query = {};
  if (currentUser.role === "employee") {
    query.store = currentUser.store;
  } else if (store) {
    query.store = store;
  }
  if (product) query.product = product;
  if (lowStock) query.$expr = { $lte: ["$amount", "$minThreshold"] };

  return await Stock.find(query)
    .populate("product", "name price category image")
    .populate("store", "name");
};

const findOne = async (stockId, currentUser) => {
  const stock = await Stock.findById(stockId)
    .populate("product", "name price category image")
    .populate("store", "name");

  if (
    !stock ||
    (currentUser.role === "employee" &&
      stock.store._id.toString() !== currentUser.store.toString())
  ) {
    throw new NotFoundException("Stock not found");
  }
  return stock;
};

const create = async (stockData) => {
  const productExists = await Product.exists({ _id: stockData.product });
  if (!productExists) {
    throw new NotFoundException("Product not found");
  }
  const storeExists = await Store.exists({ _id: stockData.store });
  if (!storeExists) {
    throw new NotFoundException("Store not found");
  }
  const stock = new Stock(stockData);
  return await stock.save();
};

const update = async (stockId, stockData) => {
  const stock = await Stock.findById(stockId);
  if (!stock) {
    throw new NotFoundException("Stock not found");
  }
  Object.entries(stockData).forEach(([field, value]) => {
    if (value !== undefined) {
      stock[field] = value;
    }
  });
  return await stock.save();
};

const deleteStock = async (stockId) => {
  const deletedStock = await Stock.findByIdAndDelete(stockId);
  if (!deletedStock) {
    throw new NotFoundException("Stock not found");
  }
};

module.exports = {
  findAll,
  findOne,
  create,
  update,
  deleteStock,
};
