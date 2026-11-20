// import
import { isSameDay } from "./dates";
import { formatCashDifference } from "./formatCashDifference";
import { formatNamedDifference } from "./formatNamedDifference";

// cosa non torna in una cassa: differenza di chiusura, POS diverso dalle vendite con carta,
// fondo diverso dall'ultima chiusura, cassa non chiusa (nei giorni passati). Vuoto = tutto a posto
export const getCashProblems = (cashSession) => {
  const problems = [];
  if (cashSession.closedAt && cashSession.difference !== 0) {
    problems.push(formatCashDifference(cashSession.difference));
  }
  // posDifference manca nelle casse chiuse prima del POS: non è un problema
  if (cashSession.closedAt && cashSession.posDifference) {
    problems.push(formatNamedDifference("POS", cashSession.posDifference));
  }
  if (cashSession.floatMismatch) problems.push("Fondo diverso");
  if (!cashSession.closedAt && !isSameDay(cashSession.day, new Date())) {
    problems.push("Non chiusa");
  }
  return problems;
};
