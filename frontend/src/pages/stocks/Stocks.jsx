// import
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useIsPhone } from "../../hooks/useIsPhone";
import { useShowCards } from "../../hooks/useShowCards";
import { loadData } from "../../api/loadData";
import { deleteStock } from "../../api/stocks";
import { getNextSort } from "../../utils/getNextSort";
import { PAGE_SIZE } from "../../utils/pageSize";
import { toQuery } from "../../utils/toQuery";
import { toStoreOptions } from "../../utils/toStoreOptions";

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
import StockCard from "../../components/stocks/stockCard/StockCard";
import StockForm from "../../components/stocks/stockForm/StockForm";
import StockTable from "../../components/stocks/stockTable/StockTable";

// filtro dello stato: tutte o solo sotto soglia
const LEVEL_OPTIONS = [
  { value: "", label: "Tutte" },
  { value: "low", label: "Sotto soglia" },
];

// ordine di partenza: prodotto A→Z
const DEFAULT_SORT = { field: "product", direction: "asc" };

// voci del menu "Ordina" delle card
const SORT_OPTIONS = [
  { field: "product", direction: "asc", label: "Prodotto A→Z" },
  { field: "product", direction: "desc", label: "Prodotto Z→A" },
  { field: "store", direction: "asc", label: "Negozio A→Z" },
  { field: "store", direction: "desc", label: "Negozio Z→A" },
  { field: "amount", direction: "asc", label: "Quantità crescente" },
  { field: "amount", direction: "desc", label: "Quantità decrescente" },
  { field: "minThreshold", direction: "asc", label: "Soglia crescente" },
  { field: "minThreshold", direction: "desc", label: "Soglia decrescente" },
  { field: "status", direction: "asc", label: "Prima gli OK" },
  { field: "status", direction: "desc", label: "Prima i sotto soglia" },
];

// componente Stocks: le giacenze per i due ruoli (il responsabile vede tutti i negozi e modifica,
// il dipendente solo il suo). Ricerca, filtri, ordine e pagine li fa il server
const Stocks = () => {
  // utente collegato e ruolo
  const { user } = useAuth();
  const isAdmin = user.role === "admin";

  // una pagina di giacenze, i totali e le pagine
  const [stocks, setStocks] = useState([]);
  const [totals, setTotals] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  // tutte le giacenze (per il modulo: non riproporre quelle che ci sono), negozi e prodotti
  const [allStocks, setAllStocks] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  // true fino ai primi dati: gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // filtro di partenza dall'indirizzo: dalla Dashboard "?level=low" apre i sotto soglia
  const [searchParams] = useSearchParams();
  // filtri ("" = nessuno)
  const [filters, setFilters] = useState({
    search: "",
    store: "",
    level: searchParams.get("level") === "low" ? "low" : "",
  });
  // ordine scelto
  const [sort, setSort] = useState(DEFAULT_SORT);
  // aumentarlo ricarica le giacenze
  const [refreshCount, setRefreshCount] = useState(0);
  // modale del modulo: riga da modificare (null = nuova)
  const [showForm, setShowForm] = useState(false);
  const [stockToEdit, setStockToEdit] = useState(null);
  // conferma dell'eliminazione
  const [stockToDelete, setStockToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // su telefono il "+" accanto al titolo e i filtri nel menu
  const isPhone = useIsPhone();
  // fino a 1366px le card (negozio e "Ordina" nel bottone "Filtri"), sopra la tabella
  const showCards = useShowCards();

  // prendo una pagina di giacenze al cambio di filtri, ordine, pagina e al refreshCount
  useEffect(() => {
    // ignore: true se parte una richiesta più nuova (la risposta vecchia la scarto)
    let ignore = false;
    const query = toQuery({
      search: filters.search,
      store: filters.store,
      lowStock: filters.level ? "true" : "",
      sortBy: sort.field,
      order: sort.direction,
      page,
      limit: PAGE_SIZE,
    });
    loadData(
      `/stocks?${query}`,
      (data) => {
        if (ignore) return;
        setStocks(data.stocks);
        setTotals(data.totals);
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

  // prendo tutte le giacenze per il modulo (solo il responsabile)
  useEffect(() => {
    if (!isAdmin) return;
    loadData("/stocks", (data) => setAllStocks(data.stocks), setError);
  }, [isAdmin, refreshCount]);

  // prendo negozi e prodotti una volta sola (solo il responsabile)
  useEffect(() => {
    if (!isAdmin) return;
    loadData("/stores", (data) => setStores(data.stores), setError);
    loadData("/products", (data) => setProducts(data.products), setError);
  }, [isAdmin]);

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

  // "Nuova giacenza": modulo vuoto
  const openNewForm = () => {
    setStockToEdit(null);
    setShowForm(true);
  };

  // matita: modulo con la giacenza
  const openEditForm = (stock) => {
    setStockToEdit(stock);
    setShowForm(true);
  };

  // salvata: chiudo e ricarico (il server rimanda la riga senza nomi)
  const handleSaved = () => {
    setShowForm(false);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // elimino e ricarico; finally chiude la conferma
  const confirmDelete = async () => {
    setIsDeleting(true);
    setError("");
    try {
      await deleteStock(stockToDelete._id);
      setRefreshCount((prevCount) => prevCount + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsDeleting(false);
      setStockToDelete(null);
    }
  };

  // clic su un'intestazione: nuovo ordine
  const sortByColumn = (field) => changeSort(getNextSort(sort, field));

  // righe in tutto e sotto soglia, per il sottotitolo
  const totalCount = totals?.count ?? 0;
  const lowCount = totals?.lowCount ?? 0;
  // negozi per FilterSelect
  const storeOptions = toStoreOptions(stores);

  // filtri attivi, per il messaggio
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;

  // sottotitolo: righe (responsabile) o il negozio (dipendente)
  const subtitleStart = isAdmin ? `${totalCount} righe` : user.store?.name;

  // "Nuova giacenza": su telefono solo il "+"
  const addButton = (
    <AddButton
      label="Nuova giacenza"
      iconOnly={isPhone}
      onClick={openNewForm}
    />
  );

  // filtri: ricerca e stato sempre in vista; negozio e "Ordina" nel menu con le card
  const searchFilter = (
    <FilterSearch
      label="Cerca un prodotto"
      value={filters.search}
      onChange={(value) => changeFilter("search", value)} // nuova ricerca: pagina 1
    />
  );

  const storeFilter = isAdmin && (
    <FilterSelect
      label="Negozio"
      allLabel="Tutti i negozi"
      options={storeOptions}
      value={filters.store}
      onChange={(value) => changeFilter("store", value)} // nuovo negozio: pagina 1
    />
  );

  // stato (tutte o sotto soglia)
  const levelFilter = (
    <FilterChips
      label="Stato"
      options={LEVEL_OPTIONS}
      value={filters.level}
      onChange={(value) => changeFilter("level", value)} // nuovo stato: pagina 1
    />
  );

  // menu "Ordina", solo con le card (il dipendente non ha le voci del negozio)
  const sortSelect = showCards && (
    <SortSelect
      options={SORT_OPTIONS.filter(
        (option) => isAdmin || option.field !== "store",
      )}
      sort={sort}
      defaultSort={DEFAULT_SORT}
      onChange={changeSort} // nuovo ordine: pagina 1
    />
  );

  // filtri attivi nel menu, per il pallino
  const menuFilterCount = filters.store ? 1 : 0;

  // bottone "Filtri" con negozio e "Ordina"
  const filtersMenu = (
    <FilterBar compact activeCount={menuFilterCount}>
      {storeFilter}
      {sortSelect}
    </FilterBar>
  );

  // props uguali per tabella e card (i bottoni solo per il responsabile)
  const listProps = {
    showStore: isAdmin,
    onEdit: isAdmin ? openEditForm : undefined,
    onDelete: isAdmin ? setStockToDelete : undefined,
  };

  return (
    <Container fluid>
      <PageHeader
        title="Giacenze"
        titleAside={isAdmin && isPhone && addButton}
        subtitle={`${subtitleStart} · ${lowCount} sotto soglia`}
        error={error}
      >
        {/* da tablet il bottone a destra */}
        {isAdmin && !isPhone && addButton}
      </PageHeader>

      {/* ricerca e stato sempre in vista; con le card negozio e "Ordina" nel bottone "Filtri" */}
      <FilterBar>
        {showCards && isPhone ? (
          <div className="filter-row">
            {searchFilter}
            {filtersMenu}
          </div>
        ) : (
          searchFilter
        )}
        {!showCards && storeFilter}
        {levelFilter}
        {showCards && !isPhone && filtersMenu}
      </FilterBar>

      {/* rotellina, poi il messaggio se nessuna riga passa i filtri */}
      {isLoading && <Loader />}
      {!isLoading && stocks.length === 0 && !error && (
        <Message>
          {activeFilterCount > 0
            ? "Nessuna giacenza con questi filtri"
            : "Nessuna giacenza"}
        </Message>
      )}

      {/* fino a 1366px le card, sopra la tabella */}
      {stocks.length > 0 &&
        (showCards ? (
          <Row xs={1} md={2} className="g-3">
            {stocks.map((stock) => (
              <Col key={stock._id}>
                {/* passo la giacenza e le props comuni */}
                <StockCard stock={stock} {...listProps} />
              </Col>
            ))}
          </Row>
        ) : (
          <StockTable
            stocks={stocks}
            sort={sort}
            onSort={sortByColumn} // clic su un'intestazione
            {...listProps} // negozio e bottoni
          />
        ))}

      {/* le pagine, solo se sono più di una */}
      <Pagination
        page={page}
        totalPages={totalPages}
        label="Pagine delle giacenze"
        onChange={setPage}
      />

      {/* modale e conferma solo per il responsabile */}
      {isAdmin && (
        <>
          <FormModal
            show={showForm}
            title={stockToEdit ? "Modifica giacenza" : "Nuova giacenza"}
            onClose={() => setShowForm(false)}
          >
            <StockForm
              stock={stockToEdit} // giacenza da modificare (null = nuova)
              stores={stores}
              products={products}
              stocks={allStocks} // tutte, per non riproporre quelle che ci sono
              onSaved={handleSaved} // chiudo e ricarico
              onCancel={() => setShowForm(false)}
            />
          </FormModal>

          <ConfirmDialog
            show={!!stockToDelete}
            title="Eliminare la riga?"
            message={`"${stockToDelete?.product.name}" non comparirà più nelle giacenze di ${stockToDelete?.store.name}. Non si può annullare.`}
            confirmLabel="Elimina"
            isLoading={isDeleting} // spento mentre aspetto il server
            onConfirm={confirmDelete} // elimino la giacenza
            onCancel={() => setStockToDelete(null)}
          />
        </>
      )}
    </Container>
  );
};

export default Stocks;
