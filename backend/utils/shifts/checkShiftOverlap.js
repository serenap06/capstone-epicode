const Shift = require("../../modules/shifts/schema");
const HttpException = require("../../exceptions/auth/NotFoundException");

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
    throw new HttpException("User already has a shift in this time range", 409);
  }
};

module.exports = checkShiftOverlap;
