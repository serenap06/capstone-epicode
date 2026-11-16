import { isSameDay } from "./dates";

// i turni di una persona in un giorno (di solito uno), per la griglia e la lista del telefono
export const getDayShifts = (shifts, userId, day) =>
  shifts.filter(
    (shift) => shift.user._id === userId && isSameDay(shift.startAt, day),
  );
