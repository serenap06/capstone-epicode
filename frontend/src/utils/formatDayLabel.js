import { addDays, isSameDay } from "./dates";
import { formatLongDate } from "./formatLongDate";

// titoletto di un giorno: "Oggi", "Domani" o "lunedì 16 novembre"
export const formatDayLabel = (date) => {
  const today = new Date();
  if (isSameDay(date, today)) return "Oggi";
  if (isSameDay(date, addDays(today, 1))) return "Domani";
  return formatLongDate(date);
};
