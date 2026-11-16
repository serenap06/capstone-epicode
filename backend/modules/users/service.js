const bcrypt = require("bcrypt");
const User = require("./schema");
const HttpException = require("../../exceptions");
const Shift = require("../shifts/schema");
const Task = require("../tasks/schema");
const NotFoundException = require("../../exceptions/auth/NotFoundException");

const findAll = async () => {
  return User.find().populate("store", "name").sort({ surname: 1, name: 1 });
};

const findOne = async (userId) => {
  const user = await User.findById(userId).populate("store", "name");
  if (!user) {
    throw new NotFoundException("User not found");
  }
  return user;
};

const findMe = async (userId) => {
  const user = await User.findById(userId).populate("store", "name city");
  if (!user) {
    throw new NotFoundException("User not found");
  }
  return user;
};

const create = async (userData) => {
  const user = new User(userData);
  await user.save();
  const { password, ...safeUser } = user.toObject();
  return safeUser;
};

const update = async (userId, userData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  Object.entries(userData).forEach(([field, value]) => {
    if (value !== undefined) {
      user[field] = value;
    }
  });
  await user.save();

  const { password, ...safeUser } = user.toObject();
  return safeUser;
};

const updateMe = async (userId, userData) => {
  const user = await User.findById(userId).populate("store", "name city");
  if (!user) {
    throw new NotFoundException("User not found");
  }
  Object.entries(userData).forEach(([field, value]) => {
    if (value !== undefined) {
      user[field] = value;
    }
  });
  await user.save();
  return user;
};

// la password è nascosta di default (select: false): con "+password" la chiedo esplicitamente.
// La nuova la cripta il pre("save") dello schema
const updateMyPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new NotFoundException("User not found");
  }
  const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentValid) {
    throw new HttpException("Current password is wrong", 400);
  }
  if (currentPassword === newPassword) {
    throw new HttpException("New password must be different", 400);
  }
  user.password = newPassword;
  await user.save();
};

const uploadAvatar = async (userId, avatarUrl) => {
  const user = await User.findById(userId).populate("store", "name city");
  if (!user) {
    throw new NotFoundException("User not found");
  }
  user.avatar = avatarUrl;
  await user.save();
  return user;
};

const removeAvatar = async (userId) => {
  const user = await User.findById(userId).populate("store", "name city");
  if (!user) {
    throw new NotFoundException("User not found");
  }
  user.avatar = undefined;
  await user.save();
  return user;
};

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  await Promise.all([
    Shift.deleteMany({ user: userId }),
    Task.deleteMany({ assignedTo: userId }),
  ]);
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
