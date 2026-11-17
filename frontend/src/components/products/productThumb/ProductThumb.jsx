import "./productThumb.css";

// foto piccola del prodotto, oppure la sua iniziale in un quadrato viola chiaro.
// size: il lato in pixel; alt="" perché il nome è sempre scritto accanto
const ProductThumb = ({ product, size = 44 }) => {
  const style = { width: size, height: size };

  return product.image ? (
    <img src={product.image} alt="" className="product-thumb" style={style} />
  ) : (
    <span
      className="product-thumb product-thumb-letter"
      style={style}
      aria-hidden="true"
    >
      {product.name[0]}
    </span>
  );
};

export default ProductThumb;
