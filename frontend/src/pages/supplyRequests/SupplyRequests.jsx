// import
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useIsPhone } from "../../hooks/useIsPhone";
import { useShowCards } from "../../hooks/useShowCards";
import { loadData } from "../../api/loadData";
import {
  acceptSupplyRequest,
  deleteSupplyRequest,
} from "../../api/supplyRequests";
import { getNextSort } from "../../utils/getNextSort";
import { getSuggestedAmount } from "../../utils/getSuggestedAmount";
import { isLowStock } from "../../utils/isLowStock";
import { PAGE_SIZE } from "../../utils/pageSize";
import { sortList } from "../../utils/sortList";
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
import RejectSupplyForm from "../../components/supplyRequests/rejectSupplyForm/RejectSupplyForm";
import ReorderList from "../../components/supplyRequests/reorderList/ReorderList";
import SupplyRequestCard from "../../components/supplyRequests/supplyRequestCard/SupplyRequestCard";
import SupplyRequestForm from "../../components/supplyRequests/supplyRequestForm/SupplyRequestForm";
import SupplyRequestTable from "../../components/supplyRequests/supplyRequestTable/SupplyRequestTable";

// filtro dello stato
const STATE_OPTIONS = [
  { value: "", label: "Tutte" },
  { value: "open", label: "In attesa" },
  { value: "handled", label: "Accolte" },
  { value: "rejected", label: "Respinte" },
];

// ordine di partenza: prima quelle in attesa
const DEFAULT_SORT = { field: "state", direction: "asc" };

// voci del menu "Ordina" delle card (il negozio solo per il responsabile)
const SORT_OPTIONS = [
  { field: "state", direction: "asc", label: "Prima in attesa" },
  { field: "state", direction: "desc", label: "Prima le respinte" },
  { field: "date", direction: "desc", label: "Più recenti" },
  { field: "date", direction: "asc", label: "Meno recenti" },
  { field: "product", direction: "asc", label: "Prodotto A→Z" },
  { field: "product", direction: "desc", label: "Prodotto Z→A" },
  { field: "store", direction: "asc", label: "Negozio A→Z", adminOnly: true },
  { field: "store", direction: "desc", label: "Negozio Z→A", adminOnly: true },
  { field: "amount", direction: "asc", label: "Quantità crescente" },
  { field: "amount", direction: "desc", label: "Quantità decrescente" },
  { field: "requestedBy", direction: "asc", label: "Richiesta da A→Z" },
  { field: "requestedBy", direction: "desc", label: "Richiesta da Z→A" },
];

// componente SupplyRequests: le forniture per i due ruoli. Il dipendente chiede e annulla le sue
// in attesa; il responsabile le accoglie o le respinge con un motivo (non le elimina).
// Ricerca, filtri, ordine e pagine li fa il server
const SupplyRequests = () => {
  // utente collegato e ruolo
  const { user } = useAuth();
  const isAdmin = user.role === "admin";

  // una pagina di richieste, i totali e le pagine
  const [requests, setRequests] = useState([]);
  const [totals, setTotals] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  // dipendente: le richieste in attesa (per non riproporle), giacenze e prodotti; responsabile: i negozi
  const [openRequests, setOpenRequests] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");
  // true fino ai primi dati: gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // filtro di partenza dall'indirizzo: dalla Dashboard "?state=open" apre quelle in attesa
  const [searchParams] = useSearchParams();
  const stateParam = searchParams.get("state");
  // filtri ("" = nessuno; lo stato solo se è uno di quelli del menu)
  const [filters, setFilters] = useState({
    search: "",
    store: "",
    state: STATE_OPTIONS.some((option) => option.value === stateParam)
      ? stateParam
      : "",
  });
  // ordine scelto
  const [sort, setSort] = useState(DEFAULT_SORT);
  // aumentarlo ricarica le richieste
  const [refreshCount, setRefreshCount] = useState(0);
  // modale del modulo: prodotto e quantità già scelti (null = chiuso)
  const [formDefaults, setFormDefaults] = useState(null);
  // richiesta da respingere (modale del motivo aperto)
  const [requestToReject, setRequestToReject] = useState(null);
  // conferma dell'annullamento
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // su telefono il "+" accanto al titolo e "Filtri" accanto alla ricerca
  const isPhone = useIsPhone();
  // fino a 1366px le card (negozio e "Ordina" nel bottone "Filtri"), sopra la tabella
  const showCards = useShowCards();

  // prendo una pagina di richieste al cambio di filtri, ordine, pagina e al refreshCount
  useEffect(() => {
    // ignore: true se parte una richiesta più nuova (la risposta vecchia la scarto)
    let ignore = false;
    const query = toQuery({
      search: filters.search,
      store: filters.store,
      state: filters.state,
      sortBy: sort.field,
      order: sort.direction,
      page,
      limit: PAGE_SIZE,
    });
    loadData(
      `/supply-requests?${query}`,
      (data) => {
        if (ignore) return;
        setRequests(data.supplyRequests);
        setTotals(data.totals);
        setTotalPages(data.pagination.totalPages);
        // dopo un annullamento l'ultima pagina può sparire: torno all'ultima
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

  // prendo le richieste in attesa del negozio (solo il dipendente), anche al refreshCount
  useEffect(() => {
    if (isAdmin) return;
    loadData(
      "/supply-requests?state=open",
      (data) => setOpenRequests(data.supplyRequests),
      setError,
    );
  }, [isAdmin, refreshCount]);

  // prendo una volta sola giacenze e prodotti (dipendente) o i negozi (responsabile)
  useEffect(() => {
    if (isAdmin) {
      loadData("/stores", (data) => setStores(data.stores), setError);
      return;
    }
    loadData("/stocks", (data) => setStocks(data.stocks), setError);
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

  // clic su un'intestazione: nuovo ordine
  const sortByColumn = (field) => changeSort(getNextSort(sort, field));

  // "Nuova richiesta": modulo vuoto
  const openNewForm = () =>
    setFormDefaults({ product: "", requestedAmount: 1 });

  // "Richiedi" in "Da riordinare": modulo già compilato
  const openReorderForm = (stock) =>
    setFormDefaults({
      product: stock.product._id,
      requestedAmount: getSuggestedAmount(stock),
    });

  // inviata: chiudo e ricarico (il server rimanda la richiesta senza nomi)
  const handleSaved = () => {
    setFormDefaults(null);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // il responsabile accoglie: cambio lo stato e ricarico
  const acceptRequest = async (requestToAccept) => {
    setError("");
    try {
      await acceptSupplyRequest(requestToAccept._id);
      setRefreshCount((prevCount) => prevCount + 1);
    } catch (e) {
      setError(e.message);
    }
  };

  // respinta: chiudo il modale e ricarico
  const handleRejected = () => {
    setRequestToReject(null);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // il dipendente annulla: elimino e ricarico; finally chiude la conferma
  const confirmDelete = async () => {
    setIsDeleting(true);
    setError("");
    try {
      await deleteSupplyRequest(requestToDelete._id);
      setRefreshCount((prevCount) => prevCount + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsDeleting(false);
      setRequestToDelete(null);
    }
  };

  // valori calcolati

  // prodotti già in attesa
  const openProductIds = openRequests.map((request) => request.product._id);

  // "Da riordinare": sotto soglia e senza richiesta in attesa, A→Z
  const reorderStocks = sortList(
    stocks.filter(
      (stock) =>
        isLowStock(stock) && !openProductIds.includes(stock.product._id),
    ),
    (stock) => stock.product.name,
    "asc",
  );

  // filtri attivi, per il messaggio
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;
  // filtri attivi nel menu, per il pallino
  const menuFilterCount = filters.store ? 1 : 0;

  // richieste in tutto e in attesa, per il sottotitolo
  const totalCount = totals?.count ?? 0;
  const openCount = totals?.openCount ?? 0;

  // sottotitolo: richieste (responsabile) o il negozio (dipendente)
  const subtitleStart = isAdmin ? `${totalCount} richieste` : user.store?.name;

  // cestino: solo il dipendente, sulle sue richieste in attesa (come nel server)
  const canDelete = (request) =>
    !isAdmin &&
    request.requestedBy?._id === user._id &&
    request.state === "open";

  // props uguali per tabella e card ("Accogli" e "Respingi" solo il responsabile)
  const listProps = {
    showStore: isAdmin,
    onAccept: isAdmin ? acceptRequest : undefined,
    onReject: isAdmin ? setRequestToReject : undefined,
    canDelete,
    onDelete: setRequestToDelete,
  };

  // "Nuova richiesta" (solo il dipendente): su telefono solo il "+"
  const addButton = (
    <AddButton
      label="Nuova richiesta"
      iconOnly={isPhone}
      onClick={openNewForm}
    />
  );

  // filtri: negozio e "Ordina" nel menu con le card; stato e ricerca sempre in vista
  const storeFilter = isAdmin && (
    <FilterSelect
      label="Negozio"
      allLabel="Tutti i negozi"
      options={toStoreOptions(stores)}
      value={filters.store}
      onChange={(value) => changeFilter("store", value)} // nuovo negozio: pagina 1
    />
  );
  // stato
  const stateFilter = (
    <FilterChips
      label="Stato"
      options={STATE_OPTIONS}
      value={filters.state}
      onChange={(value) => changeFilter("state", value)} // nuovo stato: pagina 1
    />
  );
  const sortSelect = showCards && (
    <SortSelect
      options={SORT_OPTIONS.filter((option) => isAdmin || !option.adminOnly)}
      sort={sort}
      defaultSort={DEFAULT_SORT}
      onChange={changeSort} // nuovo ordine: pagina 1
    />
  );

  // ricerca nel nome del prodotto
  const searchFilter = (
    <FilterSearch
      label="Cerca un prodotto"
      value={filters.search}
      onChange={(value) => changeFilter("search", value)} // nuova ricerca: pagina 1
    />
  );

  // bottone "Filtri" con negozio e "Ordina"
  const filtersMenu = (
    <FilterBar compact activeCount={menuFilterCount}>
      {storeFilter}
      {sortSelect}
    </FilterBar>
  );

  return (
    <Container fluid>
      <PageHeader
        title="Forniture"
        titleAside={!isAdmin && isPhone && addButton}
        subtitle={`${subtitleStart} · ${openCount} in attesa`}
        error={error}
      >
        {/* da tablet il bottone a destra */}
        {!isAdmin && !isPhone && addButton}
      </PageHeader>

      {/* dipendente: i prodotti da riordinare in cima, se ci sono */}
      {!isAdmin && reorderStocks.length > 0 && (
        <ReorderList stocks={reorderStocks} onRequest={openReorderForm} />
      )}

      {/* ricerca e stato sempre in vista; con le card negozio e "Ordina" nel bottone "Filtri" */}
      <FilterBar>
        {/* su telefono ricerca e "Filtri" sulla stessa riga */}
        {showCards && isPhone ? (
          <div className="filter-row">
            {searchFilter}
            {filtersMenu}
          </div>
        ) : (
          searchFilter
        )}
        {!showCards && storeFilter}
        {stateFilter}
        {/* da tablet a 1366px "Filtri" dopo lo stato */}
        {showCards && !isPhone && filtersMenu}
      </FilterBar>

      {/* rotellina, poi il messaggio se non c'è niente */}
      {isLoading && <Loader />}
      {!isLoading && requests.length === 0 && !error && (
        <Message>
          {activeFilterCount > 0
            ? "Nessuna richiesta con questi filtri"
            : "Nessuna richiesta di fornitura"}
        </Message>
      )}

      {/* fino a 1366px le card, sopra la tabella */}
      {requests.length > 0 &&
        (showCards ? (
          // align-items-start: una card aperta non allunga quella accanto
          <Row xs={1} md={2} className="g-3 align-items-start">
            {requests.map((request) => (
              <Col key={request._id}>
                {/* passo la richiesta e le props comuni */}
                <SupplyRequestCard request={request} {...listProps} />
              </Col>
            ))}
          </Row>
        ) : (
          <SupplyRequestTable
            requests={requests}
            sort={sort}
            onSort={sortByColumn} // clic su un'intestazione
            {...listProps} // negozio, bottoni e cestino
          />
        ))}

      {/* le pagine, solo se sono più di una */}
      <Pagination
        page={page}
        totalPages={totalPages}
        label="Pagine delle richieste"
        onChange={setPage}
      />

      {/* modale della richiesta, solo il dipendente (!! = true/false) */}
      {!isAdmin && (
        <FormModal
          show={!!formDefaults}
          title="Nuova richiesta"
          onClose={() => setFormDefaults(null)}
        >
          {/* il modulo c'è solo a modale aperto: riparte dai valori scelti */}
          {formDefaults && (
            <SupplyRequestForm
              products={products} // i prodotti attivi
              stocks={stocks} // le giacenze del negozio
              openProductIds={openProductIds} // già in attesa: spenti nel menu
              defaultValues={formDefaults} // prodotto e quantità già scelti
              onSaved={handleSaved} // chiudo e ricarico
              onCancel={() => setFormDefaults(null)}
            />
          )}
        </FormModal>
      )}

      {/* modale per respingere, solo il responsabile */}
      {isAdmin && (
        <FormModal
          show={!!requestToReject}
          title="Respingi richiesta"
          onClose={() => setRequestToReject(null)}
        >
          {/* il modulo c'è solo con una richiesta scelta: si riapre vuoto */}
          {requestToReject && (
            <RejectSupplyForm
              request={requestToReject} // la richiesta da respingere
              onSaved={handleRejected} // chiudo e ricarico
              onCancel={() => setRequestToReject(null)}
            />
          )}
        </FormModal>
      )}

      {/* conferma dell'annullamento (dipendente) */}
      <ConfirmDialog
        show={!!requestToDelete}
        title="Annullare la richiesta?"
        message={`La richiesta di ${requestToDelete?.requestedAmount} pz di "${requestToDelete?.product.name}" sparirà dall'elenco. Non si può annullare.`}
        confirmLabel="Annulla richiesta"
        isLoading={isDeleting} // spento mentre aspetto il server
        onConfirm={confirmDelete} // annullo la richiesta
        onCancel={() => setRequestToDelete(null)}
      />
    </Container>
  );
};

export default SupplyRequests;
