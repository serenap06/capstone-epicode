import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import { useAuth } from "../../hooks/useAuth";
import { useIsPhone } from "../../hooks/useIsPhone";
import { useShowCards } from "../../hooks/useShowCards";
import { loadData } from "../../api/loadData";
import { getMonth, getToday, getWeek } from "../../utils/dates";
import { formatEuro } from "../../utils/formatEuro";
import { getNextSort } from "../../utils/getNextSort";
import { PAGE_SIZE } from "../../utils/pageSize";
import { toQuery } from "../../utils/toQuery";
import { toStoreOptions } from "../../utils/toStoreOptions";

import FilterBar from "../../components/common/filterBar/FilterBar";
import FilterChips from "../../components/common/filterBar/FilterChips";
import FilterSelect from "../../components/common/filterBar/FilterSelect";
import SortSelect from "../../components/common/filterBar/SortSelect";
import FormModal from "../../components/common/formModal/FormModal";
import KpiCard from "../../components/common/kpiCard/KpiCard";
import Loader from "../../components/common/loader/Loader";
import Message from "../../components/common/message/Message";
import PageHeader from "../../components/common/pageHeader/PageHeader";
import Pagination from "../../components/common/pagination/Pagination";
import CancelSaleForm from "../../components/sales/cancelSaleForm/CancelSaleForm";
import SaleCard from "../../components/sales/saleCard/SaleCard";
import SaleTable from "../../components/sales/saleTable/SaleTable";

// periodo del responsabile: il valore dice quale funzione delle date usare
const PERIOD_OPTIONS = [
  { value: "today", label: "Oggi" },
  { value: "week", label: "Settimana" },
  { value: "month", label: "Mese" },
];
const PERIOD_RANGES = { today: getToday, week: getWeek, month: getMonth };

// l'ordine con cui parte la pagina: dalle più recenti
const DEFAULT_SORT = { field: "date", direction: "desc" };

// le voci del menu "Ordina" (vista a card): le stesse scelte delle intestazioni della tabella.
// adminOnly: negozio e venditore servono solo al responsabile
const SORT_OPTIONS = [
  { field: "date", direction: "desc", label: "Più recenti" },
  { field: "date", direction: "asc", label: "Meno recenti" },
  { field: "store", direction: "asc", label: "Negozio A→Z", adminOnly: true },
  { field: "store", direction: "desc", label: "Negozio Z→A", adminOnly: true },
  {
    field: "seller",
    direction: "asc",
    label: "Venditore A→Z",
    adminOnly: true,
  },
  {
    field: "seller",
    direction: "desc",
    label: "Venditore Z→A",
    adminOnly: true,
  },
  { field: "items", direction: "asc", label: "Meno articoli" },
  { field: "items", direction: "desc", label: "Più articoli" },
  { field: "payment", direction: "asc", label: "Prima la carta" },
  { field: "payment", direction: "desc", label: "Prima i contanti" },
  { field: "total", direction: "asc", label: "Totale crescente" },
  { field: "total", direction: "desc", label: "Totale decrescente" },
];

// pagina Vendite per i due ruoli: il responsabile vede tutti i negozi e sceglie il periodo,
// il dipendente vede solo le sue vendite di oggi e può annullarle con un motivo
const Sales = () => {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  // su telefono il bottone "Filtri" sta accanto allo stato, da tablet in fondo alla riga
  const isPhone = useIsPhone();
  // fino a 1366px le card, sopra la tabella, come in tutte le pagine con una tabella.
  // Con le card negozio e "Ordina" vanno nel bottone "Filtri"
  const showCards = useShowCards();

  // una pagina di vendite, i totali (solo vendite non annullate) e quante pagine ci sono
  const [sales, setSales] = useState([]);
  const [totals, setTotals] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  // filtri: si parte da oggi e da tutti i negozi (periodo e negozio solo per il responsabile).
  // status, per tutti e due: "" tutte, "valid" solo valide, "cancelled" solo annullate
  const [filters, setFilters] = useState({
    period: "today",
    store: "",
    status: "",
  });
  // ordine scelto: si parte dalle più recenti. Lo applica il server, come i filtri
  const [sort, setSort] = useState(DEFAULT_SORT);
  // i negozi, per il menu del filtro (solo il responsabile)
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");
  // true finché i dati non arrivano la prima volta: intanto gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // aumentarlo ricarica le vendite (dopo un annullamento)
  const [refreshCount, setRefreshCount] = useState(0);
  // la vendita da annullare (modale aperto), oppure null
  const [saleToCancel, setSaleToCancel] = useState(null);

  // le vendite: i filtri li applica il server (sono divise in pagine da PAGE_SIZE).
  // Il dipendente vede sempre oggi e solo le sue (soldBy); toQuery salta i valori vuoti
  useEffect(() => {
    const query = toQuery({
      ...PERIOD_RANGES[isAdmin ? filters.period : "today"](),
      store: filters.store,
      soldBy: isAdmin ? "" : user._id,
      status: filters.status,
      sortBy: sort.field,
      order: sort.direction,
      page,
      limit: PAGE_SIZE,
    });
    loadData(
      `/sales?${query}`,
      (data) => {
        setSales(data.sales);
        setTotals(data.totals);
        setTotalPages(data.pagination.totalPages);
      },
      setError,
    ).finally(() => setIsLoading(false));
  }, [filters, sort, page, refreshCount, isAdmin, user._id]);

  // i negozi una volta sola, solo per il responsabile
  useEffect(() => {
    if (!isAdmin) return;
    loadData("/stores", (data) => setStores(data.stores), setError);
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

  // clic su un'intestazione della tabella: stessa colonna inverte, colonna nuova crescente
  const sortByColumn = (field) => changeSort(getNextSort(sort, field));

  // vendita annullata: chiudo il modale e ricarico lista, totali e pagine
  const handleCancelled = () => {
    setSaleToCancel(null);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // valori calcolati

  // il nome del negozio scelto, per il sottotitolo del responsabile
  // (?? "": finché i negozi non arrivano, niente "undefined")
  const storeName = filters.store
    ? (stores.find((store) => store._id === filters.store)?.name ?? "")
    : "Tutti i negozi";

  // l'etichetta del periodo scelto ("Oggi", "Settimana", "Mese")
  const periodLabel = PERIOD_OPTIONS.find(
    (option) => option.value === filters.period,
  ).label;
  // responsabile: periodo e negozio; dipendente: le sue vendite di oggi nel suo negozio
  const subtitle = isAdmin
    ? `${periodLabel} · ${storeName}`
    : `Le tue vendite di oggi · ${user.store?.name}`;
  // quanti filtri del menu sono attivi, per il pallino su "Filtri" (nel menu c'è solo il negozio)
  const menuFilterCount = filters.store ? 1 : 0;

  // stato delle vendite: "Annullate" con il numero, così si vede subito se ce ne sono
  const statusOptions = [
    { value: "", label: "Tutte" },
    { value: "valid", label: "Valide" },
    { value: "cancelled", label: `Annullate (${totals?.cancelledCount ?? 0})` },
  ];

  // il messaggio quando la lista è vuota: dipende dal ruolo e dal filtro dello stato
  let emptyMessage = isAdmin
    ? "Nessuna vendita in questo periodo"
    : "Nessuna vendita oggi";
  if (filters.status === "cancelled") {
    emptyMessage = isAdmin
      ? "Nessuna vendita annullata in questo periodo"
      : "Nessuna vendita annullata oggi";
  }

  // props uguali per tabella e card: "Annulla vendita" solo per il dipendente
  const listProps = {
    showStore: isAdmin,
    showSeller: isAdmin,
    onCancel: isAdmin ? undefined : setSaleToCancel,
  };

  // menu "Ordina", solo con le card (la tabella si ordina dalle intestazioni)
  const sortSelect = showCards && (
    <SortSelect
      options={SORT_OPTIONS.filter((option) => isAdmin || !option.adminOnly)}
      sort={sort}
      defaultSort={DEFAULT_SORT}
      onChange={changeSort}
    />
  );

  // periodo a pulsanti: resta sempre in vista, anche su telefono
  const periodFilter = isAdmin && (
    <FilterChips
      label="Periodo"
      options={PERIOD_OPTIONS}
      value={filters.period}
      onChange={(value) => changeFilter("period", value)}
    />
  );
  // stato a pulsanti, per tutti e due i ruoli: sempre in vista, come nelle altre pagine
  const statusFilter = (
    <FilterChips
      label="Stato"
      options={statusOptions}
      value={filters.status}
      onChange={(value) => changeFilter("status", value)}
    />
  );
  // negozio a menu a tendina: con le card va nel bottone "Filtri", con la tabella in riga
  const storeFilter = isAdmin && (
    <FilterSelect
      label="Negozio"
      allLabel="Tutti i negozi"
      options={toStoreOptions(stores)}
      value={filters.store}
      onChange={(value) => changeFilter("store", value)}
    />
  );

  // il bottone "Filtri" con negozio (solo il responsabile) e "Ordina" (con le card, fino a 1366px)
  const filtersMenu = (
    <FilterBar compact activeCount={menuFilterCount}>
      {storeFilter}
      {sortSelect}
    </FilterBar>
  );

  return (
    <Container fluid>
      <PageHeader title="Vendite" subtitle={subtitle} error={error} />

      {/* periodo (responsabile) e stato sempre in vista; con le card negozio e "Ordina" nel
          bottone "Filtri" (su telefono accanto allo stato, da tablet in fondo alla riga),
          con la tabella il negozio in riga */}
      <FilterBar>
        {periodFilter}
        {!showCards && storeFilter}
        {showCards && isPhone ? (
          <div className="filter-row">
            {statusFilter}
            {filtersMenu}
          </div>
        ) : (
          statusFilter
        )}
        {showCards && !isPhone && filtersMenu}
      </FilterBar>

      {/* le card dei totali, uguali per i due ruoli: due per riga, quattro da xl.
          Contano solo le vendite non annullate (lo fa il server); finché non arrivano, 0.
          Netto e IVA stanno nei Report. Colori scelti per la pagina: arancio, blu, magenta, viola */}
      <Row xs={2} xl={4} className="g-3 mb-4">
        <Col>
          <KpiCard
            color="orange"
            label="Incasso"
            value={formatEuro(totals?.revenue ?? 0)}
            detail="IVA compresa"
          />
        </Col>
        <Col>
          <KpiCard
            color="blue"
            label="Vendite"
            value={totals?.count ?? 0}
            detail="scontrini"
          />
        </Col>
        {/* contanti e carta: per far tornare la cassa e i POS a fine giornata */}
        <Col>
          <KpiCard
            color="primary"
            label="Contanti"
            value={formatEuro(totals?.cashRevenue ?? 0)}
            detail="in cassa"
          />
        </Col>
        <Col>
          <KpiCard
            color="secondary"
            label="Carta"
            value={formatEuro(totals?.cardRevenue ?? 0)}
            detail="POS"
          />
        </Col>
      </Row>

      {/* la rotellina mentre arrivano i dati; poi il messaggio se non ci sono vendite */}
      {isLoading && <Loader />}
      {!isLoading && sales.length === 0 && !error && (
        <Message>{emptyMessage}</Message>
      )}

      {/* fino a 1366px le card (una colonna su telefono, due su tablet); sopra la tabella */}
      {sales.length > 0 &&
        (showCards ? (
          // align-items-start: una card con i dettagli aperti non allunga quella accanto
          <Row xs={1} md={2} className="g-3 align-items-start">
            {sales.map((sale) => (
              <Col key={sale._id}>
                <SaleCard sale={sale} {...listProps} />
              </Col>
            ))}
          </Row>
        ) : (
          <SaleTable
            sales={sales}
            sort={sort}
            onSort={sortByColumn}
            {...listProps}
          />
        ))}

      {/* le pagine, solo se sono più di una */}
      <Pagination
        page={page}
        totalPages={totalPages}
        label="Pagine delle vendite"
        onChange={setPage}
      />

      {/* il modale per annullare: solo il dipendente; !! trasforma la vendita in true/false */}
      {!isAdmin && (
        <FormModal
          show={!!saleToCancel}
          title="Annulla vendita"
          onClose={() => setSaleToCancel(null)}
        >
          {/* il modulo c'è solo con una vendita scelta: così si riapre sempre vuoto */}
          {saleToCancel && (
            <CancelSaleForm
              sale={saleToCancel}
              onSaved={handleCancelled}
              onCancel={() => setSaleToCancel(null)}
            />
          )}
        </FormModal>
      )}
    </Container>
  );
};

export default Sales;
