// ore di un turno: differenza in millisecondi / 3.600.000
export const getShiftHours = (shift) =>
  (new Date(shift.endAt) - new Date(shift.startAt)) / 3600000;
