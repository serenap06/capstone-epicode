const Shift = require("./schema");
const User = require("../users/schema");
const NotFoundException = require("../../exceptions/auth/NotFoundException");
const HttpException = require("../../exceptions/index");
const ForbiddenException = require("../../exceptions/auth/ForbiddenException");

// Controlla che il dipendente esista e lavori nel negozio del turno
const checkUserBelongsToStore = async (userId, storeId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  if (user.store?.toString() !== storeId.toString()) {
    throw new HttpException("User doesn't belong to this store",400);
  }
};

// Controlla che il dipendente non abbia già un turno nello stesso orario.
const checkShiftOverlap = async (userId, startAt, endAt, currentShiftId) => {
  const overlapFilter = {
    user: userId,
    startAt: { $lt: endAt }, //l'inizio del turno deve essere inferiore alla fine del turno
    endAt: { $gt: startAt }, //la fine del turno deve essere maggiore all'inizio del turno
  };
  if (currentShiftId) {
    overlapFilter._id = { $ne: currentShiftId }; //l'id filtrato non deve essere uguale all'id del turno corrente
  }
  const overlappingShift = await Shift.exists(overlapFilter);
  if (overlappingShift) {
    throw new HttpException("User already has a shift in this time range",409);
  }
};

const findAll = async ({ store: storeId, from, to }, currentUser) => {
  const isAdmin = currentUser.role === "admin";
  if (!isAdmin && !currentUser.store) {
    throw new ForbiddenException("No store assigned");
  }
  // L'admin può filtrare per negozio; il dipendente vede solo il suo
  const shiftFilter = {};
  const filterStoreId = isAdmin ? storeId : currentUser.store;
  if (filterStoreId) {
    shiftFilter.store = filterStoreId;
  }
  // filtra per inizio e fine turno
  if (from || to) {
    shiftFilter.startAt = {};
    if (from) shiftFilter.startAt.$gte = new Date(from);
    if (to) shiftFilter.startAt.$lte = new Date(to);
  }
  //popola utente e store
  return Shift.find(shiftFilter)
    .populate("user", "name surname")
    .populate("store", "name")
    .sort({ startAt: 1 });
};

const findOne = async (shiftId, currentUser) => {
  const shift = await Shift.findById(shiftId)
    .populate("user", "name surname")
    .populate("store", "name");
  if (!shift) {
    throw new NotFoundException("Shift not found");
  }
  // Un dipendente non può vedere i turni di un altro negozio a cui non è assegnato
  const isAdmin = currentUser.role === "admin";
  const isSameStore =
    shift.store._id.toString() === currentUser.store?.toString();
  if (!isAdmin && !isSameStore) {
    throw new ForbiddenException("You cannot access this shift");
  }
  return shift;
};

const create = async (shiftData) => {
  const { user: userId, store: storeId, startAt, endAt } = shiftData;
  await checkUserBelongsToStore(userId, storeId);
  await checkShiftOverlap(userId, new Date(startAt), new Date(endAt));

  const newShift = new Shift(shiftData);
  await newShift.save();

  return Shift.findById(newShift._id)
    .populate("user", "name surname")
    .populate("store", "name");
};

const update = async (shiftId, shiftData) => {
  const shift = await Shift.findById(shiftId);
  if (!shift) {
    throw new NotFoundException("Shift not found");
  }

  Object.entries(shiftData).forEach(([field, value]) => {
    if (value !== undefined) {
      shift[field] = value;
    }
  });

  await checkUserBelongsToStore(shift.user, shift.store);
  await checkShiftOverlap(shift.user, shift.startAt, shift.endAt, shift._id);
  await shift.save();

  return Shift.findById(shift._id)
    .populate("user", "name surname")
    .populate("store", "name");
};

const deleteShift = async (shiftId) => {
  const deletedShift = await Shift.findByIdAndDelete(shiftId);
  if (!deletedShift) {
    throw new NotFoundException("Shift not found");
  }
};

module.exports = {
  findAll,
  findOne,
  create,
  update,
  deleteShift,
};
