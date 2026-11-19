import "./checkoutProductCard.css";
import { Plus } from "lucide-react";

import { formatEuro } from "../../../utils/formatEuro";
import { isLowStock } from "../../../utils/isLowStock";

import Badge from "../../common/badge/Badge";
import Button from "../../common/button/Button";
import ProductThumb from "../productThumb/ProductThumb";

// card compatta della Cassa: foto piccola, nome e categoria, prezzo e pezzi, "Aggiungi".
// Più bassa della card del Catalogo, così su tablet si vedono più prodotti senza scorrere.
// stock: la giacenza del negozio (undefined se il prodotto non c'è);
// onAdd: aggiunge un pezzo al carrello; addDisabled spegne il bottone (pezzi finiti)
const CheckoutProductCard = ({ product, stock, onAdd, addDisabled }) => {
  return (
    <article className="app-card checkout-product-card">
      <div className="checkout-product-card-top">
        <ProductThumb product={product} size={56} />
        <div className="checkout-product-card-info">
          <h2 className="checkout-product-card-name">{product.name}</h2>
          {/* la categoria arriva in minuscolo: la maiuscola la mette il CSS */}
          <p className="checkout-product-card-category">{product.category}</p>
        </div>
      </div>

      {/* prezzo a sinistra, pezzi a destra: arancio se sotto la soglia, come nel Catalogo */}
      <div className="checkout-product-card-row">
        <span className="checkout-product-card-price">
          {formatEuro(product.price)}
        </span>
        {stock ? (
          <Badge color={isLowStock(stock) ? "warning" : "success"}>
            {stock.amount} pz
          </Badge>
        ) : (
          <Badge color="neutral">Non in negozio</Badge>
        )}
      </div>

      <Button
        className="w-100"
        aria-label={`Aggiungi ${product.name} al carrello`}
        onClick={() => onAdd(product)}
        disabled={addDisabled}
      >
        <Plus size={16} aria-hidden="true" />
        Aggiungi
      </Button>
    </article>
  );
};

export default CheckoutProductCard;
