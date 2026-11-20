// import
import "./cashSessionBar.css";
import { Lock, LockOpen } from "lucide-react";

import { formatEuro } from "../../../utils/formatEuro";
import { formatFullName } from "../../../utils/formatFullName";
import { formatNamedDifference } from "../../../utils/formatNamedDifference";
import { formatTime } from "../../../utils/formatTime";

import Badge from "../../common/badge/Badge";
import Button from "../../common/button/Button";

// componente CashSessionBar: la cassa di oggi (da aprire, aperta o chiusa) con il suo bottone.
// props: cashSession (null se da aprire), cashSales = incasso contanti di oggi, onOpen e onClose = aprono i moduli
const CashSessionBar = ({ cashSession, cashSales, onOpen, onClose }) => {
  // true se la cassa di oggi è già chiusa
  const isClosed = !!cashSession?.closedAt;

  // da aprire: stato e informazioni di base
  let status = { label: "Da aprire", color: "warning" };
  let details = ["Fondo cassa di oggi non ancora inserito"];
  // aperta: chi e quando, fondo e incasso contanti
  if (cashSession && !isClosed) {
    status = { label: "Aperta", color: "success" };
    details = [
      `Aperta da ${formatFullName(cashSession.openedBy)} alle ${formatTime(cashSession.createdAt)}`,
      `Fondo ${formatEuro(cashSession.openingFloat)}`,
      `Incasso contanti ${formatEuro(cashSales)}`,
    ];
  }
  // chiusa: chi e quando, imbustato, fondo di chiusura e POS
  let differences = [];
  if (isClosed) {
    status = { label: "Chiusa", color: "neutral" };
    details = [
      `Chiusa da ${formatFullName(cashSession.closedBy)} alle ${formatTime(cashSession.closedAt)}`,
      `Imbustato ${formatEuro(cashSession.envelopeAmount)}`,
      `Fondo di chiusura ${formatEuro(cashSession.closingFloat)}`,
    ];
    // le due differenze (il POS solo se c'è)
    differences = [{ name: "Contanti", value: cashSession.difference }];
    if (cashSession.posDifference !== undefined) {
      details.push(`Chiusura POS ${formatEuro(cashSession.posAmount)}`);
      differences.push({ name: "POS", value: cashSession.posDifference });
    }
  }

  return (
    <section className="app-card cash-bar" aria-label="Cassa di oggi">
      <div className="cash-bar-info">
        <Badge color={status.color}>{status.label}</Badge>
        <ul className="cash-bar-details">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
        {/* chiusa: contanti e POS, verdi se tutto torna */}
        {differences.map((difference) => (
          <Badge
            key={difference.name}
            color={difference.value === 0 ? "success" : "warning"}
          >
            {formatNamedDifference(difference.name, difference.value)}
          </Badge>
        ))}
      </div>

      {/* il bottone: apri se da aprire, chiudi se aperta, niente se chiusa */}
      {!cashSession && (
        <Button onClick={onOpen}>
          <LockOpen size={16} aria-hidden="true" />
          Apri la cassa
        </Button>
      )}
      {cashSession && !isClosed && (
        <Button variant="secondary" onClick={onClose}>
          <Lock size={16} aria-hidden="true" />
          Chiudi la cassa
        </Button>
      )}
    </section>
  );
};

export default CashSessionBar;
