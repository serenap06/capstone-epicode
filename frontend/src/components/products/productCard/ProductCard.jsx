// import
import "./productCard.css";
import { Pencil, Trash2 } from "lucide-react";
import { formatEuro } from "../../../utils/formatEuro";
import { isLowStock } from "../../../utils/isLowStock";
import Badge from "../../common/badge/Badge";
import Button from "../../common/button/Button";

// componente ProductCard: card del Catalogo con foto, nome, prezzo, categoria e IVA.
// props: product, stocks = le sue giacenze, showStore = il negozio accanto ai pezzi,
// onEdit e onDelete = i bottoni (solo il responsabile)
const ProductCard = ({ product, stocks, showStore, onEdit, onDelete }) => {
  return (
    // grigia se non è attivo
    <article
      className={`app-card product-card ${product.active ? "" : "product-card-off"}`}
    >
      {/* foto intera (contain), oppure l'iniziale */}
      <div className="product-card-photo">
        {product.image ? (
          <img src={product.image} alt="" />
        ) : (
          <span aria-hidden="true">{product.name[0]}</span>
        )}
      </div>

      <div className="product-card-body">
        <h2 className="product-card-name">{product.name}</h2>
        <p className="product-card-price">{formatEuro(product.price)}</p>
        <p className="product-card-meta">
          {product.category} · IVA {product.vatRate}%
        </p>
        {!product.active && (
          <div>
            <Badge color="neutral">Non attivo</Badge>
          </div>
        )}
        {/* i pezzi, una riga per negozio: verde se ok, arancio sotto soglia */}
        {stocks && (
          <ul className="product-card-stock">
            {stocks.length === 0 && (
              <li>
                <Badge color="neutral">Non in negozio</Badge>
              </li>
            )}
            {stocks.map((stock) => (
              <li key={stock._id}>
                <span className="product-card-stock-store">
                  {showStore ? stock.store.name : "Disponibili"}
                </span>
                <Badge color={isLowStock(stock) ? "warning" : "success"}>
                  {stock.amount} pz
                </Badge>
              </li>
            ))}
          </ul>
        )}

        {onEdit && (
          <div className="product-card-actions">
            {/* su telefono resta solo la matita */}
            <Button
              variant="secondary"
              aria-label={`Modifica ${product.name}`}
              onClick={() => onEdit(product)} // apro il modulo con il prodotto
            >
              <Pencil size={16} aria-hidden="true" />
              <span className="app-button-label">Modifica</span>
            </Button>
            <Button
              variant="danger"
              className="app-button-icon"
              aria-label={`Elimina ${product.name}`}
              onClick={() => onDelete(product)} // chiedo conferma prima di eliminare
            >
              <Trash2 size={16} aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
