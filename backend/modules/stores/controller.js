const storeService = require("./service");

const findAll = async (req, res, next) => {
  try {
    const stores = await storeService.findAll();
    res.status(200).send({
      statusCode: 200,
      stores,
    });
  } catch (e) {
    next(e);
  }
};

const findOne = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const store = await storeService.findOne(storeId);
    res.status(200).send({
      statusCode: 200,
      store,
    });
  } catch (e) {
    next(e);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, address, city } = req.body;
    const store = await storeService.create({
      name,
      address,
      city,
    });
    res.status(201).send({
      statusCode: 201,
      message: "Store created successfully",
      store,
    });
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const { name, address, city } = req.body;
    const { storeId } = req.params;
    const store = await storeService.update(storeId, {
      name,
      address,
      city,
    });
    res.status(200).send({
      statusCode: 200,
      message: "Store updated successfully",
      store,
    });
  } catch (e) {
    next(e);
  }
};

const deleteStore = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    await storeService.deleteStore(storeId);
    res.status(200).send({
      statusCode: 200,
      message: "Store deleted successfully",
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
  deleteStore,
};
