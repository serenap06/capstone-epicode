const User = require("./schema");
const NotFoundException = require("../../exceptions/auth/NotFoundException");

const findAll = async () => {
  return (
    User.find()
      //.populate("store", "name")
      .sort({ surname: 1, name: 1 })
  );
};

const findOne = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  return user;
};

const create = async (userData) => {
  const user = new User(userData);
  return await user.save();
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

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }
};
module.exports = {
  findAll,
  findOne,
  create,
  update,
  deleteUser,
};
