// import
const bcrypt = require("bcrypt");
const User = require("./schema");
const HttpException = require("../../exceptions");
const Shift = require("../shifts/schema");
const Task = require("../tasks/schema");
const NotFoundException = require("../../exceptions/auth/NotFoundException");
const assignDefinedFields = require("../../utils/assignDefinedFields");
const buildPagination = require("../../utils/buildPagination");

// l'utente con nome e città del negozio, oppure 404
const findUserWithStore = async (userId) => {
  const user = await User.findById(userId).populate("store", "name city");
  if (!user) {
    throw new NotFoundException("User not found");
  }
  return user;
};

// senza page tutte le persone (per i moduli); con page una pagina, in ordine di cognome
const findAll = async ({ page, limit = 10 }) => {
  if (!page) {
    const users = await User.find()
      .populate("store", "name")
      .sort({ surname: 1, name: 1 });
    return { users };
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const [users, count] = await Promise.all([
    User.find()
      .populate("store", "name")
      .sort({ surname: 1, name: 1, _id: 1 })
      .collation({ locale: "it" })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    User.countDocuments(),
  ]);

  return {
    users,
    totals: { count },
    pagination: buildPagination(pageNumber, limitNumber, count),
  };
};

// una persona (altrimenti 404)
const findOne = async (userId) => {
  const user = await User.findById(userId).populate("store", "name");
  if (!user) {
    throw new NotFoundException("User not found");
  }
  return user;
};

// il mio profilo
const findMe = async (userId) => findUserWithStore(userId);

// nuova persona (la password la cripta lo schema; nella risposta la tolgo)
const create = async (userData) => {
  const user = new User(userData);
  // il responsabile non ha un negozio
  if (user.role === "admin") user.store = undefined;
  await user.save();
  const { password, ...safeUser } = user.toObject();
  return safeUser;
};

// modifico una persona con i campi arrivati
const update = async (userId, userData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  assignDefinedFields(user, userData);
  // diventato responsabile: tolgo il negozio
  if (user.role === "admin") user.store = undefined;
  await user.save();

  const { password, ...safeUser } = user.toObject();
  return safeUser;
};

// il mio profilo: nome, cognome ed email
const updateMe = async (userId, userData) => {
  const user = await findUserWithStore(userId);
  assignDefinedFields(user, userData);
  await user.save();
  return user;
};

// cambio password: controllo quella attuale ("+password" perché è nascosta)
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

// foto profilo: avatarUrl è il link di Cloudinary
const uploadAvatar = async (userId, avatarUrl) => {
  const user = await findUserWithStore(userId);
  user.avatar = avatarUrl;
  await user.save();
  return user;
};

// tolgo la foto (tornano le iniziali)
const removeAvatar = async (userId) => {
  const user = await findUserWithStore(userId);
  user.avatar = undefined;
  await user.save();
  return user;
};

// elimino la persona con i suoi turni e le sue task
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
