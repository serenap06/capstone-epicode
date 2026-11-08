const Shift = require("./schema");
const User = require("../users/schema");
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

const findWeeklyHours = async ({ store, from, to }, currentUser) => {
  const storeFilter = store ? { store } : {};
  const employeeFilter =
    currentUser.role === "employee" ? { _id: currentUser._id } : storeFilter;
  const employees = await User.find({ role: "employee", ...employeeFilter });

  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  const employeeIds = employees.map((employee) => employee._id);

  const shifts = await Shift.find({
    user: { $in: employeeIds },
    startAt: { $gte: fromDate, $lte: toDate },
  });

  const hours = employees.map((employee) => {
    const employeeShifts = shifts.filter(
      (shift) => shift.user.toString() === employee._id.toString(),
    );
    const scheduledHours = employeeShifts.reduce(
      (total, shift) => total + (shift.endAt - shift.startAt) / 3600000,
      0,
    );
    return {
      employee: `${employee.name} ${employee.surname}`,
      weeklyHours: employee.weeklyHours,
      scheduledHours,
      difference: scheduledHours - employee.weeklyHours,
    };
  });
  return hours;
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
  findWeeklyHours,
  create,
  update,
  deleteShift,
};
