import { formatTime } from "./formatTime";
import { isSameDay } from "./dates";

// "alle 15:00", "domani alle 09:00" oppure "il 30 novembre"
export const formatDue = (dueDate) => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (isSameDay(dueDate, today)) return `alle ${formatTime(dueDate)}`;
  if (isSameDay(dueDate, tomorrow)) return `domani alle ${formatTime(dueDate)}`;
  return `il ${new Date(dueDate).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
  })}`;
};