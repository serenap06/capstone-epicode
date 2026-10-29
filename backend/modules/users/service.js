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

const create = async (body) => {
  const user = new User(body);
  return await user.save();
};

module.exports = {
  findAll,
  findOne,
  create,
};
