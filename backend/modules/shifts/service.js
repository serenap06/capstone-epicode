const Shift = require("./schema");
const checkShiftOverlap = require("../../utils/shifts/checkShiftOverlap");
const checkUserBelongsToStore = require("../../utils/checkUserBelongsToStore");
const NotFoundException = require("../../exceptions/auth/NotFoundException");
const ForbiddenException = require("../../exceptions/auth/ForbiddenException");

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
