// import
import { isSameDay } from "./dates";
import { formatCashDifference } from "./formatCashDifference";

// stato della cassa di un giorno per badge e righe: { label, color, isProblem }.
// day serve quando la cassa non c'è: oggi "Da aprire", prima "Non aperta"
export const getCashStatus = (cashSession, day) => {
  const isToday = isSameDay(day, new Date());
  // nessuna cassa quel giorno
  if (!cashSession) {
    return {
      label: isToday ? "Da aprire" : "Non aperta",
      color: "white",
      isProblem: false,
    };
  }
  // chiusa con una differenza
  if (cashSession.closedAt && cashSession.difference !== 0) {
    return {
      label: formatCashDifference(cashSession.difference),
      color: "warning",
      isProblem: true,
    };
  }
  // fondo di apertura diverso dall'ultima chiusura
  if (cashSession.floatMismatch) {
    return { label: "Fondo diverso", color: "warning", isProblem: true };
  }
  // ancora aperta: oggi va bene, nei giorni prima no
  if (!cashSession.closedAt) {
    return isToday
      ? { label: "Aperta", color: "white", isProblem: false }
      : { label: "Non chiusa", color: "warning", isProblem: true };
  }
  return { label: "Ok", color: "success", isProblem: false };
};
