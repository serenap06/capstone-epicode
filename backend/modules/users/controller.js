const HttpException = require("../../exceptions/index");
const ForbiddenException = require("../../exceptions/auth/ForbiddenException");
const userService = require("./service");

const findAll = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await userService.findAll({ page, limit });
    res.status(200).send({
      statusCode: 200,
      users: result.users,
      totals: result.totals,
      pagination: result.pagination,
    });
  } catch (e) {
    next(e);
  }
};

const findOne = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userService.findOne(userId);
    res.status(200).send({
      statusCode: 200,
      user,
    });
  } catch (e) {
    next(e);
  }
};

const findMe = async (req, res, next) => {
  try {
    const user = await userService.findMe(req.user._id);
    res.status(200).send({
      statusCode: 200,
      user,
    });
  } catch (e) {
    next(e);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, surname, email, password, role, store, weeklyHours } =
      req.body;
    const user = await userService.create({
      name,
      surname,
      email,
      password,
      role,
      store,
      weeklyHours,
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
const update = async (req, res, next) => {
  try {
    const { name, surname, email, role, store, weeklyHours } = req.body;
    const { userId } = req.params;
    // il responsabile non può togliersi il ruolo da solo: perderebbe l'accesso alle sue pagine
    const isSelf = userId === req.user._id.toString();
    if (isSelf && role !== undefined && role !== req.user.role) {
      throw new ForbiddenException("You cannot change your own role");
    }
    const user = await userService.update(userId, {
      name,
      surname,
      email,
      role,
      store,
      weeklyHours,
    });
    res.status(200).send({
      statusCode: 200,
      message: "User updated successfully",
      user,
    });
  } catch (e) {
    next(e);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { name, surname, email } = req.body;
    const user = await userService.updateMe(req.user._id, {
      name,
      surname,
      email,
    });
    res.status(200).send({
      statusCode: 200,
      message: "Profile updated successfully",
      user,
    });
  } catch (e) {
    next(e);
  }
};

// cambio della propria password: il service controlla quella attuale prima di salvare la nuova
const updateMyPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await userService.updateMyPassword(
      req.user._id,
      currentPassword,
      newPassword,
    );
    res.status(200).send({
      statusCode: 200,
      message: "Password updated successfully",
    });
  } catch (e) {
    next(e);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new HttpException("Avatar file is required", 400);
    }
    const user = await userService.uploadAvatar(req.user._id, req.file.path);
    res.status(200).send({
      statusCode: 200,
      message: "User avatar uploaded successfully",
      user,
    });
  } catch (e) {
    next(e);
  }
};

const removeAvatar = async (req, res, next) => {
  try {
    const user = await userService.removeAvatar(req.user._id);
    res.status(200).send({
      statusCode: 200,
      message: "User avatar removed successfully",
      user,
    });
  } catch (e) {
    next(e);
  }
};

// il proprio account non si elimina
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (userId === req.user._id.toString()) {
      throw new ForbiddenException("You cannot delete your own account");
    }
    await userService.deleteUser(userId);
    res.status(200).send({
      statusCode: 200,
      message: "User deleted successfully",
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  findAll,
  findOne,
  findMe,
  create,
  update,
  updateMe,
  updateMyPassword,
  uploadAvatar,
  removeAvatar,
  deleteUser,
};
