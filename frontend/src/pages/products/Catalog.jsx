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

// filtro dello stato, solo per il responsabile ("" = tutti)
const STATE_OPTIONS = [
  { value: "", label: "Tutti" },
  { value: "active", label: "Attivi" },
  { value: "inactive", label: "Non attivi" },
];

// prodotti per pagina: 12 e non 10 come negli altri elenchi, perché le card stanno
// 2, 3 o 4 per riga e 12 si divide per tutti e tre: l'ultima riga è sempre piena
const CATALOG_PAGE_SIZE = 12;

// l'ordine con cui parte la pagina: nome dalla A alla Z
const DEFAULT_SORT = { field: "name", direction: "asc" };

// le voci del menu "Ordina" (vista a card): le stesse scelte delle intestazioni della tabella.
// adminOnly: lo stato serve solo al responsabile (il dipendente vede solo gli attivi)
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

// pagina Catalogo per i due ruoli: il responsabile vede tutti i prodotti e li gestisce,
// il dipendente vede solo quelli attivi (il server gli manda solo quelli).
// Ricerca, filtri, ordine e pagine li fa il server: arrivano 12 prodotti alla volta
const Catalog = () => {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  // su telefono il "+" accanto al titolo e "Filtri" accanto alla ricerca
  const isPhone = useIsPhone();
  // il responsabile: fino a 1366px le card, sopra la tabella (come nelle altre pagine);
  // il dipendente vede sempre le card, con le foto. Con le card categoria e "Ordina"
  // vanno nel bottone "Filtri"
  const isCardsWidth = useShowCards();
  const showCards = !isAdmin || isCardsWidth;

  // una pagina di prodotti, i totali per il sottotitolo, le categorie e quante pagine ci sono
  const [products, setProducts] = useState([]);
  const [totals, setTotals] = useState(null);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  // true finché i dati non arrivano la prima volta: intanto gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // le giacenze: al responsabile di tutti i negozi, al dipendente solo del suo
  const [stocks, setStocks] = useState([]);
  // filtri: "" = nessun filtro
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    state: "",
  });
  // ordine scelto: si parte dal nome, dalla A alla Z
  const [sort, setSort] = useState(DEFAULT_SORT);
  // aumentarlo ricarica i prodotti (dopo un salvataggio)
  const [refreshCount, setRefreshCount] = useState(0);
  // modale del modulo: productToEdit è il prodotto da modificare (null = nuovo)
  const [showForm, setShowForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  // conferma dell'eliminazione: il prodotto da eliminare, oppure null
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // una pagina di prodotti: a ogni cambio di filtri o pagina, e dopo ogni salvataggio.
  // Lo stato diventa active=true/false (solo il responsabile); toQuery salta i valori vuoti
  useEffect(() => {
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
        setProducts(data.products);
        setTotals(data.totals);
        setCategories(data.categories);
        setTotalPages(data.pagination.totalPages);
        // dopo un'eliminazione l'ultima pagina può sparire: torno all'ultima che c'è
        if (
          page > data.pagination.totalPages &&
          data.pagination.totalPages > 0
        ) {
          setPage(data.pagination.totalPages);
        }
      },
      setError,
    ).finally(() => setIsLoading(false));
  }, [filters, sort, page, refreshCount]);

  // le giacenze, e di nuovo dopo ogni salvataggio: i pezzi stanno nelle giacenze,
  // non nei prodotti, e servono per le righe sulla card
  useEffect(() => {
    loadData("/stocks", (data) => setStocks(data.stocks), setError);
  }, [refreshCount]);

  // cambia un filtro: copio gli altri e sovrascrivo quello ([name] usa il valore come chiave).
  // Con un filtro nuovo si riparte dalla prima pagina
  const changeFilter = (name, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    setPage(1);
  };

  // nuovo ordine (dal menu "Ordina" delle card): anche qui si riparte dalla prima pagina
  const changeSort = (newSort) => {
    setSort(newSort);
    setPage(1);
  };

  // clic su un'intestazione della tabella: stessa colonna inverte, colonna nuova A→Z
  const sortByColumn = (field) => changeSort(getNextSort(sort, field));

  // "Nuovo prodotto": modale con il modulo vuoto
  const openNewForm = () => {
    setProductToEdit(null);
    setShowForm(true);
  };
  // matita sulla card: modale con i dati di quel prodotto
  const openEditForm = (product) => {
    setProductToEdit(product);
    setShowForm(true);
  };
  // dopo il salvataggio chiudo e ricarico: la foto arriva con una seconda richiesta,
  // così la lista torna dal server già completa
  const handleSaved = () => {
    setShowForm(false);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // elimino sul server e ricarico (la pagina si riempie con il prodotto successivo);
  // finally chiude sempre la conferma
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

  // le categorie per il menu a tendina ("Tutte le categorie" la aggiunge FilterSelect);
  // le categorie senza doppioni le manda il server, servono anche al modulo
  const categoryOptions = toCategoryOptions(categories);

  // quanti prodotti in tutto e quanti non attivi, per il sottotitolo (li conta il server;
  // finché non arrivano, 0)
  const totalCount = totals?.count ?? 0;
  const inactiveCount = totals?.inactiveCount ?? 0;

  // quanti filtri sono attivi in tutto, per il messaggio "con questi filtri"
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;
  // quanti filtri del menu sono attivi, per il pallino su "Filtri" (nel menu c'è la categoria)
  const menuFilterCount = filters.category ? 1 : 0;

  // le giacenze di un prodotto (una per negozio; il dipendente riceve solo la sua)
  const stocksOf = (product) =>
    stocks.filter((stock) => stock.product._id === product._id);

  // "1 non attivo", "2 non attivi"
  const inactiveLabel = inactiveCount === 1 ? "non attivo" : "non attivi";
  // il responsabile vede anche i non attivi; il dipendente il suo negozio e quanti prodotti ha
  const subtitle = isAdmin
    ? `${totalCount} prodotti · ${inactiveCount} ${inactiveLabel}`
    : `${user.store?.name} · ${totalCount} prodotti disponibili`;

  // ricerca e stato (solo il responsabile) sempre in vista; categoria e "Ordina" (solo con le
  // card): con le card nel bottone "Filtri", con la tabella la categoria in riga
  const searchFilter = (
    <FilterSearch
      label="Cerca un prodotto"
      value={filters.search}
      onChange={(value) => changeFilter("search", value)}
    />
  );
  // la categoria come menu a tendina
  const categoryFilter = (
    <FilterSelect
      label="Categoria"
      allLabel="Tutte le categorie"
      options={categoryOptions}
      value={filters.category}
      onChange={(value) => changeFilter("category", value)}
    />
  );
  // lo stato solo per il responsabile: per il dipendente vale false e non disegna niente
  const stateFilter = isAdmin && (
    <FilterChips
      label="Stato"
      options={STATE_OPTIONS}
      value={filters.state}
      onChange={(value) => changeFilter("state", value)}
    />
  );

  // menu "Ordina", solo con le card (la tabella si ordina dalle intestazioni)
  const sortSelect = showCards && (
    <SortSelect
      options={SORT_OPTIONS.filter((option) => isAdmin || !option.adminOnly)}
      sort={sort}
      defaultSort={DEFAULT_SORT}
      onChange={changeSort}
    />
  );

  // il bottone "Filtri" con categoria e "Ordina" (con le card, fino a 1366px)
  const filtersMenu = (
    <FilterBar compact activeCount={menuFilterCount}>
      {categoryFilter}
      {sortSelect}
    </FilterBar>
  );

  // "Nuovo prodotto": su telefono solo il "+" accanto al titolo, da tablet in su con il testo
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
        {/* da tablet in su il bottone va a destra dell'intestazione */}
        {isAdmin && !isPhone && addButton}
      </PageHeader>

      {/* sempre in vista ricerca e stato; con le card categoria e "Ordina" nel bottone "Filtri"
          (su telefono accanto alla ricerca, da tablet dopo lo stato), con la tabella la categoria in riga */}
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

      {/* il messaggio solo quando nessun prodotto passa i filtri */}
      {isLoading && <Loader />}
      {!isLoading && products.length === 0 && !error && (
        <Message>
          {activeFilterCount > 0
            ? "Nessun prodotto con questi filtri"
            : "Nessun prodotto"}
        </Message>
      )}

      {/* fino a 1366px le card: due per riga su telefono (una sotto i 375px), tre da tablet,
          quattro da xl; sopra la tabella. A ogni prodotto passo solo le sue giacenze;
          il responsabile vede anche il negozio. Matita e cestino solo per il responsabile */}
      {products.length > 0 &&
        (showCards ? (
          <Row xs={2} md={3} xl={4} className="g-3 catalog-grid">
            {products.map((product) => (
              <Col key={product._id}>
                <ProductCard
                  product={product}
                  stocks={stocksOf(product)}
                  showStore={isAdmin}
                  onEdit={isAdmin ? openEditForm : undefined}
                  onDelete={isAdmin ? setProductToDelete : undefined}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <ProductTable
            products={products}
            stocksOf={stocksOf}
            showStore={isAdmin}
            sort={sort}
            onSort={sortByColumn}
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

      {/* modale e conferma servono solo al responsabile */}
      {isAdmin && (
        <>
          <FormModal
            show={showForm}
            title={productToEdit ? "Modifica prodotto" : "Nuovo prodotto"}
            onClose={() => setShowForm(false)}
          >
            <ProductForm
              product={productToEdit}
              categories={categories}
              onSaved={handleSaved}
              onCancel={() => setShowForm(false)}
            />
          </FormModal>

          {/* !! trasforma productToDelete in true/false; ?. perché a conferma chiusa è null */}
          <ConfirmDialog
            show={!!productToDelete}
            title="Eliminare il prodotto?"
            message={`"${productToDelete?.name}" verrà eliminato dal catalogo insieme alle sue giacenze e richieste di fornitura. Non si può annullare.`}
            confirmLabel="Elimina"
            isLoading={isDeleting}
            onConfirm={confirmDelete}
            onCancel={() => setProductToDelete(null)}
          />
        </>
      )}
    </Container>
  );
};

export default Catalog;
