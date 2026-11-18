import "./stockCard.css";
import { Pencil, Trash2 } from "lucide-react";
import { isLowStock } from "../../../utils/isLowStock";
import Button from "../../common/button/Button";
import ProductThumb from "../../products/productThumb/ProductThumb";
import StockStatusBadge from "../stockStatusBadge/StockStatusBadge";

// card di una giacenza, per telefono e tablet: foto, nome e negozio (o categoria), quantità a destra;
// sotto lo stato e, se la pagina li passa, i bottoni (stesse props di StockTable)
const StockCard = ({ stock, showStore, onEdit, onDelete }) => {
  return (
    <article className="app-card stock-card">
      <div className="stock-card-top">
        <ProductThumb product={stock.product} size={48} />
        <div className="stock-card-info">
          <h2 className="stock-card-name">{stock.product.name}</h2>
          <p className="stock-card-detail">
            {showStore ? stock.store.name : stock.product.category}
          </p>
        </div>
        <div className="stock-card-amount">
          <p
            className={`stock-card-number ${isLowStock(stock) ? "stock-card-number-low" : ""}`}
          >
            {stock.amount}
          </p>
          <p className="stock-card-threshold">soglia {stock.minThreshold}</p>
        </div>
      </div>

      <div className="stock-card-bottom">
        <StockStatusBadge stock={stock} />
        {onEdit && (
          <div className="stock-card-actions">
            {/* come nelle altre card: "Modifica" (su telefono solo la matita) e il cestino */}
            <Button
              variant="secondary"
              aria-label={`Modifica ${stock.product.name}, ${stock.store.name}`}
              onClick={() => onEdit(stock)}
            >
              <Pencil size={16} aria-hidden="true" />
              <span className="app-button-label">Modifica</span>
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
        )}
      </div>
    </article>
  );
};

export default StockCard;
