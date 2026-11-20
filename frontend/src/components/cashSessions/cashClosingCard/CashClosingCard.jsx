// import
import "./cashClosingCard.css";

import { isSameDay } from "../../../utils/dates";
import { formatCashDifference } from "../../../utils/formatCashDifference";
import { formatEuro } from "../../../utils/formatEuro";
import { formatFullName } from "../../../utils/formatFullName";
import { formatShortDate } from "../../../utils/formatShortDate";
import { formatTime } from "../../../utils/formatTime";

import Badge from "../../common/badge/Badge";

// componente CashClosingCard: card di una chiusura di cassa fino a 1366px (stesse props di CashClosingTable).
// props: closing = { cashSession, badge, isProblem }, showStore = il nome del negozio nel titolo
const CashClosingCard = ({ closing, showStore }) => {
  const { cashSession, badge, isProblem } = closing;
  const isClosed = !!cashSession.closedAt;
  // la differenza di chiusura: imbustato e fondo di chiusura in arancio
  const hasDifference = isClosed && cashSession.difference !== 0;
  // lo scontrino del POS diverso dalle vendite con carta (0 o assente = tutto a posto)
  const hasPosDifference = !!cashSession.posDifference;
  // importo di chiusura, oppure "—" se la cassa è ancora aperta
  const closedValue = (value) => (isClosed ? formatEuro(value) : "—");

  // le righe: notes = i dettagli sotto il nome, alert = in arancio
  const rows = [
    {
      label: "Fondo apertura",
      value: formatEuro(cashSession.openingFloat),
      notes: cashSession.floatMismatch
        ? [`ultima chiusura ${formatEuro(cashSession.previousClosingFloat)}`]
        : [],
      alert: cashSession.floatMismatch,
    },
    { label: "Incasso contanti", value: formatEuro(cashSession.cashSales) },
    {
      label: "Incasso POS",
      value: formatEuro(cashSession.cardSales),
      notes: hasPosDifference
        ? [
            `chiusura POS ${formatEuro(cashSession.posAmount)}`,
            formatCashDifference(cashSession.posDifference),
          ]
        : [],
      alert: hasPosDifference,
    },
    {
      label: "Totale contanti",
      value: closedValue(cashSession.expectedCash),
    },
    {
      label: "Imbustato",
      value: closedValue(cashSession.envelopeAmount),
      notes: hasDifference
        ? [formatCashDifference(cashSession.difference)]
        : [],
      alert: hasDifference,
    },
    {
      label: "Fondo chiusura",
      value: closedValue(cashSession.closingFloat),
      alert: hasDifference,
    },
  ];

  // in fondo: chi l'ha chiusa, oppure chi l'ha aperta (e se non l'ha mai chiusa)
  let footer = `Chiusa da ${formatFullName(cashSession.closedBy)} alle ${formatTime(cashSession.closedAt)}`;
  if (!isClosed) {
    footer = `Aperta da ${formatFullName(cashSession.openedBy)} alle ${formatTime(cashSession.createdAt)}`;
    if (!isSameDay(cashSession.day, new Date())) footer += ", mai chiusa";
  }

  return (
    // da controllare: bordo arancio
    <article
      className={`app-card cash-closing ${isProblem ? "cash-closing-problem" : ""}`}
    >
      {/* giorno (e negozio) a sinistra, lo stato a destra */}
      <div className="cash-closing-top">
        <h3 className="cash-closing-title">
          {formatShortDate(cashSession.day)}
          {showStore && ` · ${cashSession.store.name}`}
        </h3>
        <Badge color={badge.color}>{badge.label}</Badge>
      </div>

      <dl className="cash-closing-rows">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`cash-closing-row ${row.alert ? "cash-closing-alert" : ""}`}
          >
            <dt>
              {row.label}
              {row.notes?.map((note) => (
                <small key={note}>{note}</small>
              ))}
            </dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="cash-closing-footer">{footer}</p>
    </article>
  );
};

export default CashClosingCard;
