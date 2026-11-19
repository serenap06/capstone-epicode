// import
import { formatTime } from "./formatTime";
import { isSameDay } from "./dates";

// ora della vendita: "15:40" se è di oggi, altrimenti "16 nov · 15:40"
export const formatSaleTime = (date) => {
  if (isSameDay(date, new Date())) return formatTime(date);
  const day = new Date(date).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
  return `${day} · ${formatTime(date)}`;
};
