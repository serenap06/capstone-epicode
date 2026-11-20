// import
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import { useAuth } from "../../hooks/useAuth";
import { useIsPhone } from "../../hooks/useIsPhone";
import { useShowCards } from "../../hooks/useShowCards";
import { loadData } from "../../api/loadData";
import { formatEuro } from "../../utils/formatEuro";
import { formatSalesCount } from "../../utils/formatSalesCount";
import { isSameDay } from "../../utils/dates";
import { getNextSort } from "../../utils/getNextSort";
import { PAGE_SIZE } from "../../utils/pageSize";
import {
  formatPeriod,
  getPeriodRange,
  movePeriodDate,
  PERIOD_NAV_LABELS,
  PERIOD_OPTIONS,
} from "../../utils/periods";
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
import SectionHeader from "../../components/common/sectionHeader/SectionHeader";
import WeekNav from "../../components/common/weekNav/WeekNav";
import Pagination from "../../components/common/pagination/Pagination";
import CashKpiCard from "../../components/cashSessions/cashKpiCard/CashKpiCard";
import CashClosingList from "../../components/cashSessions/cashClosingList/CashClosingList";
import CancelSaleForm from "../../components/sales/cancelSaleForm/CancelSaleForm";
import SaleCard from "../../components/sales/saleCard/SaleCard";
import SaleTable from "../../components/sales/saleTable/SaleTable";

// ordine di partenza: le più recenti
const DEFAULT_SORT = { field: "date", direction: "desc" };

// voci del menu "Ordina" delle card (adminOnly: il negozio solo per il responsabile)
const SORT_OPTIONS = [
  { field: "date", direction: "desc", label: "Più recenti" },
  { field: "date", direction: "asc", label: "Meno recenti" },
  { field: "store", direction: "asc", label: "Negozio A→Z", adminOnly: true },
  { field: "store", direction: "desc", label: "Negozio Z→A", adminOnly: true },
  { field: "seller", direction: "asc", label: "Venditore A→Z" },
  { field: "seller", direction: "desc", label: "Venditore Z→A" },
  { field: "items", direction: "asc", label: "Meno articoli" },
  { field: "items", direction: "desc", label: "Più articoli" },
  { field: "payment", direction: "asc", label: "Prima la carta" },
  { field: "payment", direction: "desc", label: "Prima i contanti" },
  { field: "total", direction: "asc", label: "Totale crescente" },
  { field: "total", direction: "desc", label: "Totale decrescente" },
  { field: "status", direction: "asc", label: "Prima le annullate" },
  { field: "status", direction: "desc", label: "Prima le valide" },
];

// componente Sales: le vendite per i due ruoli. Il responsabile vede tutti i negozi e sceglie
// il periodo, il dipendente vede il suo negozio giorno per giorno e annulla le sue vendite di oggi
const Sales = () => {
  // utente collegato e ruolo
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  // su telefono "Filtri" accanto al periodo
  const isPhone = useIsPhone();
  // fino a 1366px le card (negozio e "Ordina" nel bottone "Filtri"), sopra la tabella
  const showCards = useShowCards();

  // una pagina di vendite, i totali (solo le valide) e le pagine
  const [sales, setSales] = useState([]);
  const [totals, setTotals] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  // filtri: periodo e negozio (responsabile), stato ("" tutte, "valid", "cancelled")
  const [filters, setFilters] = useState({
    period: "day",
    store: "",
    status: "",
  });
  // ordine scelto (lo applica il server)
  const [sort, setSort] = useState(DEFAULT_SORT);
  // negozi, per il filtro
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");
  // true fino ai primi dati: gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // aumentarlo ricarica le vendite
  const [refreshCount, setRefreshCount] = useState(0);
  // vendita da annullare (modale aperto), oppure null
  const [saleToCancel, setSaleToCancel] = useState(null);
  // un giorno del periodo mostrato (le frecce lo spostano)
  const [referenceDate, setReferenceDate] = useState(new Date());
  // casse del periodo, per la card "Cassa" (e per non annullare a cassa chiusa)
  const [cashSessions, setCashSessions] = useState([]);

  // inizio e fine del periodo (il dipendente un giorno alla volta); from e to come testo per l'effetto
  const period = isAdmin ? filters.period : "day";
  const range = getPeriodRange(period, referenceDate);
  const from = range.start.toISOString();
  const to = range.end.toISOString();

  // prendo le vendite al cambio di periodo, filtri, ordine, pagina e al refreshCount
  // (per il dipendente il server tiene solo il suo negozio)
  useEffect(() => {
    // ignore: true se parte una richiesta più nuova (la risposta vecchia la scarto)
    let ignore = false;
    const query = toQuery({
      from,
      to,
      store: filters.store,
      status: filters.status,
      sortBy: sort.field,
      order: sort.direction,
      page,
      limit: PAGE_SIZE,
    });
    loadData(
      `/sales?${query}`,
      (data) => {
        if (ignore) return;
        setSales(data.sales);
        setTotals(data.totals);
        setTotalPages(data.pagination.totalPages);
      },
      setError,
    ).finally(() => setIsLoading(false));
    // pulizia: React la chiama prima di rifare l'effetto
    return () => {
      ignore = true;
    };
  }, [from, to, filters, sort, page, refreshCount]);

  // prendo le casse al cambio di periodo e negozio
  useEffect(() => {
    // ignore: true se parte una richiesta più nuova (la risposta vecchia la scarto)
    let ignore = false;
    const query = toQuery({ from, to, store: filters.store });
    loadData(
      `/cash-sessions?${query}`,
      (data) => {
        if (!ignore) setCashSessions(data.cashSessions);
      },
      setError,
    );
    // pulizia: React la chiama prima di rifare l'effetto
    return () => {
      ignore = true;
    };
  }, [from, to, filters.store]);

  // prendo i negozi una volta sola (solo il responsabile)
  useEffect(() => {
    if (!isAdmin) return;
    loadData("/stores", (data) => setStores(data.stores), setError);
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

  // vendita annullata: chiudo il modale e ricarico
  const handleCancelled = () => {
    setSaleToCancel(null);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // valori calcolati

  // negozio per il sottotitolo: quello scelto (responsabile) o il suo (dipendente)
  let storeName = user.store?.name;
  if (isAdmin) {
    storeName = filters.store
      ? (stores.find((store) => store._id === filters.store)?.name ?? "")
      : "Tutti i negozi";
  }

  // sottotitolo: periodo e negozio
  const subtitle = `${formatPeriod(period, range)} · ${storeName}`;

  // frecce: sposto il periodo e torno alla pagina 1
  const moveReference = (step) => {
    setReferenceDate((prevDate) => movePeriodDate(period, prevDate, step));
    setPage(1);
  };
  // torno al periodo in corso
  const goToToday = () => {
    setReferenceDate(new Date());
    setPage(1);
  };
  // giorno scelto dal calendario: vado al suo periodo
  const pickDate = (date) => {
    setReferenceDate(date);
    setPage(1);
  };
  // true se è il periodo in corso (spegne "Oggi", "Questa settimana"...)
  const isCurrentPeriod =
    getPeriodRange(period, new Date()).start.getTime() ===
    range.start.getTime();
  // scritte delle frecce per il periodo
  const [previousLabel, nextLabel, todayLabel] = PERIOD_NAV_LABELS[period];
  // filtri attivi nel menu, per il pallino
  const menuFilterCount = filters.store ? 1 : 0;

  // stati: "Annullate" con il numero
  const statusOptions = [
    { value: "", label: "Tutte" },
    { value: "valid", label: "Valide" },
    { value: "cancelled", label: `Annullate (${totals?.cancelledCount ?? 0})` },
  ];

  // messaggio della lista vuota: "oggi" o "in questo giorno" (dipendente), "in questo periodo" (responsabile)
  let emptyWhen = "in questo periodo";
  if (!isAdmin) emptyWhen = isCurrentPeriod ? "oggi" : "in questo giorno";
  const emptyMessage =
    filters.status === "cancelled"
      ? `Nessuna vendita annullata ${emptyWhen}`
      : `Nessuna vendita ${emptyWhen}`;

  // true se la vendita è sua, è di oggi e la cassa non è ancora chiusa (il server lo ricontrolla)
  const canCancel = (sale) =>
    !isAdmin &&
    sale.soldBy?._id === user._id &&
    isSameDay(sale.createdAt, new Date()) &&
    !cashSessions[0]?.closedAt;

  // props uguali per tabella e card ("Annulla vendita" solo il dipendente)
  const listProps = {
    showStore: isAdmin,
    showSeller: true,
    onCancel: isAdmin ? undefined : setSaleToCancel,
    canCancel,
  };

  // righe della card "Pagamenti"
  const paymentRows = [
    {
      label: "Contanti",
      note: "in cassa",
      value: formatEuro(totals?.cashRevenue ?? 0),
    },
    {
      label: "Carta",
      note: "POS",
      value: formatEuro(totals?.cardRevenue ?? 0),
    },
  ];
  // righe della card "Venduto per aliquota": il totale IVA compresa di ogni aliquota
  const vatRows = (totals?.byVatRate ?? []).map((row) => ({
    label: `IVA ${row.vatRate}%`,
    value: formatEuro(row.revenue),
  }));

  // negozi della card "Cassa": tutti o quello scelto (responsabile), il suo (dipendente)
  let cashStores = user.store ? [user.store] : [];
  if (isAdmin) {
    cashStores = filters.store
      ? stores.filter((store) => store._id === filters.store)
      : stores;
  }

  // menu "Ordina", solo con le card
  const sortSelect = showCards && (
    <SortSelect
      options={SORT_OPTIONS.filter((option) => isAdmin || !option.adminOnly)}
      sort={sort}
      defaultSort={DEFAULT_SORT}
      onChange={changeSort} // nuovo ordine: pagina 1
    />
  );

  // periodo a pulsanti, sempre in vista
  const periodFilter = isAdmin && (
    <FilterChips
      label="Periodo"
      options={PERIOD_OPTIONS}
      value={filters.period}
      onChange={(value) => changeFilter("period", value)} // nuovo periodo: pagina 1
    />
  );
  // stato a pulsanti, per tutti e due i ruoli: accanto al titolo dell'elenco (vale solo per lui)
  const statusFilter = (
    <FilterChips
      label="Stato"
      options={statusOptions}
      value={filters.status}
      onChange={(value) => changeFilter("status", value)} // nuovo stato: pagina 1
    />
  );
  // negozio a tendina: nel menu con le card, in riga con la tabella
  const storeFilter = isAdmin && (
    <FilterSelect
      label="Negozio"
      allLabel="Tutti i negozi"
      options={toStoreOptions(stores)}
      value={filters.store}
      onChange={(value) => changeFilter("store", value)} // nuovo negozio: pagina 1
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
      <PageHeader title="Vendite" subtitle={subtitle} error={error}>
        {/* frecce per tutti e due i ruoli (il dipendente va di un giorno) */}
        <WeekNav
          onPrevious={() => moveReference(-1)} // periodo prima
          onNext={() => moveReference(1)} // periodo dopo
          onToday={goToToday} // periodo in corso
          isCurrentWeek={isCurrentPeriod}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          todayLabel={todayLabel}
          onPickDate={pickDate} // giorno dal calendario
          selectedDate={referenceDate}
          period={period}
        />
      </PageHeader>

      {/* periodo sempre in vista (responsabile); con le card negozio e "Ordina" nel bottone "Filtri",
          su telefono accanto al periodo. Il dipendente con la tabella qui non ha filtri */}
      {(isAdmin || showCards) && (
        <FilterBar>
          {showCards && isPhone && isAdmin ? (
            <div className="filter-row">
              {periodFilter}
              {filtersMenu}
            </div>
          ) : (
            <>
              {periodFilter}
              {!showCards && storeFilter}
              {showCards && filtersMenu}
            </>
          )}
        </FilterBar>
      )}

      {/* totali per tutti e due i ruoli (solo vendite valide): arancio, blu, magenta, viola.
          Quattro in riga da 1400px, due per riga da 576px, una sotto l'altra su telefono */}
      <Row className="g-3 mb-4">
        {/* incasso e vendite in una card, come nella Dashboard */}
        <Col xs={12} sm={6} xxl={3}>
          <KpiCard
            color="orange"
            label="Incasso"
            value={formatEuro(totals?.revenue ?? 0)}
            detail={`${formatSalesCount(totals?.count ?? 0)} · IVA compresa`}
          />
        </Col>
        {/* la cassa: quante chiusure da controllare per negozio */}
        <Col xs={12} sm={6} xxl={3}>
          <CashKpiCard
            cashSessions={cashSessions} // le casse del periodo
            stores={cashStores} // un negozio per riga
          />
        </Col>
        {/* contanti e carta in una card: per far tornare cassa e POS a fine giornata */}
        <Col xs={12} sm={6} xxl={3}>
          <KpiCard color="primary" label="Pagamenti" rows={paymentRows} />
        </Col>
        {/* venduto di ogni aliquota: per controllare i corrispettivi */}
        <Col xs={12} sm={6} xxl={3}>
          <KpiCard
            color="secondary"
            label="Venduto per aliquota"
            rows={vatRows} // una riga per aliquota
            detail="IVA compresa"
          />
        </Col>
      </Row>

      {/* le chiusure di cassa del periodo, quelle che non tornano in evidenza */}
      <CashClosingList
        cashSessions={cashSessions} // le casse del periodo
        showStore={isAdmin && !filters.store} // il negozio solo se li guardo tutti
        showCards={showCards} // card o tabella, come le vendite
        emptyMessage={
          period === "day" && isCurrentPeriod
            ? "Nessuna cassa aperta oggi"
            : "Nessuna cassa in questo periodo"
        }
      />

      {/* titolo dell'elenco delle vendite e, accanto, lo stato (come nelle chiusure) */}
      <SectionHeader
        title="Elenco vendite"
        className="section-header-filters"
        aside={statusFilter}
      />

      {/* rotellina, poi il messaggio se non ci sono vendite */}
      {isLoading && <Loader />}
      {!isLoading && sales.length === 0 && !error && (
        <Message>{emptyMessage}</Message>
      )}

      {/* fino a 1366px le card, sopra la tabella */}
      {sales.length > 0 &&
        (showCards ? (
          // align-items-start: una card aperta non allunga quella accanto
          <Row xs={1} md={2} className="g-3 align-items-start">
            {sales.map((sale) => (
              <Col key={sale._id}>
                {/* passo la vendita e le props comuni */}
                <SaleCard sale={sale} {...listProps} />
              </Col>
            ))}
          </Row>
        ) : (
          <SaleTable
            sales={sales}
            sort={sort}
            onSort={sortByColumn} // clic su un'intestazione
            timeLabel={period === "day" ? "Ora" : "Giorno"} // su settimana e mese c'è anche il giorno
            {...listProps} // negozio, venditore e "Annulla vendita"
          />
        ))}

      {/* le pagine, solo se sono più di una */}
      <Pagination
        page={page}
        totalPages={totalPages}
        label="Pagine delle vendite"
        onChange={setPage}
      />

      {/* modale per annullare, solo il dipendente (!! = true/false) */}
      {!isAdmin && (
        <FormModal
          show={!!saleToCancel}
          title="Annulla vendita"
          onClose={() => setSaleToCancel(null)}
        >
          {/* il modulo c'è solo con una vendita scelta: si riapre vuoto */}
          {saleToCancel && (
            <CancelSaleForm
              sale={saleToCancel} // la vendita da annullare
              onSaved={handleCancelled} // chiudo e ricarico
              onCancel={() => setSaleToCancel(null)}
            />
          )}
        </FormModal>
      )}
    </Container>
  );
};

export default Sales;
