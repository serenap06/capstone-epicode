const Store = require("./schema");
const User = require("../users/schema");
const Sale = require("../sales/schema");
const Stock = require("../stock/schema");
const SupplyRequest = require("../supply-requests/schema");
const Shift = require("../shifts/schema");
const Task = require("../tasks/schema");

const NotFoundException = require("../../exceptions/auth/NotFoundException");
const HttpException = require("../../exceptions");

const findAll = async () => {
  return Store.find().populate("users", "name surname").sort({ name: 1 });
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
    returnDocument: "after",
    runValidators: true,
  });
  if (!store) {
    throw new NotFoundException("Store not found");
  }
  return store;
};

// un negozio con del personale o con delle vendite non si elimina:
// le persone resterebbero senza negozio e le vendite servono per i conti.
// Con il negozio tolgo anche le sue giacenze, richieste, turni e task
const deleteStore = async (storeId) => {
  const [employeeCount, saleCount] = await Promise.all([
    User.countDocuments({ store: storeId }),
    Sale.countDocuments({ store: storeId }),
  ]);
  if (employeeCount > 0) {
    throw new HttpException("Store has employees", 409);
  }
  if (saleCount > 0) {
    throw new HttpException("Store has sales", 409);
  }
  const store = await Store.findByIdAndDelete(storeId);
  if (!store) {
    throw new NotFoundException("Store not found");
  }
  await Promise.all([
    Stock.deleteMany({ store: storeId }),
    SupplyRequest.deleteMany({ store: storeId }),
    Shift.deleteMany({ store: storeId }),
    Task.deleteMany({ store: storeId }),
  ]);
};

module.exports = {
  findAll,
  findOne,
  create,
  update,
  deleteStore,
};
