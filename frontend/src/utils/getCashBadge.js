// import
import { getCashProblems } from "./getCashProblems";

// badge dello stato di una cassa: "Da controllare" se qualcosa non torna, altrimenti "Ok" (chiusa) o "Aperta" (oggi)
export const getCashBadge = (cashSession) => {
  if (getCashProblems(cashSession).length > 0) {
    return { label: "Da controllare", color: "warning" };
  }
  return cashSession.closedAt
    ? { label: "Ok", color: "success" }
    : { label: "Aperta", color: "neutral" };
};
