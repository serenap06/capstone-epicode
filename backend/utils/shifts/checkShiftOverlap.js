// import
const Shift = require("../../modules/shifts/schema");
const HttpException = require("../../exceptions");

// controllo che la persona non abbia già un turno in quell'orario (altrimenti 409)
const checkShiftOverlap = async (userId, startAt, endAt, currentShiftId) => {
  const overlapFilter = {
    user: userId,
    startAt: { $lt: endAt }, // inizia prima che l'altro finisca
    endAt: { $gt: startAt }, // finisce dopo che l'altro inizia
  };
  if (currentShiftId) {
    overlapFilter._id = { $ne: currentShiftId }; // in modifica escludo il turno stesso
  }
  const overlappingShift = await Shift.exists(overlapFilter);
  if (overlappingShift) {
    throw new HttpException("User already has a shift in this time range", 409);
  }
};

module.exports = checkShiftOverlap;
