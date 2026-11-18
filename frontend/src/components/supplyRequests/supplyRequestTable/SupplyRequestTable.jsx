import "./supplyRequestTable.css";
import { Fragment, useState } from "react";
import { Check, Trash2, X } from "lucide-react";

import { formatFullName } from "../../../utils/formatFullName";
import { formatShortDate } from "../../../utils/formatShortDate";

import Button from "../../common/button/Button";
import SortableHeader from "../../common/sortableHeader/SortableHeader";
import ProductThumb from "../../products/productThumb/ProductThumb";
import CancelledToggle from "../../sales/cancelledToggle/CancelledToggle";
import RejectedNote from "../rejectedNote/RejectedNote";
import SupplyStateBadge from "../supplyStateBadge/SupplyStateBadge";

// tabella delle richieste di fornitura, da 1366px in su. showStore: la colonna Negozio (responsabile).
// sort e onSort: l'ordine scelto e cosa fare al clic su un'intestazione.
// onAccept e onReject: "Accogli" e "Respingi" sulle richieste in attesa (solo il responsabile);
// canDelete(request): true se su quella riga c'è il cestino (il dipendente, sulle sue in attesa)
const SupplyRequestTable = ({
  requests,
  showStore,
  sort,
  onSort,
  onAccept,
  onReject,
  canDelete,
  onDelete,
}) => {
  // l'id della richiesta respinta con il motivo aperto (una alla volta), oppure null
  const [openRequestId, setOpenRequestId] = useState(null);

  // props uguali per tutte le intestazioni che ordinano
  const sortProps = { sort, onSort };
  // quante colonne ha la tabella: la riga del motivo le occupa tutte (colSpan)
  const columnCount = showStore ? 7 : 6;

  // apre il motivo di una richiesta, o lo chiude se era già aperto
  const toggleDetails = (requestId) =>
    setOpenRequestId((prevId) => (prevId === requestId ? null : requestId));

  return (
    // se la tabella non ci sta, scorre in orizzontale dentro il riquadro
    <div className="app-card app-table-wrap">
      <table className="app-table supply-table">
        <thead>
          <tr>
            <SortableHeader label="Prodotto" field="product" {...sortProps} />
            {showStore && (
              <SortableHeader label="Negozio" field="store" {...sortProps} />
            )}
            <SortableHeader label="Quantità" field="amount" {...sortProps} />
            <SortableHeader
              label="Richiesta da"
              field="requestedBy"
              {...sortProps}
            />
            <SortableHeader label="Data" field="date" {...sortProps} />
            <SortableHeader label="Stato" field="state" {...sortProps} />
            <th scope="col">
              <span className="visually-hidden">Azioni</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => {
            const isRejected = request.state === "rejected";
            const isOpen = openRequestId === request._id;
            // nome completo per gli screen reader: in pagina ci sono tanti bottoni uguali
            const requestName = `${request.product.name}, ${request.store.name}`;

            return (
              // Fragment: due righe per richiesta (la seconda solo con il motivo aperto);
              // la key va sul Fragment perché è lui l'elemento del map
              <Fragment key={request._id}>
                <tr className={isRejected ? "supply-row-off" : ""}>
                  <td>
                    <div className="supply-product">
                      <ProductThumb product={request.product} />
                      <div>
                        <span className="supply-product-name">
                          {request.product.name}
                        </span>
                        <span className="supply-product-category">
                          {request.product.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  {showStore && <td>{request.store.name}</td>}
                  <td className="supply-amount">
                    {request.requestedAmount} pz
                  </td>
                  <td>{formatFullName(request.requestedBy)}</td>
                  <td>{formatShortDate(request.createdAt)}</td>
                  {/* respinta: al posto del badge il pulsante che apre il motivo */}
                  <td>
                    {isRejected ? (
                      <CancelledToggle
                        label="Respinta"
                        ariaLabel={`Motivo della richiesta respinta di ${requestName}`}
                        isOpen={isOpen}
                        onToggle={() => toggleDetails(request._id)}
                      />
                    ) : (
                      <SupplyStateBadge request={request} />
                    )}
                  </td>
                  <td>
                    <div className="supply-actions">
                      {/* il responsabile decide sulle richieste in attesa:
                          "Accogli" con il testo, "Respingi" solo con la X (la tabella resta stretta) */}
                      {onAccept && request.state === "open" && (
                        <>
                          <Button
                            variant="secondary"
                            aria-label={`Accogli la richiesta di ${requestName}`}
                            onClick={() => onAccept(request)}
                          >
                            <Check size={16} aria-hidden="true" />
                            Accogli
                          </Button>
                          <Button
                            variant="danger"
                            className="app-button-icon"
                            aria-label={`Respingi la richiesta di ${requestName}`}
                            title="Respingi"
                            onClick={() => onReject(request)}
                          >
                            <X size={16} aria-hidden="true" />
                          </Button>
                        </>
                      )}
                      {canDelete(request) && (
                        <Button
                          variant="danger"
                          className="app-button-icon"
                          aria-label={`Annulla la richiesta di ${requestName}`}
                          onClick={() => onDelete(request)}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
                {/* il motivo sotto, su tutta la larghezza, solo dopo il clic */}
                {isRejected && isOpen && (
                  <tr className="supply-row-off supply-details-row">
                    <td colSpan={columnCount}>
                      <RejectedNote request={request} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SupplyRequestTable;
