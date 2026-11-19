// import
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

// componente SupplyRequestTable: tabella delle richieste da 1366px.
// props: requests, showStore, sort e onSort, onAccept e onReject (responsabile),
// canDelete(request) e onDelete (il dipendente, sulle sue in attesa)
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
  // id della richiesta con il motivo aperto (una alla volta)
  const [openRequestId, setOpenRequestId] = useState(null);

  // props uguali per le intestazioni che ordinano
  const sortProps = { sort, onSort };
  // colonne: la riga del motivo le prende tutte
  const columnCount = showStore ? 7 : 6;

  // apro il motivo, o lo chiudo se era aperto
  const toggleDetails = (requestId) =>
    setOpenRequestId((prevId) => (prevId === requestId ? null : requestId));

  return (
    // se non ci sta, scorre in orizzontale
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
            // nome completo per lo screen reader
            const requestName = `${request.product.name}, ${request.store.name}`;

            return (
              // Fragment: due righe per richiesta (la seconda con il motivo); la key va su di lui
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
                  {/* respinta: il pulsante del motivo al posto del badge */}
                  <td>
                    {isRejected ? (
                      <CancelledToggle
                        label="Respinta"
                        ariaLabel={`Motivo della richiesta respinta di ${requestName}`}
                        isOpen={isOpen}
                        onToggle={() => toggleDetails(request._id)} // apro o chiudo il motivo
                      />
                    ) : (
                      <SupplyStateBadge request={request} />
                    )}
                  </td>
                  <td>
                    <div className="supply-actions">
                      {/* il responsabile decide su quelle in attesa ("Respingi" solo con la X) */}
                      {onAccept && request.state === "open" && (
                        <>
                          <Button
                            variant="secondary"
                            aria-label={`Accogli la richiesta di ${requestName}`}
                            onClick={() => onAccept(request)} // accolgo la richiesta
                          >
                            <Check size={16} aria-hidden="true" />
                            Accogli
                          </Button>
                          <Button
                            variant="danger"
                            className="app-button-icon"
                            aria-label={`Respingi la richiesta di ${requestName}`}
                            title="Respingi"
                            onClick={() => onReject(request)} // apro il modale con il motivo
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
                          onClick={() => onDelete(request)} // chiedo conferma prima di annullare
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
                {/* il motivo su tutta la larghezza, dopo il clic */}
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
