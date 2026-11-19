// import
import "./stockTable.css";
import { Pencil, Trash2 } from "lucide-react";
import { isLowStock } from "../../../utils/isLowStock";
import Button from "../../common/button/Button";
import SortableHeader from "../../common/sortableHeader/SortableHeader";
import ProductThumb from "../../products/productThumb/ProductThumb";
import StockStatusBadge from "../stockStatusBadge/StockStatusBadge";

// componente StockTable: tabella delle giacenze da 1366px.
// props: stocks, showStore = colonna Negozio, sort e onSort = l'ordine, onEdit e onDelete = i bottoni
const StockTable = ({ stocks, showStore, sort, onSort, onEdit, onDelete }) => {
  // props uguali per le intestazioni che ordinano
  const sortProps = { sort, onSort };

  // colonna dei bottoni solo se la pagina li passa
  const hasActions = Boolean(onEdit);

  return (
    // se non ci sta, scorre in orizzontale
    <div className="app-card app-table-wrap">
      <table className="app-table stock-table">
        <thead>
          <tr>
            <SortableHeader label="Prodotto" field="product" {...sortProps} />
            {showStore && (
              <SortableHeader label="Negozio" field="store" {...sortProps} />
            )}
            <SortableHeader label="Quantità" field="amount" {...sortProps} />
            <SortableHeader
              label="Soglia"
              field="minThreshold"
              {...sortProps}
            />
            <SortableHeader label="Stato" field="status" {...sortProps} />
            {hasActions && (
              <th scope="col">
                <span className="visually-hidden">Azioni</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock._id}>
              <td>
                <div className="stock-product">
                  <ProductThumb product={stock.product} />
                  <div>
                    <span className="stock-product-name">
                      {stock.product.name}
                    </span>
                    <span className="stock-product-category">
                      {stock.product.category}
                    </span>
                  </div>
                </div>
              </td>
              {showStore && <td>{stock.store.name}</td>}
              {/* quantità arancio sotto soglia */}
              <td
                className={`stock-amount ${isLowStock(stock) ? "stock-amount-low" : ""}`}
              >
                {stock.amount}
              </td>
              <td className="stock-threshold">{stock.minThreshold}</td>
              <td>
                <StockStatusBadge stock={stock} />
              </td>
              {/* aria-label con prodotto e negozio: i bottoni sono tanti */}
              {hasActions && (
                <td>
                  <div className="stock-actions">
                    <Button
                      variant="secondary"
                      aria-label={`Modifica ${stock.product.name}, ${stock.store.name}`}
                      onClick={() => onEdit(stock)} // apro il modulo con la giacenza
                    >
                      <Pencil size={16} aria-hidden="true" />
                      Modifica
                    </Button>
                    <Button
                      variant="danger"
                      className="app-button-icon"
                      aria-label={`Elimina ${stock.product.name}, ${stock.store.name}`}
                      onClick={() => onDelete(stock)} // chiedo conferma prima di eliminare
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;
