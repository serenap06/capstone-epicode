// import
import "./checkoutProductCard.css";
import { Plus } from "lucide-react";

import { formatEuro } from "../../../utils/formatEuro";
import { isLowStock } from "../../../utils/isLowStock";

import Badge from "../../common/badge/Badge";
import Button from "../../common/button/Button";
import ProductThumb from "../productThumb/ProductThumb";

// componente CheckoutProductCard: card compatta della Cassa (più bassa di quella del Catalogo).
// props: product, stock = la giacenza del negozio (undefined se non c'è),
// onAdd = aggiunge un pezzo al carrello, addDisabled = pezzi finiti
const CheckoutProductCard = ({ product, stock, onAdd, addDisabled }) => {
  return (
    <article className="app-card checkout-product-card">
      <div className="checkout-product-card-top">
        <ProductThumb product={product} size={56} />
        <div className="checkout-product-card-info">
          <h2 className="checkout-product-card-name">{product.name}</h2>
          {/* la maiuscola della categoria la mette il CSS */}
          <p className="checkout-product-card-category">{product.category}</p>
        </div>
      </div>

      {/* prezzo a sinistra, pezzi a destra (arancio sotto soglia, verde se ok) */}
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
        onClick={() => onAdd(product)} // aggiungo un pezzo al carrello
        disabled={addDisabled} // spento quando i pezzi sono finiti
      >
        <Plus size={16} aria-hidden="true" />
        Aggiungi
      </Button>
    </article>
  );
};

export default CheckoutProductCard;
