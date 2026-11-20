// import
import { formatEuro } from "../../../utils/formatEuro";
import { formatShortDate } from "../../../utils/formatShortDate";
import { getCashStatus } from "../../../utils/getCashStatus";

import Badge from "../../common/badge/Badge";
import KpiCard from "../../common/kpiCard/KpiCard";

// giorni da controllare mostrati al massimo
const MAX_PROBLEMS = 3;

// badge di più casse: "Da controllare" se una non torna, "Ok" se sono tutte a posto
const getGroupBadge = (statuses) => {
  if (statuses.some((status) => status.isProblem)) {
    return { label: "Da controllare", color: "warning" };
  }
  if (
    statuses.length > 0 &&
    statuses.every((status) => status.label === "Ok")
  ) {
    return { label: "Ok", color: "success" };
  }
  return null;
};

// componente CashKpiCard: la card "Cassa" delle Vendite. Giorno e un negozio: fondi e imbustato;
// giorno e tutti i negozi: lo stato di ognuno; settimana o mese: i giorni da controllare.
// props: cashSessions, period, day = il giorno mostrato, stores = i negozi da elencare (null se uno solo)
const CashKpiCard = ({ cashSessions, period, day, stores }) => {
  let rows = [];
  let badge;
  let detail;

  if (period === "day" && !stores) {
    // un giorno, un negozio: fondi e imbustato ("—" finché è aperta)
    const cashSession = cashSessions[0] ?? null;
    badge = getCashStatus(cashSession, day);
    if (cashSession) {
      const isClosed = !!cashSession.closedAt;
      rows = [
        {
          label: "Fondo apertura",
          value: formatEuro(cashSession.openingFloat),
        },
        {
          label: "Fondo chiusura",
          value: isClosed ? formatEuro(cashSession.closingFloat) : "—",
        },
        {
          label: "Imbustato",
          value: isClosed ? formatEuro(cashSession.envelopeAmount) : "—",
        },
      ];
    } else {
      detail = "Nessun fondo inserito";
    }
    // chiusa con differenza e anche fondo diverso: il badge mostra la differenza, il fondo lo scrivo sotto
    if (
      cashSession?.floatMismatch &&
      cashSession.closedAt &&
      cashSession.difference !== 0
    ) {
      detail = "Anche il fondo di apertura è diverso dall'ultima chiusura";
    }
  } else if (period === "day") {
    // un giorno, tutti i negozi: lo stato di ognuno
    const statuses = stores.map((store) =>
      getCashStatus(
        cashSessions.find((cashSession) => cashSession.store._id === store._id),
        day,
      ),
    );
    rows = stores.map((store, index) => ({
      key: store._id,
      label: store.name,
      value: statuses[index].label,
    }));
    badge = getGroupBadge(statuses);
  } else {
    // settimana o mese: i giorni che non tornano, dal più vecchio
    const statuses = cashSessions.map((cashSession) =>
      getCashStatus(cashSession, cashSession.day),
    );
    const problems = cashSessions
      .map((cashSession, index) => ({ cashSession, status: statuses[index] }))
      .filter((problem) => problem.status.isProblem);
    rows = problems.slice(0, MAX_PROBLEMS).map((problem) => ({
      key: problem.cashSession._id,
      label: formatShortDate(problem.cashSession.day),
      // il negozio solo se li guardo tutti
      note: stores ? problem.cashSession.store.name : undefined,
      value: problem.status.label,
    }));
    badge = getGroupBadge(statuses);
    // quelli che non ci stanno: "E un altro giorno", "E altri 2 giorni"
    const hiddenCount = problems.length - MAX_PROBLEMS;
    if (hiddenCount === 1) {
      detail = "E un altro giorno da controllare";
    } else if (hiddenCount > 1) {
      detail = `E altri ${hiddenCount} giorni da controllare`;
    } else if (problems.length === 0) {
      detail =
        cashSessions.length > 0
          ? "Nessuna differenza nel periodo"
          : "Nessuna cassa nel periodo";
    }
  }

  return (
    <KpiCard
      color="blue"
      label="Cassa"
      rows={rows} // fondi, negozi o giorni da controllare
      detail={detail}
      aside={badge && <Badge color={badge.color}>{badge.label}</Badge>}
    />
  );
};

export default CashKpiCard;
