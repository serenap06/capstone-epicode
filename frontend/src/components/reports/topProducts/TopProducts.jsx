// import
import "./topProducts.css";

import { formatEuro } from "../../../utils/formatEuro";

// componente TopProducts: i più venduti con posizione, nome, pezzi e incasso.
// props: products = le righe del server, già in ordine
const TopProducts = ({ products }) => {
  return (
    <ol className="top-products">
      {products.map((product, index) => (
        <li key={product.product}>
          <span className="top-products-rank" aria-hidden="true">
            {index + 1}
          </span>
          <div className="top-products-info">
            <span className="top-products-name">{product.name}</span>
            <span className="top-products-detail">
              {product.quantity} pz venduti
            </span>
          </div>
          <strong>{formatEuro(product.revenue)}</strong>
        </li>
      ))}
    </ol>
  );
};

export default TopProducts;
