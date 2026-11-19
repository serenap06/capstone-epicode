// import
import { isSameDay } from "./dates";

// "Oggi" oppure "16 nov"
export const formatShortDate = (date) => {
  if (isSameDay(date, new Date())) return "Oggi";
  return new Date(date).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
};
