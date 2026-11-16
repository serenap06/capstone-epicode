import "./stockTable.css";
import { Pencil, Trash2 } from "lucide-react";
import { isLowStock } from "../../../utils/isLowStock";
import Button from "../../common/button/Button";
import ProductThumb from "../../products/productThumb/ProductThumb";
import StockStatusBadge from "../stockStatusBadge/StockStatusBadge";

// tabella delle giacenze, da tablet in su. showStore: la colonna Negozio (per il responsabile).
// onEdit e onDelete: i bottoni compaiono solo se la pagina li passa (solo il responsabile modifica)
const StockTable = ({ stocks, showStore, onEdit, onDelete }) => {
  const hasActions = Boolean(onEdit);

  return (
    // se la tabella non ci sta, scorre in orizzontale dentro il riquadro
    <div className="stock-table-wrap">
      <table className="stock-table">
        <thead>
          <tr>
            <th scope="col">Prodotto</th>
            {showStore && <th scope="col">Negozio</th>}
            <th scope="col">Quantità</th>
            <th scope="col">Soglia</th>
            <th scope="col">Stato</th>
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
              {/* quantità arancio quando è sotto la soglia */}
              <td
                className={`stock-amount ${isLowStock(stock) ? "stock-amount-low" : ""}`}
              >
                {stock.amount}
              </td>
              <td className="stock-threshold">{stock.minThreshold}</td>
              <td>
                <StockStatusBadge stock={stock} />
              </td>
              {/* aria-label con prodotto e negozio: in pagina ci sono tanti bottoni uguali */}
              {hasActions && (
                <td>
                  <div className="stock-actions">
                    <Button
                      variant="secondary"
                      aria-label={`Modifica ${stock.product.name}, ${stock.store.name}`}
                      onClick={() => onEdit(stock)}
                    >
                      <Pencil size={16} aria-hidden="true" />
                      Modifica
                    </Button>
                    <Button
                      variant="danger"
                      className="app-button-icon"
                      aria-label={`Elimina ${stock.product.name}, ${stock.store.name}`}
                      onClick={() => onDelete(stock)}
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
