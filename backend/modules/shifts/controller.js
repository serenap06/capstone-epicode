const shiftService = require("./service");

const findAll = async (req, res, next) => {
  try {
    const { store, from, to } = req.query;
    const shifts = await shiftService.findAll({ store, from, to }, req.user);
    res.status(200).send({
      statusCode: 200,
      shifts,
    });
  } catch (e) {
    next(e);
  }
};

const findOne = async (req, res, next) => {
  try {
    const { shiftId } = req.params;
    const shift = await shiftService.findOne(shiftId, req.user);
    res.status(200).send({
      statusCode: 200,
      shift,
    });
  } catch (e) {
    next(e);
  }
};

const create = async (req, res, next) => {
  try {
    const { user, store, startAt, endAt } = req.body;
    const shift = await shiftService.create({
      user,
      store,
      startAt,
      endAt,
    });
    res.status(200).send({
      statusCode: 201,
      message: "Shift created successfully",
      shift,
    });
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const { shiftId } = req.params;
    const { user, store, startAt, endAt } = req.body;
    const shift = await shiftService.update(shiftId, {
      user,
      store,
      startAt,
      endAt,
    });
    res.status(200).send({
      statusCode: 200,
      message: "Shift updated successfully",
      shift,
    });
  } catch (e) {
    next(e);
  }
};

const deleteShift = async (req, res, next) => {
  try {
    const { shiftId } = req.params;
    await shiftService.deleteShift(shiftId);
    res.status(200).send({
      statusCode: 200,
      message: "Shift deleted successfully",
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
  deleteShift,
};
