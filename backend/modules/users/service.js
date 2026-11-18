const bcrypt = require("bcrypt");
const User = require("./schema");
const HttpException = require("../../exceptions");
const Shift = require("../shifts/schema");
const Task = require("../tasks/schema");
const NotFoundException = require("../../exceptions/auth/NotFoundException");
const assignDefinedFields = require("../../utils/assignDefinedFields");
const buildPagination = require("../../utils/buildPagination");

// l'utente con nome e città del negozio (per il profilo), oppure 404
const findUserWithStore = async (userId) => {
  const user = await User.findById(userId).populate("store", "name city");
  if (!user) {
    throw new NotFoundException("User not found");
  }
  return user;
};

// senza page restituisce tutte le persone (le usano i moduli di task e turni);
// con page una pagina sola, in ordine di cognome, e quante sono in tutto
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

const findOne = async (userId) => {
  const user = await User.findById(userId).populate("store", "name");
  if (!user) {
    throw new NotFoundException("User not found");
  }
  return user;
};

const findMe = async (userId) => findUserWithStore(userId);

// la password la cripta il pre("save") dello schema; nella risposta la tolgo
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
  assignDefinedFields(user, userData);
  await user.save();

  const { password, ...safeUser } = user.toObject();
  return safeUser;
};

// il proprio profilo: solo nome, cognome ed email (li sceglie il controller)
const updateMe = async (userId, userData) => {
  const user = await findUserWithStore(userId);
  assignDefinedFields(user, userData);
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

// avatarUrl: l'indirizzo della foto su Cloudinary, preparato da multer
const uploadAvatar = async (userId, avatarUrl) => {
  const user = await findUserWithStore(userId);
  user.avatar = avatarUrl;
  await user.save();
  return user;
};

// undefined toglie il campo: al posto della foto tornano le iniziali
const removeAvatar = async (userId) => {
  const user = await findUserWithStore(userId);
  user.avatar = undefined;
  await user.save();
  return user;
};

// eliminando una persona tolgo anche i suoi turni e le sue task
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
