// import
import "./catalog.css";
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import { useAuth } from "../../hooks/useAuth";
import { useIsPhone } from "../../hooks/useIsPhone";
import { useShowCards } from "../../hooks/useShowCards";
import { loadData } from "../../api/loadData";
import { deleteProduct } from "../../api/products";
import { getNextSort } from "../../utils/getNextSort";
import { toCategoryOptions } from "../../utils/toCategoryOptions";
import { toQuery } from "../../utils/toQuery";

import AddButton from "../../components/common/addButton/AddButton";
import ConfirmDialog from "../../components/common/confirmDialog/ConfirmDialog";
import FilterBar from "../../components/common/filterBar/FilterBar";
import FilterChips from "../../components/common/filterBar/FilterChips";
import FilterSearch from "../../components/common/filterBar/FilterSearch";
import FilterSelect from "../../components/common/filterBar/FilterSelect";
import SortSelect from "../../components/common/filterBar/SortSelect";
import FormModal from "../../components/common/formModal/FormModal";
import Loader from "../../components/common/loader/Loader";
import Message from "../../components/common/message/Message";
import PageHeader from "../../components/common/pageHeader/PageHeader";
import Pagination from "../../components/common/pagination/Pagination";
import ProductCard from "../../components/products/productCard/ProductCard";
import ProductForm from "../../components/products/productForm/ProductForm";
import ProductTable from "../../components/products/productTable/ProductTable";

// filtro dello stato, solo per il responsabile
const STATE_OPTIONS = [
  { value: "", label: "Tutti" },
  { value: "active", label: "Attivi" },
  { value: "inactive", label: "Non attivi" },
];

// 12 prodotti per pagina: le card stanno 2, 3 o 4 per riga e l'ultima riga è sempre piena
const CATALOG_PAGE_SIZE = 12;

// ordine di partenza: nome A→Z
const DEFAULT_SORT = { field: "name", direction: "asc" };

// voci del menu "Ordina" delle card (lo stato solo per il responsabile)
const SORT_OPTIONS = [
  { field: "name", direction: "asc", label: "Nome A→Z" },
  { field: "name", direction: "desc", label: "Nome Z→A" },
  { field: "category", direction: "asc", label: "Categoria A→Z" },
  { field: "category", direction: "desc", label: "Categoria Z→A" },
  { field: "price", direction: "asc", label: "Prezzo crescente" },
  { field: "price", direction: "desc", label: "Prezzo decrescente" },
  { field: "vatRate", direction: "asc", label: "IVA crescente" },
  { field: "vatRate", direction: "desc", label: "IVA decrescente" },
  {
    field: "state",
    direction: "asc",
    label: "Prima gli attivi",
    adminOnly: true,
  },
  {
    field: "state",
    direction: "desc",
    label: "Prima i non attivi",
    adminOnly: true,
  },
];

// componente Catalog: il catalogo per i due ruoli (il responsabile vede tutto e gestisce,
// il dipendente solo gli attivi). Ricerca, filtri, ordine e pagine li fa il server
const Catalog = () => {
  // utente collegato e ruolo
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  // su telefono il "+" accanto al titolo e "Filtri" accanto alla ricerca
  const isPhone = useIsPhone();
  // card fino a 1366px per il responsabile, sempre per il dipendente
  const isCardsWidth = useShowCards();
  const showCards = !isAdmin || isCardsWidth;

  // una pagina di prodotti, i totali, le categorie e le pagine
  const [products, setProducts] = useState([]);
  const [totals, setTotals] = useState(null);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  // true fino ai primi dati: gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // giacenze (il dipendente solo del suo negozio)
  const [stocks, setStocks] = useState([]);
  // filtri ("" = nessuno)
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    state: "",
  });
  // ordine scelto
  const [sort, setSort] = useState(DEFAULT_SORT);
  // aumentarlo ricarica i prodotti
  const [refreshCount, setRefreshCount] = useState(0);
  // modale del modulo: prodotto da modificare (null = nuovo)
  const [showForm, setShowForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  // conferma dell'eliminazione
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // prendo una pagina di prodotti al cambio di filtri, ordine, pagina e al refreshCount
  useEffect(() => {
    // ignore: true se parte una richiesta più nuova (la risposta vecchia la scarto)
    let ignore = false;
    const query = toQuery({
      search: filters.search,
      category: filters.category,
      active: filters.state ? String(filters.state === "active") : "",
      sortBy: sort.field,
      order: sort.direction,
      page,
      limit: CATALOG_PAGE_SIZE,
    });
    loadData(
      `/products?${query}`,
      (data) => {
        if (ignore) return;
        setProducts(data.products);
        setTotals(data.totals);
        setCategories(data.categories);
        setTotalPages(data.pagination.totalPages);
        // dopo un'eliminazione l'ultima pagina può sparire: torno all'ultima
        if (
          page > data.pagination.totalPages &&
          data.pagination.totalPages > 0
        ) {
          setPage(data.pagination.totalPages);
        }
      },
      setError,
    ).finally(() => setIsLoading(false));
    // pulizia: React la chiama prima di rifare l'effetto
    return () => {
      ignore = true;
    };
  }, [filters, sort, page, refreshCount]);

  // prendo le giacenze all'apertura e al refreshCount (i pezzi stanno lì, non nei prodotti)
  useEffect(() => {
    loadData("/stocks", (data) => setStocks(data.stocks), setError);
  }, [refreshCount]);

  // cambio un filtro e torno alla pagina 1
  const changeFilter = (name, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    setPage(1);
  };

  // nuovo ordine dal menu "Ordina": pagina 1
  const changeSort = (newSort) => {
    setSort(newSort);
    setPage(1);
  };

  // clic su un'intestazione: nuovo ordine
  const sortByColumn = (field) => changeSort(getNextSort(sort, field));

  // "Nuovo prodotto": modulo vuoto
  const openNewForm = () => {
    setProductToEdit(null);
    setShowForm(true);
  };
  // matita: modulo con il prodotto
  const openEditForm = (product) => {
    setProductToEdit(product);
    setShowForm(true);
  };
  // salvato: chiudo e ricarico (la foto arriva con una seconda richiesta)
  const handleSaved = () => {
    setShowForm(false);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // elimino e ricarico; finally chiude la conferma
  const confirmDelete = async () => {
    setIsDeleting(true);
    setError("");
    try {
      await deleteProduct(productToDelete._id);
      setRefreshCount((prevCount) => prevCount + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  // valori calcolati

  // categorie per il menu (senza doppioni, dal server)
  const categoryOptions = toCategoryOptions(categories);

  // prodotti in tutto e non attivi, per il sottotitolo
  const totalCount = totals?.count ?? 0;
  const inactiveCount = totals?.inactiveCount ?? 0;

  // filtri attivi, per il messaggio
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;
  // filtri attivi nel menu, per il pallino
  const menuFilterCount = filters.category ? 1 : 0;

  // le giacenze di un prodotto
  const stocksOf = (product) =>
    stocks.filter((stock) => stock.product._id === product._id);

  // "1 non attivo", "2 non attivi"
  const inactiveLabel = inactiveCount === 1 ? "non attivo" : "non attivi";
  // sottotitolo: con i non attivi (responsabile) o con il negozio (dipendente)
  const subtitle = isAdmin
    ? `${totalCount} prodotti · ${inactiveCount} ${inactiveLabel}`
    : `${user.store?.name} · ${totalCount} prodotti disponibili`;

  // filtri: ricerca e stato sempre in vista; categoria e "Ordina" nel menu con le card
  const searchFilter = (
    <FilterSearch
      label="Cerca un prodotto"
      value={filters.search}
      onChange={(value) => changeFilter("search", value)} // nuova ricerca: pagina 1
    />
  );
  // categoria a tendina
  const categoryFilter = (
    <FilterSelect
      label="Categoria"
      allLabel="Tutte le categorie"
      options={categoryOptions}
      value={filters.category}
      onChange={(value) => changeFilter("category", value)} // nuova categoria: pagina 1
    />
  );
  // stato solo per il responsabile (per il dipendente vale false: niente)
  const stateFilter = isAdmin && (
    <FilterChips
      label="Stato"
      options={STATE_OPTIONS}
      value={filters.state}
      onChange={(value) => changeFilter("state", value)} // nuovo stato: pagina 1
    />
  );

  // menu "Ordina", solo con le card
  const sortSelect = showCards && (
    <SortSelect
      options={SORT_OPTIONS.filter((option) => isAdmin || !option.adminOnly)}
      sort={sort}
      defaultSort={DEFAULT_SORT}
      onChange={changeSort} // nuovo ordine: pagina 1
    />
  );

  // bottone "Filtri" con categoria e "Ordina"
  const filtersMenu = (
    <FilterBar compact activeCount={menuFilterCount}>
      {categoryFilter}
      {sortSelect}
    </FilterBar>
  );

  // "Nuovo prodotto": su telefono solo il "+"
  const addButton = (
    <AddButton
      label="Nuovo prodotto"
      iconOnly={isPhone}
      onClick={openNewForm}
    />
  );

  return (
    <Container fluid>
      <PageHeader
        title="Catalogo"
        titleAside={isAdmin && isPhone && addButton}
        subtitle={subtitle}
        error={error}
      >
        {/* da tablet il bottone a destra */}
        {isAdmin && !isPhone && addButton}
      </PageHeader>

      {/* ricerca e stato sempre in vista; con le card categoria e "Ordina" nel bottone "Filtri" */}
      <FilterBar>
        {showCards && isPhone ? (
          <div className="filter-row">
            {searchFilter}
            {filtersMenu}
          </div>
        ) : (
          searchFilter
        )}
        {!showCards && categoryFilter}
        {stateFilter}
        {showCards && !isPhone && filtersMenu}
      </FilterBar>

      {/* rotellina, poi il messaggio se nessun prodotto passa i filtri */}
      {isLoading && <Loader />}
      {!isLoading && products.length === 0 && !error && (
        <Message>
          {activeFilterCount > 0
            ? "Nessun prodotto con questi filtri"
            : "Nessun prodotto"}
        </Message>
      )}

      {/* fino a 1366px le card (2 per riga su telefono, 3 da tablet, 4 da xl), sopra la tabella */}
      {products.length > 0 &&
        (showCards ? (
          <Row xs={2} md={3} xl={4} className="g-3 catalog-grid">
            {products.map((product) => (
              <Col key={product._id}>
                <ProductCard
                  product={product} // passo il prodotto alla card
                  stocks={stocksOf(product)} // solo le sue giacenze
                  showStore={isAdmin} // il negozio accanto ai pezzi (responsabile)
                  onEdit={isAdmin ? openEditForm : undefined} // matita solo per il responsabile
                  onDelete={isAdmin ? setProductToDelete : undefined} // cestino solo per il responsabile
                />
              </Col>
            ))}
          </Row>
        ) : (
          <ProductTable
            products={products}
            stocksOf={stocksOf} // funzione che trova le giacenze di un prodotto
            showStore={isAdmin}
            sort={sort}
            onSort={sortByColumn} // clic su un'intestazione
            onEdit={isAdmin ? openEditForm : undefined}
            onDelete={isAdmin ? setProductToDelete : undefined}
          />
        ))}

      {/* le pagine, solo se sono più di una */}
      <Pagination
        page={page}
        totalPages={totalPages}
        label="Pagine del catalogo"
        onChange={setPage}
      />

      {/* modale e conferma solo per il responsabile */}
      {isAdmin && (
        <>
          <FormModal
            show={showForm}
            title={productToEdit ? "Modifica prodotto" : "Nuovo prodotto"}
            onClose={() => setShowForm(false)}
          >
            <ProductForm
              product={productToEdit} // prodotto da modificare (null = nuovo)
              categories={categories} // categorie da suggerire
              onSaved={handleSaved} // chiudo e ricarico
              onCancel={() => setShowForm(false)}
            />
          </FormModal>

          {/* conferma: !! = true/false, ?. perché a conferma chiusa è null */}
          <ConfirmDialog
            show={!!productToDelete}
            title="Eliminare il prodotto?"
            message={`"${productToDelete?.name}" verrà eliminato dal catalogo insieme alle sue giacenze e richieste di fornitura. Non si può annullare.`}
            confirmLabel="Elimina"
            isLoading={isDeleting} // spento mentre aspetto il server
            onConfirm={confirmDelete} // elimino il prodotto
            onCancel={() => setProductToDelete(null)}
          />
        </>
      )}
    </Container>
  );
};

export default Catalog;
