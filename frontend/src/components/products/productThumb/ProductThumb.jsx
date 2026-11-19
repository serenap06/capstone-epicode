// import
import "./productThumb.css";

// componente ProductThumb: foto piccola del prodotto, oppure l'iniziale.
// props: product, size = 44 (tabelle), 48 (card) o 56 (Cassa), ognuno con la sua classe
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
