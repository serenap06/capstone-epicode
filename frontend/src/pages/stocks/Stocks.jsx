import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

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

// filtro dello stato: tutte le righe o solo quelle sotto la soglia
const LEVEL_OPTIONS = [
  { value: "", label: "Tutte" },
  { value: "low", label: "Sotto soglia" },
];

// l'ordine con cui parte la pagina: prodotto dalla A alla Z
const DEFAULT_SORT = { field: "product", direction: "asc" };

// le voci del menu "Ordina" (vista a card): le stesse scelte delle intestazioni della tabella
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

// pagina Giacenze per i due ruoli: il responsabile vede tutti i negozi e modifica,
// il dipendente vede solo il suo negozio (il server gli manda solo quello).
// Ricerca, filtri, ordine e pagine li fa il server: arrivano 10 righe alla volta
const Stocks = () => {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";

  // una pagina di giacenze, i totali per il sottotitolo e quante pagine ci sono
  const [stocks, setStocks] = useState([]);
  const [totals, setTotals] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  // tutte le giacenze, solo per il modulo del responsabile (non propone un prodotto
  // che il negozio ha già); negozi e prodotti per i filtri e il modulo
  const [allStocks, setAllStocks] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  // true finché i dati non arrivano la prima volta: intanto gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // filtri: "" = nessun filtro
  const [filters, setFilters] = useState({ search: "", store: "", level: "" });
  // ordine scelto: si parte dal prodotto, dalla A alla Z
  const [sort, setSort] = useState(DEFAULT_SORT);
  // aumentarlo ricarica le giacenze (dopo un salvataggio)
  const [refreshCount, setRefreshCount] = useState(0);
  // modale del modulo: stockToEdit è la riga da modificare (null = nuova)
  const [showForm, setShowForm] = useState(false);
  const [stockToEdit, setStockToEdit] = useState(null);
  // conferma dell'eliminazione: la riga da eliminare, oppure null
  const [stockToDelete, setStockToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // su telefono "+" accanto al titolo e filtri nel menu "Filtri"
  const isPhone = useIsPhone();
  // fino a 1366px le card (una colonna su telefono, due su tablet), sopra la tabella,
  // come in tutte le pagine con una tabella. Con le card negozio e "Ordina" vanno nel bottone "Filtri"
  const showCards = useShowCards();

  // una pagina di giacenze: a ogni cambio di filtri, ordine o pagina, e dopo un salvataggio.
  // toQuery salta i valori vuoti
  useEffect(() => {
    // ignore: diventa true se parte una richiesta più nuova (la risposta vecchia la scarto)
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
    // pulizia: React la chiama prima di rifare l'effetto
    return () => {
      ignore = true;
    };
  }, [filters, sort, page, refreshCount]);

  // solo per il responsabile: tutte le giacenze per il modulo, anche dopo ogni salvataggio
  useEffect(() => {
    if (!isAdmin) return;
    loadData("/stocks", (data) => setAllStocks(data.stocks), setError);
  }, [isAdmin, refreshCount]);

  // negozi e prodotti una volta sola, solo per il responsabile
  useEffect(() => {
    if (!isAdmin) return;
    loadData("/stores", (data) => setStores(data.stores), setError);
    loadData("/products", (data) => setProducts(data.products), setError);
  }, [isAdmin]);

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

  // "Nuova giacenza": modale con il modulo vuoto
  const openNewForm = () => {
    setStockToEdit(null);
    setShowForm(true);
  };

  // matita sulla riga: modale con i dati di quella giacenza
  const openEditForm = (stock) => {
    setStockToEdit(stock);
    setShowForm(true);
  };

  // dopo il salvataggio chiudo e ricarico (il server rimanda la riga senza nomi)
  const handleSaved = () => {
    setShowForm(false);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // elimino sul server e ricarico la pagina (così si riempie con la riga successiva);
  // finally chiude sempre la conferma
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

  // clic su un'intestazione della tabella: stessa colonna inverte, colonna nuova A→Z
  const sortByColumn = (field) => changeSort(getNextSort(sort, field));

  // quante righe in tutto e quante sotto la soglia, per il sottotitolo (le conta il server;
  // finché non arrivano, 0)
  const totalCount = totals?.count ?? 0;
  const lowCount = totals?.lowCount ?? 0;
  // negozi nel formato { value, label } di FilterSelect
  const storeOptions = toStoreOptions(stores);

  // quanti filtri sono attivi in tutto, per il messaggio "con questi filtri"
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;

  // sottotitolo: il responsabile vede quante righe, il dipendente il suo negozio
  const subtitleStart = isAdmin ? `${totalCount} righe` : user.store?.name;

  // "Nuova giacenza": su telefono solo il "+" accanto al titolo, da tablet in su con il testo
  const addButton = (
    <AddButton
      label="Nuova giacenza"
      iconOnly={isPhone}
      onClick={openNewForm}
    />
  );

  // ricerca e stato sempre in vista; negozio (solo il responsabile) e "Ordina" (solo con
  // le card): con le card nel bottone "Filtri", con la tabella il negozio in riga
  const searchFilter = (
    <FilterSearch
      label="Cerca un prodotto"
      value={filters.search}
      onChange={(value) => changeFilter("search", value)}
    />
  );

  const storeFilter = isAdmin && (
    <FilterSelect
      label="Negozio"
      allLabel="Tutti i negozi"
      options={storeOptions}
      value={filters.store}
      onChange={(value) => changeFilter("store", value)}
    />
  );

  const levelFilter = (
    <FilterChips
      label="Stato"
      options={LEVEL_OPTIONS}
      value={filters.level}
      onChange={(value) => changeFilter("level", value)}
    />
  );

  // menu "Ordina", solo con le card (la tabella si ordina dalle intestazioni).
  // Il dipendente non ha la colonna Negozio, quindi niente voci sul negozio
  const sortSelect = showCards && (
    <SortSelect
      options={SORT_OPTIONS.filter(
        (option) => isAdmin || option.field !== "store",
      )}
      sort={sort}
      defaultSort={DEFAULT_SORT}
      onChange={changeSort}
    />
  );

  // quanti filtri del menu sono attivi, per il pallino su "Filtri" (nel menu c'è solo il negozio)
  const menuFilterCount = filters.store ? 1 : 0;

  // il bottone "Filtri" con negozio e "Ordina" (con le card, fino a 1366px)
  const filtersMenu = (
    <FilterBar compact activeCount={menuFilterCount}>
      {storeFilter}
      {sortSelect}
    </FilterBar>
  );

  // props uguali per tabella e card: i bottoni solo per il responsabile
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
        {/* da tablet in su il bottone va a destra dell'intestazione */}
        {isAdmin && !isPhone && addButton}
      </PageHeader>

      {/* sempre in vista ricerca e stato; con le card negozio e "Ordina" nel bottone "Filtri"
          (su telefono accanto alla ricerca, da tablet dopo lo stato), con la tabella il negozio in riga */}
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

      {/* il messaggio solo quando nessuna riga passa i filtri */}
      {isLoading && <Loader />}
      {!isLoading && stocks.length === 0 && !error && (
        <Message>
          {activeFilterCount > 0
            ? "Nessuna giacenza con questi filtri"
            : "Nessuna giacenza"}
        </Message>
      )}

      {/* fino a 1366px le card; sopra la tabella */}
      {stocks.length > 0 &&
        (showCards ? (
          <Row xs={1} md={2} className="g-3">
            {stocks.map((stock) => (
              <Col key={stock._id}>
                <StockCard stock={stock} {...listProps} />
              </Col>
            ))}
          </Row>
        ) : (
          <StockTable
            stocks={stocks}
            sort={sort}
            onSort={sortByColumn}
            {...listProps}
          />
        ))}

      {/* le pagine, solo se sono più di una */}
      <Pagination
        page={page}
        totalPages={totalPages}
        label="Pagine delle giacenze"
        onChange={setPage}
      />

      {/* modale e conferma servono solo al responsabile */}
      {isAdmin && (
        <>
          <FormModal
            show={showForm}
            title={stockToEdit ? "Modifica giacenza" : "Nuova giacenza"}
            onClose={() => setShowForm(false)}
          >
            <StockForm
              stock={stockToEdit}
              stores={stores}
              products={products}
              stocks={allStocks}
              onSaved={handleSaved}
              onCancel={() => setShowForm(false)}
            />
          </FormModal>

          <ConfirmDialog
            show={!!stockToDelete}
            title="Eliminare la riga?"
            message={`"${stockToDelete?.product.name}" non comparirà più nelle giacenze di ${stockToDelete?.store.name}. Non si può annullare.`}
            confirmLabel="Elimina"
            isLoading={isDeleting}
            onConfirm={confirmDelete}
            onCancel={() => setStockToDelete(null)}
          />
        </>
      )}
    </Container>
  );
};

export default Stocks;
