// import
import "./productTable.css";
import { Pencil, Trash2 } from "lucide-react";

import { formatEuro } from "../../../utils/formatEuro";
import { isLowStock } from "../../../utils/isLowStock";

import Badge from "../../common/badge/Badge";
import Button from "../../common/button/Button";
import SortableHeader from "../../common/sortableHeader/SortableHeader";
import ProductThumb from "../productThumb/ProductThumb";

// componente ProductTable: tabella del Catalogo da 1366px (sotto le card).
// props: products, stocksOf(product) = le sue giacenze, showStore = negozio e colonna Stato,
// sort e onSort = l'ordine, onEdit e onDelete = i bottoni (solo il responsabile)
const ProductTable = ({
  products,
  stocksOf,
  showStore,
  sort,
  onSort,
  onEdit,
  onDelete,
}) => {
  // props uguali per le intestazioni che ordinano
  const sortProps = { sort, onSort };

  return (
    // se non ci sta, scorre in orizzontale
    <div className="app-card app-table-wrap">
      <table className="app-table product-table">
        <thead>
          <tr>
            <SortableHeader label="Prodotto" field="name" {...sortProps} />
            <SortableHeader label="Categoria" field="category" {...sortProps} />
            <SortableHeader label="Prezzo" field="price" {...sortProps} />
            <SortableHeader label="IVA" field="vatRate" {...sortProps} />
            <th scope="col">{showStore ? "Giacenze" : "Disponibili"}</th>
            {showStore && (
              <SortableHeader label="Stato" field="state" {...sortProps} />
            )}
            {onEdit && (
              <th scope="col">
                <span className="visually-hidden">Azioni</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const productStocks = stocksOf(product);
            return (
              // riga grigia se non è attivo
              <tr
                key={product._id}
                className={product.active ? "" : "product-row-off"}
              >
                <td>
                  <div className="product-table-name">
                    <ProductThumb product={product} />
                    <strong>{product.name}</strong>
                  </div>
                </td>
                <td className="product-table-category">{product.category}</td>
                <td>
                  <strong>{formatEuro(product.price)}</strong>
                </td>
                <td>{product.vatRate}%</td>
                {/* pezzi per negozio: verde se ok, arancio sotto soglia */}
                <td>
                  {productStocks.length === 0 ? (
                    <Badge color="neutral">Non in negozio</Badge>
                  ) : (
                    <ul className="product-table-stock">
                      {productStocks.map((stock) => (
                        <li key={stock._id}>
                          {showStore && <span>{stock.store.name}</span>}
                          <Badge
                            color={isLowStock(stock) ? "warning" : "success"}
                          >
                            {stock.amount} pz
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                {showStore && (
                  <td>
                    {product.active ? (
                      <Badge color="primary">Attivo</Badge>
                    ) : (
                      <Badge color="neutral">Non attivo</Badge>
                    )}
                  </td>
                )}
                {onEdit && (
                  <td>
                    <div className="product-table-actions">
                      <Button
                        variant="secondary"
                        aria-label={`Modifica ${product.name}`}
                        onClick={() => onEdit(product)} // apro il modulo con il prodotto
                      >
                        <Pencil size={16} aria-hidden="true" />
                        Modifica
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
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
