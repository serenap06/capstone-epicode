// import
const Shift = require("./schema");
const User = require("../users/schema");
const checkShiftOverlap = require("../../utils/shifts/checkShiftOverlap");
const checkUserBelongsToStore = require("../../utils/checkUserBelongsToStore");
const NotFoundException = require("../../exceptions/auth/NotFoundException");
const ForbiddenException = require("../../exceptions/auth/ForbiddenException");
const assignDefinedFields = require("../../utils/assignDefinedFields");

// il turno con i nomi di persona e negozio
const findShiftWithNames = (shiftId) =>
  Shift.findById(shiftId)
    .populate("user", "name surname")
    .populate("store", "name");

// turni del periodo: il responsabile può filtrare per negozio, il dipendente vede il suo
const findAll = async ({ store: storeId, from, to }, currentUser) => {
  const isAdmin = currentUser.role === "admin";
  if (!isAdmin && !currentUser.store) {
    throw new ForbiddenException("No store assigned");
  }
  // filtro del negozio
  const shiftFilter = {};
  const filterStoreId = isAdmin ? storeId : currentUser.store;
  if (filterStoreId) {
    shiftFilter.store = filterStoreId;
  }
  // turni che iniziano tra from e to
  if (from || to) {
    shiftFilter.startAt = {};
    if (from) shiftFilter.startAt.$gte = new Date(from);
    if (to) shiftFilter.startAt.$lte = new Date(to);
  }
  // con i nomi di persona e negozio
  return Shift.find(shiftFilter)
    .populate("user", "name surname")
    .populate("store", "name")
    .sort({ startAt: 1 });
};

// un turno (il dipendente solo del suo negozio)
const findOne = async (shiftId, currentUser) => {
  const shift = await findShiftWithNames(shiftId);
  if (!shift) {
    throw new NotFoundException("Shift not found");
  }
  // un dipendente non vede i turni di altri negozi
  const isAdmin = currentUser.role === "admin";
  const isSameStore =
    shift.store._id.toString() === currentUser.store?.toString();
  if (!isAdmin && !isSameStore) {
    throw new ForbiddenException("You cannot access this shift");
  }
  return shift;
};

// ore della settimana di ogni dipendente: contratto, pianificate e differenza
// (il dipendente riceve solo la sua riga)
const findWeeklyHours = async ({ store, from, to }, currentUser) => {
  const storeFilter = store ? { store } : {};
  const employeeFilter =
    currentUser.role === "employee" ? { _id: currentUser._id } : storeFilter;
  // con il negozio, ordinati per negozio e nome (le righe dello stesso negozio vicine)
  const employees = await User.find({ role: "employee", ...employeeFilter })
    .populate("store", "name")
    .sort({ store: 1, name: 1 });

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
    // differenza tra date in millisecondi: 3.600.000 in un'ora
    const scheduledHours = employeeShifts.reduce(
      (total, shift) => total + (shift.endAt - shift.startAt) / 3600000,
      0,
    );
    return {
      employeeId: employee._id,
      employee: `${employee.name} ${employee.surname}`,
      store: employee.store,
      weeklyHours: employee.weeklyHours,
      scheduledHours,
      // senza contratto la differenza è tutto il pianificato
      difference: scheduledHours - (employee.weeklyHours ?? 0),
    };
  });
  return hours;
};

// nuovo turno: la persona lavora lì e non ha già un turno in quell'orario
const create = async (shiftData) => {
  const { user: userId, store: storeId, startAt, endAt } = shiftData;
  await checkUserBelongsToStore(userId, storeId);
  await checkShiftOverlap(userId, new Date(startAt), new Date(endAt));

  const newShift = new Shift(shiftData);
  await newShift.save();

  return findShiftWithNames(newShift._id);
};

// modifico il turno con gli stessi controlli
const update = async (shiftId, shiftData) => {
  const shift = await Shift.findById(shiftId);
  if (!shift) {
    throw new NotFoundException("Shift not found");
  }

  assignDefinedFields(shift, shiftData);

  await checkUserBelongsToStore(shift.user, shift.store);
  await checkShiftOverlap(shift.user, shift.startAt, shift.endAt, shift._id);
  await shift.save();

  return findShiftWithNames(shift._id);
};

// elimino il turno
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
