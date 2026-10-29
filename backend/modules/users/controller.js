const userService = require("./service");

const findAll = async (req, res, next) => {
  try {
    const users = await userService.findAll();
    res.status(200).send({
      statusCode: 200,
      users,
    });
  } catch (e) {
    next(e);
  }
};

const findOne = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userService.findOne(userId);
    return res.status(200).send({
      statusCode: 200,
      user,
    });
  } catch (e) {
    next(e);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, surname, email, password, role, store } = req.body;
    const user = await userService.create({
      name,
      surname,
      email,
      password,
      role,
      store,
    });
    res.status(201).send({
      statusCode: 201,
      message: "User created successfully",
      user,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  findAll,
  findOne,
  create,
};
