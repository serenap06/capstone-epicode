// import
import { isSameDay } from "./dates";

// i turni di una persona in un giorno
export const getDayShifts = (shifts, userId, day) =>
  shifts.filter(
    (shift) => shift.user._id === userId && isSameDay(shift.startAt, day),
  );
