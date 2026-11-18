import "./saleTable.css";
import { Fragment, useState } from "react";
import { Undo2 } from "lucide-react";

import { countSaleItems } from "../../../utils/countSaleItems";
import { formatEuro } from "../../../utils/formatEuro";
import { formatFullName } from "../../../utils/formatFullName";
import { formatSaleTime } from "../../../utils/formatSaleTime";

import Button from "../../common/button/Button";
import CancelledNote from "../cancelledNote/CancelledNote";
import CancelledToggle from "../cancelledToggle/CancelledToggle";
import PaymentMethod from "../paymentMethod/PaymentMethod";
import SortableHeader from "../../common/sortableHeader/SortableHeader";

// tabella delle vendite, da 1366px in su. showStore e showSeller: le colonne Negozio e
// Venduto da (per il responsabile). onCancel: il bottone "Annulla vendita" (solo il dipendente).
// sort e onSort: l'ordine scelto e cosa fare al clic su un'intestazione (ordina il server)
const SaleTable = ({
  sales,
  showStore,
  showSeller,
  sort,
  onSort,
  onCancel,
}) => {
  // l'id della vendita annullata con i dettagli aperti (uno alla volta), oppure null
  const [openSaleId, setOpenSaleId] = useState(null);

  // quante colonne ha la tabella: la riga dei dettagli le occupa tutte (colSpan)
  const columnCount =
    4 + (showStore ? 1 : 0) + (showSeller ? 1 : 0) + (onCancel ? 1 : 0);

  // apre i dettagli di una vendita, o li chiude se erano già aperti
  const toggleDetails = (saleId) =>
    setOpenSaleId((prevId) => (prevId === saleId ? null : saleId));

  // props uguali per tutte le intestazioni che ordinano
  const sortProps = { sort, onSort };

  return (
    // se la tabella non ci sta, scorre in orizzontale dentro il riquadro
    <div className="app-card app-table-wrap">
      <table className="app-table sale-table">
        <thead>
          <tr>
            <SortableHeader label="Ora" field="date" {...sortProps} />
            {showStore && (
              <SortableHeader label="Negozio" field="store" {...sortProps} />
            )}
            {showSeller && (
              <SortableHeader
                label="Venduto da"
                field="seller"
                {...sortProps}
              />
            )}
            <SortableHeader label="Articoli" field="items" {...sortProps} />
            <SortableHeader label="Pagamento" field="payment" {...sortProps} />
            <SortableHeader
              label="Totale"
              field="total"
              className="text-end"
              {...sortProps}
            />
            {onCancel && (
              <th scope="col">
                <span className="visually-hidden">Azioni</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => {
            const isOpen = openSaleId === sale._id;
            return (
              // Fragment: due righe per vendita (la seconda solo con i dettagli aperti);
              // la key va sul Fragment perché è lui l'elemento del map
              <Fragment key={sale._id}>
                {/* annullata: riga grigia e il pulsante dei dettagli. Responsabile: "Annullata"
                    accanto all'ora (non ha la colonna dei bottoni); dipendente: "Vendita annullata"
                    al posto di "Annulla vendita" */}
                <tr className={sale.cancelled ? "sale-row-off" : ""}>
                  <td>
                    <div className="sale-time-cell">
                      <strong>{formatSaleTime(sale.createdAt)}</strong>
                      {sale.cancelled && !onCancel && (
                        <CancelledToggle
                          ariaLabel={`Dettagli della vendita annullata delle ${formatSaleTime(sale.createdAt)}`}
                          isOpen={isOpen}
                          onToggle={() => toggleDetails(sale._id)}
                        />
                      )}
                    </div>
                  </td>
                  {showStore && <td>{sale.store.name}</td>}
                  {showSeller && <td>{formatFullName(sale.soldBy)}</td>}
                  <td>{countSaleItems(sale)}</td>
                  <td>
                    <PaymentMethod method={sale.paymentMethod} />
                  </td>
                  <td className="text-end">
                    <strong className="sale-total">
                      {formatEuro(sale.total)}
                    </strong>
                  </td>
                  {onCancel && (
                    <td className="text-end">
                      {/* già annullata: al posto di "Annulla vendita", stesso posto e stessa altezza,
                          il pulsante che apre i dettagli */}
                      {sale.cancelled ? (
                        <CancelledToggle
                          large
                          label="Vendita annullata"
                          ariaLabel={`Dettagli della vendita annullata delle ${formatSaleTime(sale.createdAt)}`}
                          isOpen={isOpen}
                          onToggle={() => toggleDetails(sale._id)}
                        />
                      ) : (
                        <Button
                          variant="danger"
                          aria-label={`Annulla la vendita delle ${formatSaleTime(sale.createdAt)}`}
                          onClick={() => onCancel(sale)}
                        >
                          <Undo2 size={16} aria-hidden="true" />
                          <span className="app-button-label">
                            Annulla vendita
                          </span>
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
                {/* i dettagli sotto, su tutta la larghezza, solo dopo il clic */}
                {sale.cancelled && isOpen && (
                  <tr className="sale-row-off sale-details-row">
                    <td colSpan={columnCount}>
                      <CancelledNote sale={sale} />
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

export default SaleTable;
