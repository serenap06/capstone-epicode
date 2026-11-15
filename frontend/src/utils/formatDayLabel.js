import { addDays, isSameDay } from "./dates";
import { formatLongDate } from "./formatLongDate";

// titoletto di un giorno nelle liste: "Oggi", "Domani" oppure la data per esteso,
// per esempio "lunedì 16 novembre". Usato nella pagina Task del responsabile
export const formatDayLabel = (date) => {
  const today = new Date();
  if (isSameDay(date, today)) return "Oggi";
  if (isSameDay(date, addDays(today, 1))) return "Domani";
  return formatLongDate(date);
};
