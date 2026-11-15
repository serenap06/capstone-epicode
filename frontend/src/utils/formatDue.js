import { formatTime } from "./formatTime";
import { isSameDay } from "./dates";

// scadenza di una task scritta in parole, da mettere dopo "Scade":
// "alle 15:00" se è oggi, "domani alle 9:00" se è domani, altrimenti "il 30 novembre"
export const formatDue = (dueDate) => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (isSameDay(dueDate, today)) return `alle ${formatTime(dueDate)}`;
  if (isSameDay(dueDate, tomorrow)) return `domani alle ${formatTime(dueDate)}`;
  // più avanti: solo giorno e mese, senza orario
  return `il ${new Date(dueDate).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
  })}`;
};
