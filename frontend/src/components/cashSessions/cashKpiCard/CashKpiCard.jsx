// import
import { getCashProblems } from "../../../utils/getCashProblems";

import Badge from "../../common/badge/Badge";
import KpiCard from "../../common/kpiCard/KpiCard";

// componente CashKpiCard: la card "Cassa" delle Vendite, quante chiusure da controllare ha ogni negozio nel periodo.
// props: cashSessions = le casse del periodo, stores = i negozi da mostrare
const CashKpiCard = ({ cashSessions, stores }) => {
  // le casse che non tornano
  const problemSessions = cashSessions.filter(
    (cashSession) => getCashProblems(cashSession).length > 0,
  );

  // una riga per negozio: quante da controllare, oppure tutto ok
  const rows = stores.map((store) => {
    const isStore = (cashSession) => cashSession.store._id === store._id;
    const problemCount = problemSessions.filter(isStore).length;
    let value = "Tutto ok";
    if (!cashSessions.some(isStore)) value = "Nessuna cassa";
    if (problemCount > 0) value = `${problemCount} da controllare`;
    return { key: store._id, label: store.name, value };
  });

  // badge e riga sotto: dove guardare, oppure tutto a posto
  let badge = null;
  let detail;
  if (problemSessions.length > 0) {
    badge = { label: "Da controllare", color: "warning" };
    detail = "I dettagli sono qui sotto";
  } else if (cashSessions.length > 0) {
    badge = { label: "Ok", color: "success" };
  } else {
    detail = "Nessuna cassa nel periodo";
  }

  return (
    <KpiCard
      color="blue"
      label="Cassa"
      rows={rows} // un negozio per riga
      compactRows // "1 da controllare" piccolo come il nome
      detail={detail}
      aside={badge && <Badge color={badge.color}>{badge.label}</Badge>}
    />
  );
};

export default CashKpiCard;
