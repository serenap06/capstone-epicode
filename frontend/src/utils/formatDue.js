import { formatTime } from "./formatTime";
import { addDays, isSameDay } from "./dates";

// scadenza in parole, dopo "Scade": "alle 15:00", "domani alle 9:00" o "il 30 novembre"
export const formatDue = (dueDate) => {
  const today = new Date();
  const tomorrow = addDays(today, 1);

  if (isSameDay(dueDate, today)) return `alle ${formatTime(dueDate)}`;
  if (isSameDay(dueDate, tomorrow)) return `domani alle ${formatTime(dueDate)}`;
  // più avanti: solo giorno e mese
  return `il ${new Date(dueDate).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
  })}`;
};
