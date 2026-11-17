import "./productCard.css";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { formatEuro } from "../../../utils/formatEuro";
import { isLowStock } from "../../../utils/isLowStock";
import Badge from "../../common/badge/Badge";
import Button from "../../common/button/Button";

// card di un prodotto del catalogo: foto, nome, prezzo, categoria e IVA.
// stocks: le giacenze di questo prodotto (una per negozio; il dipendente riceve solo la sua).
// showStore: scrive il negozio accanto ai pezzi (per il responsabile, che vede tutti i negozi).
// onEdit e onDelete: i bottoni compaiono solo se la pagina li passa (solo il responsabile).
// onAdd: il bottone "Aggiungi" della Cassa; addDisabled lo spegne (pezzi finiti)
const ProductCard = ({
  product,
  stocks,
  showStore,
  onEdit,
  onDelete,
  onAdd,
  addDisabled,
}) => {
  return (
    // grigia se il prodotto non è attivo (lo vede solo il responsabile)
    <article
      className={`app-card product-card ${product.active ? "" : "product-card-off"}`}
    >
      {/* foto intera su fondo chiaro (contain: non la taglia), oppure l'iniziale */}
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
        {/* i pezzi: una riga per negozio, con il numero in un badge
            (magenta se va bene, arancio se è sotto la soglia, come nelle Giacenze).
            Il dipendente ha una riga sola: "Disponibili" e il badge */}
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
                <Badge color={isLowStock(stock) ? "warning" : "primary"}>
                  {stock.amount} pz
                </Badge>
              </li>
            ))}
          </ul>
        )}

        {/* in Cassa: aggiunge un pezzo al carrello, spento se non ce ne sono più */}
        {onAdd && (
          <div className="product-card-actions">
            <Button
              className="w-100"
              aria-label={`Aggiungi ${product.name} al carrello`}
              onClick={() => onAdd(product)}
              disabled={addDisabled}
            >
              <Plus size={16} aria-hidden="true" />
              Aggiungi
            </Button>
          </div>
        )}

        {onEdit && (
          <div className="product-card-actions">
            {/* su telefono il testo si nasconde e resta la matita (vedi productCard.css) */}
            <Button
              variant="secondary"
              aria-label={`Modifica ${product.name}`}
              onClick={() => onEdit(product)}
            >
              <Pencil size={16} aria-hidden="true" />
              <span className="product-card-edit-label">Modifica</span>
            </Button>
            <Button
              variant="danger"
              className="app-button-icon"
              aria-label={`Elimina ${product.name}`}
              onClick={() => onDelete(product)}
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
