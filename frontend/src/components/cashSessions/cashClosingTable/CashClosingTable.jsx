// import
import "./cashClosingTable.css";

import { isSameDay } from "../../../utils/dates";
import { formatCashDifference } from "../../../utils/formatCashDifference";
import { formatEuro } from "../../../utils/formatEuro";
import { formatFullName } from "../../../utils/formatFullName";
import { formatShortDate } from "../../../utils/formatShortDate";
import { formatTime } from "../../../utils/formatTime";

import Badge from "../../common/badge/Badge";
import SortableHeader from "../../common/sortableHeader/SortableHeader";

// componente CashClosingTable: tabella delle chiusure di cassa da 1366px.
// props: closings = [{ cashSession, badge, isProblem }], showStore = la colonna del negozio,
// sort e onSort = l'ordine (lo fa CashClosingList)
const CashClosingTable = ({ closings, showStore, sort, onSort }) => {
  // props uguali per le intestazioni che ordinano
  const sortProps = { sort, onSort };

  return (
    // se non ci sta, scorre in orizzontale
    <div className="app-card app-table-wrap">
      <table className="app-table cash-closing-table">
        <thead>
          <tr>
            <SortableHeader label="Giorno" field="day" {...sortProps} />
            {showStore && (
              <SortableHeader label="Negozio" field="store" {...sortProps} />
            )}
            <SortableHeader label="Stato" field="status" {...sortProps} />
            <SortableHeader
              label="Fondo apertura"
              field="openingFloat"
              className="text-end"
              {...sortProps}
            />
            <SortableHeader
              label="Incasso contanti"
              field="cashSales"
              className="text-end"
              {...sortProps}
            />
            <SortableHeader
              label="Incasso POS"
              field="cardSales"
              className="text-end"
              {...sortProps}
            />
            <SortableHeader
              label="Totale contanti"
              field="expectedCash"
              className="text-end"
              {...sortProps}
            />
            <SortableHeader
              label="Imbustato"
              field="envelopeAmount"
              className="text-end"
              {...sortProps}
            />
            <SortableHeader
              label="Fondo chiusura"
              field="closingFloat"
              className="text-end"
              {...sortProps}
            />
            <SortableHeader label="Chiusa da" field="closedBy" {...sortProps} />
          </tr>
        </thead>
        <tbody>
          {closings.map(({ cashSession, badge, isProblem }) => {
            const isClosed = !!cashSession.closedAt;
            // i contanti che non tornano: imbustato e fondo di chiusura in arancio
            const hasDifference = isClosed && cashSession.difference !== 0;
            const differenceClass = hasDifference ? "cash-closing-alert" : "";
            // lo scontrino del POS diverso dalle vendite con carta (0 o assente = tutto a posto)
            const hasPosDifference = !!cashSession.posDifference;
            // importo di chiusura, oppure "—" se la cassa è ancora aperta
            const closedValue = (value) => (isClosed ? formatEuro(value) : "—");
            return (
              // da controllare: riga in evidenza
              <tr
                key={cashSession._id}
                className={isProblem ? "cash-closing-row-problem" : ""}
              >
                <td>
                  <strong>{formatShortDate(cashSession.day)}</strong>
                </td>
                {showStore && (
                  <td className="cash-closing-store">
                    {cashSession.store.name}
                  </td>
                )}
                {/* stato: Ok, Da controllare o Aperta; i dettagli sono sotto le colonne */}
                <td>
                  <Badge color={badge.color}>{badge.label}</Badge>
                </td>
                {/* fondo diverso: in arancio, con l'ultima chiusura sotto */}
                <td
                  className={`text-end ${cashSession.floatMismatch ? "cash-closing-alert" : ""}`}
                >
                  {formatEuro(cashSession.openingFloat)}
                  {cashSession.floatMismatch && (
                    <small>
                      ultima chiusura{" "}
                      {formatEuro(cashSession.previousClosingFloat)}
                    </small>
                  )}
                </td>
                <td className="text-end">
                  {formatEuro(cashSession.cashSales)}
                </td>
                {/* POS che non torna: in arancio, con lo scontrino del POS e la differenza sotto */}
                <td
                  className={`text-end ${hasPosDifference ? "cash-closing-alert" : ""}`}
                >
                  {formatEuro(cashSession.cardSales)}
                  {hasPosDifference && (
                    <>
                      <small>
                        chiusura POS {formatEuro(cashSession.posAmount)}
                      </small>
                      <small>
                        {formatCashDifference(cashSession.posDifference)}
                      </small>
                    </>
                  )}
                </td>
                <td className="text-end">
                  {closedValue(cashSession.expectedCash)}
                </td>
                {/* contanti che non tornano: la differenza sotto l'imbustato */}
                <td className={`text-end ${differenceClass}`}>
                  {closedValue(cashSession.envelopeAmount)}
                  {hasDifference && (
                    <small>
                      {formatCashDifference(cashSession.difference)}
                    </small>
                  )}
                </td>
                <td className={`text-end ${differenceClass}`}>
                  {closedValue(cashSession.closingFloat)}
                </td>
                {/* chi l'ha chiusa, oppure chi l'ha aperta (e se non l'ha mai chiusa) */}
                <td>
                  {isClosed ? (
                    <>
                      {formatFullName(cashSession.closedBy)}
                      <small>alle {formatTime(cashSession.closedAt)}</small>
                    </>
                  ) : (
                    <>
                      {isSameDay(cashSession.day, new Date())
                        ? "Ancora aperta"
                        : "Mai chiusa"}
                      <small>
                        aperta da {formatFullName(cashSession.openedBy)}
                      </small>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CashClosingTable;
