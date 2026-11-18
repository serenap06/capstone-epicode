import { formatTime } from "./formatTime";
import { isSameDay } from "./dates";

// quando è stata fatta una vendita: solo l'ora se è di oggi ("15:40"),
// altrimenti anche il giorno ("16 nov · 15:40")
export const formatSaleTime = (date) => {
  if (isSameDay(date, new Date())) return formatTime(date);
  const day = new Date(date).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
  return `${day} · ${formatTime(date)}`;
};
