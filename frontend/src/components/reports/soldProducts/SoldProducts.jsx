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

// su cosa ordinare per ogni colonna
const SORT_VALUES = {
  name: (product) => product.name,
  category: (product) => product.category,
  quantity: (product) => product.quantity,
  revenue: (product) => product.revenue,
};

// tutti i prodotti venduti nel periodo, con ricerca, categoria, ordinamento e pagine da 10.
// I prodotti arrivano già tutti con il report: ricerca, filtro, ordine e pagine li fa il browser.
// products: le righe del server ({ product, name, category, quantity, revenue });
// totalRevenue: l'incasso del periodo, per la quota
const SoldProducts = ({ products, totalRevenue }) => {
  // filtri: "" = nessun filtro
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  // si parte dal più venduto
  const [sort, setSort] = useState({ field: "quantity", direction: "desc" });
  const [page, setPage] = useState(1);
  // l'inizio del riquadro: cambiando pagina si torna qui, non in cima al Report
  const listStartRef = useRef(null);

  // con un periodo o un negozio nuovo arrivano prodotti nuovi: torno alla prima pagina.
  // prevProducts ricorda l'elenco di prima; il controllo si fa mentre il componente si disegna
  const [prevProducts, setPrevProducts] = useState(products);
  if (products !== prevProducts) {
    setPrevProducts(products);
    setPage(1);
  }

  // le categorie dei prodotti venduti, per il menu (senza quelle vuote dei prodotti eliminati).
  // Se la categoria scelta non ha vendite nel periodo nuovo la tengo nel menu:
  // altrimenti il menu direbbe "Tutte le categorie" con il filtro ancora attivo
  const categories = getCategories(products).filter(Boolean);
  if (category && !categories.includes(category)) categories.push(category);
  const categoryOptions = toCategoryOptions(categories.sort());

  // i prodotti che passano i filtri, nell'ordine scelto; la ricerca ignora le maiuscole
  const visibleProducts = sortList(
    products.filter(
      (product) =>
        product.name.toLowerCase().includes(search.toLowerCase()) &&
        (!category || product.category === category),
    ),
    SORT_VALUES[sort.field],
    sort.direction,
  );

  // le pagine: quante sono e i 10 prodotti della pagina scelta
  const totalPages = Math.ceil(visibleProducts.length / PAGE_SIZE);
  const pageProducts = visibleProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  // ricerca e categoria: con un filtro nuovo si riparte dalla prima pagina
  const changeSearch = (value) => {
    setSearch(value);
    setPage(1);
  };
  const changeCategory = (value) => {
    setCategory(value);
    setPage(1);
  };

  // clic su un'intestazione: stessa colonna inverte, colonna nuova crescente;
  // anche qui si riparte dalla prima pagina
  const sortByColumn = (field) => {
    setSort((prevSort) => getNextSort(prevSort, field));
    setPage(1);
  };
  // props uguali per tutte le intestazioni che ordinano
  const sortProps = { sort, onSort: sortByColumn };

  return (
    <div ref={listStartRef} className="sold-products">
      <FilterBar>
        <FilterSearch
          label="Cerca un prodotto"
          value={search}
          onChange={changeSearch}
        />
        <FilterSelect
          label="Categoria"
          allLabel="Tutte le categorie"
          options={categoryOptions}
          value={category}
          onChange={changeCategory}
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
                {/* su telefono categoria e quota si nascondono (soldProducts.css) */}
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

      {/* le pagine, solo se sono più di una; cambiando pagina torno all'inizio del riquadro */}
      <Pagination
        page={page}
        totalPages={totalPages}
        label="Pagine dei prodotti venduti"
        onChange={setPage}
        scrollTarget={listStartRef}
      />
    </div>
  );
};

export default SoldProducts;
