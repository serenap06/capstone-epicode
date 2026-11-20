// import
const Store = require("./schema");
const User = require("../users/schema");
const Sale = require("../sales/schema");
const Stock = require("../stock/schema");
const SupplyRequest = require("../supply-requests/schema");
const Shift = require("../shifts/schema");
const Task = require("../tasks/schema");
const CashSession = require("../cash-sessions/schema");

const NotFoundException = require("../../exceptions/auth/NotFoundException");
const HttpException = require("../../exceptions");

// tutti i negozi con il loro personale, dalla A alla Z
const findAll = async () => {
  return Store.find().populate("users", "name surname").sort({ name: 1 });
};

// un negozio con il personale (altrimenti 404)
const findOne = async (storeId) => {
  const store = await Store.findById(storeId).populate("users", "name surname");
  if (!store) {
    throw new NotFoundException("Store not found");
  }
  return store;
};

// nuovo negozio
const create = async (storeData) => {
  const store = new Store(storeData);
  return await store.save();
};

// modifico il negozio e restituisco quello aggiornato
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

// elimino il negozio, ma non se ha personale o vendite (servono per i conti).
// Con lui tolgo giacenze, richieste, turni, task e casse
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
    CashSession.deleteMany({ store: storeId }),
  ]);
};

module.exports = {
  findAll,
  findOne,
  create,
  update,
  deleteStore,
};
