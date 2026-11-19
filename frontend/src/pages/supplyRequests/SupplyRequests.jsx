import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

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

// filtro dello stato: tutte, in attesa, accolte o respinte
const STATE_OPTIONS = [
  { value: "", label: "Tutte" },
  { value: "open", label: "In attesa" },
  { value: "handled", label: "Accolte" },
  { value: "rejected", label: "Respinte" },
];

// l'ordine con cui parte la pagina: prima quelle in attesa
const DEFAULT_SORT = { field: "state", direction: "asc" };

// le voci del menu "Ordina" (vista a card): le stesse scelte delle intestazioni della tabella.
// adminOnly: il negozio serve solo al responsabile
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

// pagina Forniture per i due ruoli: il dipendente chiede i prodotti per il suo negozio
// e annulla le sue richieste in attesa; il responsabile vede tutti i negozi e le accoglie
// o le respinge con un motivo (non le elimina: il dipendente deve sapere com'è andata).
// Ricerca, filtri, ordine e pagine li fa il server: arrivano 10 richieste alla volta
const SupplyRequests = () => {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";

  // una pagina di richieste, i totali per il sottotitolo e quante pagine ci sono
  const [requests, setRequests] = useState([]);
  const [totals, setTotals] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  // solo per il dipendente: tutte le sue richieste in attesa (il modulo e "Da riordinare"
  // non propongono un prodotto già richiesto), le giacenze e i prodotti;
  // i negozi solo al responsabile (il filtro)
  const [openRequests, setOpenRequests] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");
  // true finché i dati non arrivano la prima volta: intanto gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // filtri: "" = nessun filtro
  const [filters, setFilters] = useState({ search: "", store: "", state: "" });
  // ordine scelto: prima quelle in attesa (e, a parità, le più recenti)
  const [sort, setSort] = useState(DEFAULT_SORT);
  // aumentarlo ricarica le richieste (dopo una richiesta nuova, accolta, respinta o annullata)
  const [refreshCount, setRefreshCount] = useState(0);
  // modale del modulo: formDefaults sono prodotto e quantità già scelti (null = chiuso)
  const [formDefaults, setFormDefaults] = useState(null);
  // la richiesta da respingere (modale del motivo aperto), oppure null
  const [requestToReject, setRequestToReject] = useState(null);
  // conferma dell'annullamento del dipendente: la richiesta da annullare, oppure null
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // su telefono "+" accanto al titolo e "Filtri" accanto alla ricerca (da tablet accanto allo stato)
  const isPhone = useIsPhone();
  // fino a 1366px le card, sopra la tabella (come in tutte le pagine con una tabella).
  // Con le card negozio e "Ordina" vanno nel bottone "Filtri"
  const showCards = useShowCards();

  // una pagina di richieste (il server manda al dipendente solo quelle del suo negozio):
  // a ogni cambio di filtri, ordine o pagina, e dopo ogni modifica. toQuery salta i valori vuoti
  useEffect(() => {
    // ignore: diventa true se parte una richiesta più nuova (la risposta vecchia la scarto)
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
        // dopo un annullamento l'ultima pagina può sparire: torno all'ultima che c'è
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

  // solo per il dipendente: tutte le richieste in attesa del negozio, anche dopo ogni modifica
  useEffect(() => {
    if (isAdmin) return;
    loadData(
      "/supply-requests?state=open",
      (data) => setOpenRequests(data.supplyRequests),
      setError,
    );
  }, [isAdmin, refreshCount]);

  // una volta sola: giacenze e prodotti per il dipendente, negozi per il responsabile
  useEffect(() => {
    if (isAdmin) {
      loadData("/stores", (data) => setStores(data.stores), setError);
      return;
    }
    loadData("/stocks", (data) => setStocks(data.stocks), setError);
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

  // clic su un'intestazione della tabella: stessa colonna inverte, colonna nuova A→Z
  const sortByColumn = (field) => changeSort(getNextSort(sort, field));

  // "Nuova richiesta": modale con il modulo vuoto
  const openNewForm = () =>
    setFormDefaults({ product: "", requestedAmount: 1 });

  // "Richiedi" in "Da riordinare": modale con prodotto e quantità già scelti
  const openReorderForm = (stock) =>
    setFormDefaults({
      product: stock.product._id,
      requestedAmount: getSuggestedAmount(stock),
    });

  // dopo il salvataggio chiudo e ricarico (il server rimanda la richiesta senza nomi)
  const handleSaved = () => {
    setFormDefaults(null);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // il responsabile accoglie: cambio lo stato sul server e ricarico
  // (con il filtro "In attesa" la richiesta deve sparire, e cambiano i totali)
  const acceptRequest = async (requestToAccept) => {
    setError("");
    try {
      await acceptSupplyRequest(requestToAccept._id);
      setRefreshCount((prevCount) => prevCount + 1);
    } catch (e) {
      setError(e.message);
    }
  };

  // respinta: chiudo il modale e ricarico (così arrivano anche chi l'ha respinta e quando)
  const handleRejected = () => {
    setRequestToReject(null);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // il dipendente annulla: elimino sul server e ricarico (la pagina si riempie con la
  // richiesta successiva e il prodotto torna in "Da riordinare"); finally chiude la conferma
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

  // i prodotti già in attesa (per il modulo e "Da riordinare" del dipendente)
  const openProductIds = openRequests.map((request) => request.product._id);

  // "Da riordinare": sotto soglia e senza una richiesta in attesa, dalla A alla Z
  const reorderStocks = sortList(
    stocks.filter(
      (stock) =>
        isLowStock(stock) && !openProductIds.includes(stock.product._id),
    ),
    (stock) => stock.product.name,
    "asc",
  );

  // quanti filtri sono attivi in tutto, per il messaggio "con questi filtri"
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;
  // quanti filtri del menu sono attivi, per il pallino su "Filtri" (nel menu c'è solo il negozio)
  const menuFilterCount = filters.store ? 1 : 0;

  // quante richieste in tutto e quante in attesa, per il sottotitolo (le conta il server;
  // finché non arrivano, 0)
  const totalCount = totals?.count ?? 0;
  const openCount = totals?.openCount ?? 0;

  // sottotitolo: il responsabile vede quante richieste, il dipendente il suo negozio
  const subtitleStart = isAdmin ? `${totalCount} richieste` : user.store?.name;

  // il cestino: solo il dipendente, sulle sue richieste ancora in attesa
  // (le stesse regole del server); il responsabile accoglie o respinge
  const canDelete = (request) =>
    !isAdmin &&
    request.requestedBy?._id === user._id &&
    request.state === "open";

  // props uguali per tabella e card: "Accogli" e "Respingi" solo per il responsabile
  const listProps = {
    showStore: isAdmin,
    onAccept: isAdmin ? acceptRequest : undefined,
    onReject: isAdmin ? setRequestToReject : undefined,
    canDelete,
    onDelete: setRequestToDelete,
  };

  // "Nuova richiesta" (solo il dipendente): su telefono solo il "+" accanto al titolo
  const addButton = (
    <AddButton
      label="Nuova richiesta"
      iconOnly={isPhone}
      onClick={openNewForm}
    />
  );

  // negozio (solo il responsabile) e "Ordina" (solo con le card): con le card nel bottone
  // "Filtri", con la tabella il negozio in riga con la ricerca. Lo stato resta sempre in vista
  const storeFilter = isAdmin && (
    <FilterSelect
      label="Negozio"
      allLabel="Tutti i negozi"
      options={toStoreOptions(stores)}
      value={filters.store}
      onChange={(value) => changeFilter("store", value)}
    />
  );
  const stateFilter = (
    <FilterChips
      label="Stato"
      options={STATE_OPTIONS}
      value={filters.state}
      onChange={(value) => changeFilter("state", value)}
    />
  );
  const sortSelect = showCards && (
    <SortSelect
      options={SORT_OPTIONS.filter((option) => isAdmin || !option.adminOnly)}
      sort={sort}
      defaultSort={DEFAULT_SORT}
      onChange={changeSort}
    />
  );

  const searchFilter = (
    <FilterSearch
      label="Cerca un prodotto"
      value={filters.search}
      onChange={(value) => changeFilter("search", value)}
    />
  );

  // il bottone "Filtri" con negozio e "Ordina" (con le card, fino a 1366px)
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
        {/* da tablet in su il bottone va a destra dell'intestazione */}
        {!isAdmin && !isPhone && addButton}
      </PageHeader>

      {/* dipendente: i prodotti da riordinare in cima, solo se ce ne sono */}
      {!isAdmin && reorderStocks.length > 0 && (
        <ReorderList stocks={reorderStocks} onRequest={openReorderForm} />
      )}

      {/* sempre in vista ricerca e stato; con le card negozio e "Ordina" nel bottone "Filtri",
          con la tabella il negozio in riga */}
      <FilterBar>
        {/* su telefono ricerca e "Filtri" sulla stessa riga, lo stato sotto */}
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
        {/* da tablet (768px) a 1366px "Filtri" subito dopo lo stato */}
        {showCards && !isPhone && filtersMenu}
      </FilterBar>

      {/* la rotellina mentre arrivano i dati; poi il messaggio se non c'è niente da mostrare */}
      {isLoading && <Loader />}
      {!isLoading && requests.length === 0 && !error && (
        <Message>
          {activeFilterCount > 0
            ? "Nessuna richiesta con questi filtri"
            : "Nessuna richiesta di fornitura"}
        </Message>
      )}

      {/* fino a 1366px le card; sopra la tabella */}
      {requests.length > 0 &&
        (showCards ? (
          // align-items-start: una card con il motivo aperto non allunga quella accanto
          <Row xs={1} md={2} className="g-3 align-items-start">
            {requests.map((request) => (
              <Col key={request._id}>
                <SupplyRequestCard request={request} {...listProps} />
              </Col>
            ))}
          </Row>
        ) : (
          <SupplyRequestTable
            requests={requests}
            sort={sort}
            onSort={sortByColumn}
            {...listProps}
          />
        ))}

      {/* le pagine, solo se sono più di una */}
      <Pagination
        page={page}
        totalPages={totalPages}
        label="Pagine delle richieste"
        onChange={setPage}
      />

      {/* il modulo serve solo al dipendente; !! trasforma formDefaults in true/false */}
      {!isAdmin && (
        <FormModal
          show={!!formDefaults}
          title="Nuova richiesta"
          onClose={() => setFormDefaults(null)}
        >
          {/* il modulo c'è solo con il modale aperto: così riparte sempre dai valori scelti */}
          {formDefaults && (
            <SupplyRequestForm
              products={products}
              stocks={stocks}
              openProductIds={openProductIds}
              defaultValues={formDefaults}
              onSaved={handleSaved}
              onCancel={() => setFormDefaults(null)}
            />
          )}
        </FormModal>
      )}

      {/* il modale per respingere: solo il responsabile, con il motivo obbligatorio */}
      {isAdmin && (
        <FormModal
          show={!!requestToReject}
          title="Respingi richiesta"
          onClose={() => setRequestToReject(null)}
        >
          {/* il modulo c'è solo con una richiesta scelta: così si riapre sempre vuoto */}
          {requestToReject && (
            <RejectSupplyForm
              request={requestToReject}
              onSaved={handleRejected}
              onCancel={() => setRequestToReject(null)}
            />
          )}
        </FormModal>
      )}

      {/* conferma: il dipendente annulla una sua richiesta in attesa */}
      <ConfirmDialog
        show={!!requestToDelete}
        title="Annullare la richiesta?"
        message={`La richiesta di ${requestToDelete?.requestedAmount} pz di "${requestToDelete?.product.name}" sparirà dall'elenco. Non si può annullare.`}
        confirmLabel="Annulla richiesta"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setRequestToDelete(null)}
      />
    </Container>
  );
};

export default SupplyRequests;
