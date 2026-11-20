// import
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

// componente SaleTable: tabella delle vendite da 1366px.
// props: sales, showStore e showSeller = colonne del responsabile, sort e onSort = l'ordine (lo fa il server),
// onCancel = "Annulla vendita" (solo il dipendente), canCancel = true se quella vendita si può annullare
const SaleTable = ({
  sales,
  showStore,
  showSeller,
  sort,
  onSort,
  onCancel,
  canCancel,
}) => {
  // id della vendita con i dettagli aperti (una alla volta)
  const [openSaleId, setOpenSaleId] = useState(null);

  // colonne della tabella: la riga dei dettagli le prende tutte
  const columnCount =
    4 + (showStore ? 1 : 0) + (showSeller ? 1 : 0) + (onCancel ? 1 : 0);

  // apro i dettagli, o li chiudo se erano aperti
  const toggleDetails = (saleId) =>
    setOpenSaleId((prevId) => (prevId === saleId ? null : saleId));

  // props uguali per le intestazioni che ordinano
  const sortProps = { sort, onSort };

  return (
    // se non ci sta, scorre in orizzontale
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
              // Fragment: due righe per vendita (la seconda con i dettagli); la key va su di lui
              <Fragment key={sale._id}>
                {/* annullata: riga grigia e pulsante dei dettagli (responsabile accanto all'ora, dipendente al posto del bottone) */}
                <tr className={sale.cancelled ? "sale-row-off" : ""}>
                  <td>
                    <div className="sale-time-cell">
                      <strong>{formatSaleTime(sale.createdAt)}</strong>
                      {sale.cancelled && !onCancel && (
                        <CancelledToggle
                          ariaLabel={`Dettagli della vendita annullata delle ${formatSaleTime(sale.createdAt)}`}
                          isOpen={isOpen}
                          onToggle={() => toggleDetails(sale._id)} // apro o chiudo i dettagli
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
                      {/* già annullata: il pulsante dei dettagli; "Annulla vendita" solo sulle sue di oggi */}
                      {sale.cancelled ? (
                        <CancelledToggle
                          large
                          label="Vendita annullata"
                          ariaLabel={`Dettagli della vendita annullata delle ${formatSaleTime(sale.createdAt)}`}
                          isOpen={isOpen}
                          onToggle={() => toggleDetails(sale._id)} // apro o chiudo i dettagli
                        />
                      ) : (
                        canCancel(sale) && (
                          <Button
                            variant="danger"
                            aria-label={`Annulla la vendita delle ${formatSaleTime(sale.createdAt)}`}
                            onClick={() => onCancel(sale)} // apro il modale con il motivo
                          >
                            <Undo2 size={16} aria-hidden="true" />
                            <span className="app-button-label">
                              Annulla vendita
                            </span>
                          </Button>
                        )
                      )}
                    </td>
                  )}
                </tr>
                {/* dettagli su tutta la larghezza, solo dopo il clic */}
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
