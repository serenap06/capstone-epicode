// import
import "./saleCard.css";
import { useState } from "react";
import { Undo2 } from "lucide-react";

import { countSaleItems } from "../../../utils/countSaleItems";
import { formatEuro } from "../../../utils/formatEuro";
import { formatFullName } from "../../../utils/formatFullName";
import { formatSaleTime } from "../../../utils/formatSaleTime";

import Button from "../../common/button/Button";
import CancelledNote from "../cancelledNote/CancelledNote";
import CancelledToggle from "../cancelledToggle/CancelledToggle";
import PaymentMethod from "../paymentMethod/PaymentMethod";

// componente SaleCard: card di una vendita fino a 1366px (stesse props di SaleTable).
// props: sale, showStore, showSeller, onCancel = "Annulla vendita" (solo il dipendente),
// canCancel = true se questa vendita si può annullare
const SaleCard = ({ sale, showStore, showSeller, onCancel, canCancel }) => {
  // dettagli dell'annullamento aperti o chiusi
  const [showDetails, setShowDetails] = useState(false);

  // "3 articoli", con showSeller "Marta Bianchi · 3 articoli"
  const itemCount = countSaleItems(sale);
  const itemsLabel = `${itemCount} ${itemCount === 1 ? "articolo" : "articoli"}`;
  const detail = showSeller
    ? `${formatFullName(sale.soldBy)} · ${itemsLabel}`
    : itemsLabel;

  // apro o chiudo i dettagli
  const toggleDetails = () => setShowDetails((prevShow) => !prevShow);

  return (
    // annullata: card grigia e totale barrato
    <article
      className={`app-card sale-card ${sale.cancelled ? "sale-card-off" : ""}`}
    >
      <div className="sale-card-row">
        {/* una riga sola: il negozio lungo finisce con "..." */}
        <h2 className="sale-card-title">
          {formatSaleTime(sale.createdAt)}
          {showStore && ` · ${sale.store.name}`}
        </h2>
        <strong className="sale-card-total">{formatEuro(sale.total)}</strong>
      </div>
      <div className="sale-card-row">
        <p className="sale-card-detail">{detail}</p>
        {/* responsabile: "Annullata" al posto del pagamento */}
        {sale.cancelled && !onCancel ? (
          <CancelledToggle
            ariaLabel={`Dettagli della vendita annullata delle ${formatSaleTime(sale.createdAt)}`}
            isOpen={showDetails}
            onToggle={toggleDetails} // apro o chiudo i dettagli
          />
        ) : (
          <PaymentMethod method={sale.paymentMethod} />
        )}
      </div>

      {/* dipendente: "Vendita annullata", oppure "Annulla vendita" sulle sue di oggi */}
      {onCancel && (sale.cancelled || canCancel(sale)) && (
        <div className="sale-card-actions">
          {sale.cancelled ? (
            <CancelledToggle
              large
              label="Vendita annullata"
              ariaLabel={`Dettagli della vendita annullata delle ${formatSaleTime(sale.createdAt)}`}
              isOpen={showDetails}
              onToggle={toggleDetails} // apro o chiudo i dettagli
            />
          ) : (
            <Button
              variant="danger"
              aria-label={`Annulla la vendita delle ${formatSaleTime(sale.createdAt)}`}
              onClick={() => onCancel(sale)} // apro il modale con il motivo
            >
              <Undo2 size={16} aria-hidden="true" />
              Annulla vendita
            </Button>
          )}
        </div>
      )}

      {/* dettagli solo dopo il clic */}
      {sale.cancelled && showDetails && <CancelledNote sale={sale} />}
    </article>
  );
};

export default SaleCard;
