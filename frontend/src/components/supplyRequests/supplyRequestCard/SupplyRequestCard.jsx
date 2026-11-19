// import
import "./supplyRequestCard.css";
import { useState } from "react";
import { Check, Trash2, X } from "lucide-react";

import { formatFullName } from "../../../utils/formatFullName";
import { formatShortDate } from "../../../utils/formatShortDate";

import Button from "../../common/button/Button";
import ProductThumb from "../../products/productThumb/ProductThumb";
import CancelledToggle from "../../sales/cancelledToggle/CancelledToggle";
import RejectedNote from "../rejectedNote/RejectedNote";
import SupplyStateBadge from "../supplyStateBadge/SupplyStateBadge";

// componente SupplyRequestCard: card di una richiesta fino a 1366px (stesse props di SupplyRequestTable).
// props: request, showStore, onAccept e onReject (responsabile), canDelete(request) e onDelete (dipendente)
const SupplyRequestCard = ({
  request,
  showStore,
  onAccept,
  onReject,
  canDelete,
  onDelete,
}) => {
  // motivo della respinta aperto o chiuso
  const [showDetails, setShowDetails] = useState(false);

  const isRejected = request.state === "rejected";
  const requestedBy = formatFullName(request.requestedBy);
  // nome completo per lo screen reader: i bottoni sono tanti
  const requestName = `${request.product.name}, ${request.store.name}`;
  // il responsabile decide solo su quelle in attesa
  const canDecide = onAccept && request.state === "open";

  return (
    <article
      className={`app-card supply-card ${isRejected ? "supply-card-off" : ""}`}
    >
      <div className="supply-card-top">
        <ProductThumb product={request.product} size={48} />
        <div className="supply-card-info">
          <h2 className="supply-card-name">{request.product.name}</h2>
          {/* il responsabile vede anche il negozio */}
          <p className="supply-card-detail">
            {/* negozio e nome vanno a capo interi */}
            {showStore && (
              <span className="supply-card-part">{request.store.name} ·</span>
            )}{" "}
            <span className="supply-card-part">{requestedBy}</span>
          </p>
        </div>
        <p className="supply-card-amount">
          {request.requestedAmount}
          <span>pz</span>
        </p>
      </div>

      <div className="supply-card-bottom">
        <div className="supply-card-state">
          {/* respinta: al posto del badge il pulsante del motivo */}
          {isRejected ? (
            <CancelledToggle
              label="Respinta"
              ariaLabel={`Motivo della richiesta respinta di ${requestName}`}
              isOpen={showDetails}
              onToggle={() => setShowDetails((prevShow) => !prevShow)} // apro o chiudo il motivo
            />
          ) : (
            <SupplyStateBadge request={request} />
          )}
          <span className="supply-card-date">
            {formatShortDate(request.createdAt)}
          </span>
        </div>
        {(canDecide || canDelete(request)) && (
          <div className="supply-card-actions">
            {/* il responsabile decide (su telefono solo le icone) */}
            {canDecide && (
              <>
                <Button
                  variant="secondary"
                  aria-label={`Accogli la richiesta di ${requestName}`}
                  onClick={() => onAccept(request)} // accolgo la richiesta
                >
                  <Check size={16} aria-hidden="true" />
                  <span className="app-button-label">Accogli</span>
                </Button>
                <Button
                  variant="danger"
                  aria-label={`Respingi la richiesta di ${requestName}`}
                  onClick={() => onReject(request)} // apro il modale con il motivo
                >
                  <X size={16} aria-hidden="true" />
                  <span className="app-button-label">Respingi</span>
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
        )}
      </div>

      {/* il motivo, dopo il clic su "Respinta" */}
      {isRejected && showDetails && <RejectedNote request={request} />}
    </article>
  );
};

export default SupplyRequestCard;
