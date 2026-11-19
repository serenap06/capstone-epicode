// import
const User = require("../modules/users/schema");
const HttpException = require("../exceptions/index");
const NotFoundException = require("../exceptions/auth/NotFoundException");

// controllo che la persona esista e lavori in quel negozio
const checkUserBelongsToStore = async (userId, storeId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  if (user.store?.toString() !== storeId.toString()) {
    throw new HttpException("User doesn't belong to this store", 400);
  }
  return user;
};

module.exports = checkUserBelongsToStore;
