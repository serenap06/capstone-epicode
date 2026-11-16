// durata di un turno in ore: la differenza tra due date è in millisecondi
// (3.600.000 in un'ora). 9:00–17:00 → 8
export const getShiftHours = (shift) =>
  (new Date(shift.endAt) - new Date(shift.startAt)) / 3600000;
