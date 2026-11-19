// import
import "./soldProducts.css";
import { useRef, useState } from "react";

import { formatEuro } from "../../../utils/formatEuro";
import { getCategories } from "../../../utils/getCategories";
import { getNextSort } from "../../../utils/getNextSort";
import { getPercent } from "../../../utils/getPercent";
import { PAGE_SIZE } from "../../../utils/pageSize";
import { sortList } from "../../../utils/sortList";
import { toCategoryOptions } from "../../../utils/toCategoryOptions";

import FilterBar from "../../common/filterBar/FilterBar";
import FilterSearch from "../../common/filterBar/FilterSearch";
import FilterSelect from "../../common/filterBar/FilterSelect";
import Message from "../../common/message/Message";
import Pagination from "../../common/pagination/Pagination";
import SortableHeader from "../../common/sortableHeader/SortableHeader";

// su cosa ordinare ogni colonna
const SORT_VALUES = {
  name: (product) => product.name,
  category: (product) => product.category,
  quantity: (product) => product.quantity,
  revenue: (product) => product.revenue,
};

// componente SoldProducts: tutti i prodotti venduti, con ricerca, categoria, ordine e pagine.
// Arrivano già tutti con il report: filtri e pagine li fa il browser.
// props: products = le righe del server, totalRevenue = per la quota
const SoldProducts = ({ products, totalRevenue }) => {
  // filtri ("" = nessuno)
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  // si parte dal più venduto
  const [sort, setSort] = useState({ field: "quantity", direction: "desc" });
  const [page, setPage] = useState(1);
  // inizio del riquadro: cambiando pagina torno qui
  const listStartRef = useRef(null);

  // prodotti nuovi (altro periodo o negozio): torno alla pagina 1 (prevProducts = l'elenco di prima)
  const [prevProducts, setPrevProducts] = useState(products);
  if (products !== prevProducts) {
    setPrevProducts(products);
    setPage(1);
  }

  // categorie per il menu, senza quelle vuote; tengo anche quella scelta se nel periodo non c'è
  const categories = getCategories(products).filter(Boolean);
  if (category && !categories.includes(category)) categories.push(category);
  const categoryOptions = toCategoryOptions(categories.sort());

  // prodotti che passano i filtri, nell'ordine scelto
  const visibleProducts = sortList(
    products.filter(
      (product) =>
        product.name.toLowerCase().includes(search.toLowerCase()) &&
        (!category || product.category === category),
    ),
    SORT_VALUES[sort.field],
    sort.direction,
  );

  // le pagine e i 10 prodotti della pagina
  const totalPages = Math.ceil(visibleProducts.length / PAGE_SIZE);
  const pageProducts = visibleProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  // filtro nuovo: pagina 1
  const changeSearch = (value) => {
    setSearch(value);
    setPage(1);
  };
  // nuova categoria: pagina 1
  const changeCategory = (value) => {
    setCategory(value);
    setPage(1);
  };

  // clic su un'intestazione: nuovo ordine e pagina 1
  const sortByColumn = (field) => {
    setSort((prevSort) => getNextSort(prevSort, field));
    setPage(1);
  };
  // props uguali per le intestazioni che ordinano
  const sortProps = { sort, onSort: sortByColumn };

  return (
    <div ref={listStartRef} className="sold-products">
      <FilterBar>
        <FilterSearch
          label="Cerca un prodotto"
          value={search}
          onChange={changeSearch} // nuova ricerca: pagina 1
        />
        <FilterSelect
          label="Categoria"
          allLabel="Tutte le categorie"
          options={categoryOptions}
          value={category}
          onChange={changeCategory} // nuova categoria: pagina 1
        />
      </FilterBar>

      {visibleProducts.length === 0 ? (
        <Message>Nessun prodotto con questi filtri</Message>
      ) : (
        <div className="app-table-wrap">
          <table className="app-table sold-products-table">
            <thead>
              <tr>
                <SortableHeader label="Prodotto" field="name" {...sortProps} />
                {/* su telefono categoria e quota si nascondono */}
                <SortableHeader
                  label="Categoria"
                  field="category"
                  className="sold-products-extra"
                  {...sortProps}
                />
                <SortableHeader
                  label="Pezzi"
                  field="quantity"
                  className="text-end"
                  {...sortProps}
                />
                <SortableHeader
                  label="Incasso"
                  field="revenue"
                  className="text-end"
                  {...sortProps}
                />
                <th scope="col" className="text-end sold-products-extra">
                  Quota
                </th>
              </tr>
            </thead>
            <tbody>
              {pageProducts.map((product) => (
                <tr key={product.product}>
                  <td className="sold-products-name">{product.name}</td>
                  <td className="sold-products-category sold-products-extra">
                    {product.category || "—"}
                  </td>
                  <td className="text-end">{product.quantity}</td>
                  <td className="text-end">
                    <strong>{formatEuro(product.revenue)}</strong>
                  </td>
                  <td className="text-end sold-products-share sold-products-extra">
                    {getPercent(product.revenue, totalRevenue)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* pagine, solo se sono più di una */}
      <Pagination
        page={page}
        totalPages={totalPages}
        label="Pagine dei prodotti venduti"
        onChange={setPage}
        scrollTarget={listStartRef} // cambiando pagina torno all'inizio del riquadro
      />
    </div>
  );
};

export default SoldProducts;
