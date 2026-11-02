const Store = require("./schema");
const User = require("../users/schema");

const NotFoundException = require("../../exceptions/auth/NotFoundException");

const findAll = async () => {
  return Store.find().populate("users","name").sort({ name: 1 });
};

const findOne = async (storeId) => {
  const store = await Store.findById(storeId).populate("users", "name surname");
  if (!store) {
    throw new NotFoundException("Store not found");
  }
  return store;
};

const create = async (storeData) => {
  const store = new Store(storeData);
  return await store.save();
};

const update = async (storeId, storeData) => {
  const store = await Store.findByIdAndUpdate(storeId, storeData, {
    new: true,
    runValidators: true,
  });
  if (!store) {
    throw new NotFoundException("Store not found");
  }
  return store;
};

const deleteStore = async (storeId) => {
  const store = await Store.findByIdAndDelete(storeId);
  if (!store) {
    throw new NotFoundException("Store not found");
  }
};

module.exports = {
  findAll,
  findOne,
  create,
  update,
  deleteStore,
};
