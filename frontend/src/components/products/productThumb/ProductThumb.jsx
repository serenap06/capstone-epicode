import "./productThumb.css";

// foto piccola del prodotto, oppure la sua iniziale in un quadrato viola chiaro.
// size: il lato in pixel, 44 (tabelle), 48 (card) o 56 (Cassa): ognuno ha la sua classe
// nel CSS (product-thumb-44...). alt="" perché il nome è sempre scritto accanto
const ProductThumb = ({ product, size = 44 }) => {
  const sizeClass = `product-thumb-${size}`;

  return product.image ? (
    <img src={product.image} alt="" className={`product-thumb ${sizeClass}`} />
  ) : (
    <span
      className={`product-thumb product-thumb-letter ${sizeClass}`}
      aria-hidden="true"
    >
      {product.name[0]}
    </span>
  );
};

export default ProductThumb;
