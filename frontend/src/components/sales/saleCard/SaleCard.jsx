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

// card di una vendita, fino a 1366px (stesse props di SaleTable):
// in alto ora (e negozio) e totale, sotto chi ha venduto, i pezzi e il pagamento.
// Una vendita annullata ha il pulsante per aprire i dettagli: chiusa è alta come le altre
const SaleCard = ({ sale, showStore, showSeller, onCancel }) => {
  // dettagli dell'annullamento aperti o chiusi (ogni card ha il suo)
  const [showDetails, setShowDetails] = useState(false);

  // "3 articoli" oppure, per il responsabile, "Marta Bianchi · 3 articoli"
  const itemCount = countSaleItems(sale);
  const itemsLabel = `${itemCount} ${itemCount === 1 ? "articolo" : "articoli"}`;
  const detail = showSeller
    ? `${formatFullName(sale.soldBy)} · ${itemsLabel}`
    : itemsLabel;

  // apre o chiude i dettagli: !prev è il contrario di com'era
  const toggleDetails = () => setShowDetails((prevShow) => !prevShow);

  return (
    // annullata: card grigia e totale barrato
    <article
      className={`app-card sale-card ${sale.cancelled ? "sale-card-off" : ""}`}
    >
      <div className="sale-card-row">
        {/* su una riga sola: se il negozio è lungo finisce con "...", così le card sono alte uguali */}
        <h2 className="sale-card-title">
          {formatSaleTime(sale.createdAt)}
          {showStore && ` · ${sale.store.name}`}
        </h2>
        <strong className="sale-card-total">{formatEuro(sale.total)}</strong>
      </div>
      <div className="sale-card-row">
        <p className="sale-card-detail">{detail}</p>
        {/* responsabile (nessun bottone sotto): il pulsante "Annullata" al posto del pagamento */}
        {sale.cancelled && !onCancel ? (
          <CancelledToggle
            ariaLabel={`Dettagli della vendita annullata delle ${formatSaleTime(sale.createdAt)}`}
            isOpen={showDetails}
            onToggle={toggleDetails}
          />
        ) : (
          <PaymentMethod method={sale.paymentMethod} />
        )}
      </div>

      {/* dipendente: "Annulla vendita", oppure "Vendita annullata" se lo è già */}
      {onCancel && (
        <div className="sale-card-actions">
          {sale.cancelled ? (
            <CancelledToggle
              large
              label="Vendita annullata"
              ariaLabel={`Dettagli della vendita annullata delle ${formatSaleTime(sale.createdAt)}`}
              isOpen={showDetails}
              onToggle={toggleDetails}
            />
          ) : (
            <Button
              variant="danger"
              aria-label={`Annulla la vendita delle ${formatSaleTime(sale.createdAt)}`}
              onClick={() => onCancel(sale)}
            >
              <Undo2 size={16} aria-hidden="true" />
              Annulla vendita
            </Button>
          )}
        </div>
      )}

      {/* i dettagli solo dopo il clic: la card si allunga e torna com'era richiudendo */}
      {sale.cancelled && showDetails && <CancelledNote sale={sale} />}
    </article>
  );
};

export default SaleCard;
