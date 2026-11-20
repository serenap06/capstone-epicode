// import
import { addDays, isSameDay } from "./dates";
import { formatLongDate } from "./formatLongDate";

// "Oggi", "Domani", "Ieri" o "lunedì 16 novembre"
export const formatDayLabel = (date) => {
  const today = new Date();
  if (isSameDay(date, today)) return "Oggi";
  if (isSameDay(date, addDays(today, 1))) return "Domani";
  if (isSameDay(date, addDays(today, -1))) return "Ieri";
  return formatLongDate(date);
};
