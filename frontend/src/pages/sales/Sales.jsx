import "./sales.css";
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import { useAuth } from "../../hooks/useAuth";
import { useIsPhone } from "../../hooks/useIsPhone";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { loadData } from "../../api/loadData";
import { getMonth, getToday, getWeek } from "../../utils/dates";
import { formatEuro } from "../../utils/formatEuro";
import { toQuery } from "../../utils/toQuery";
import { toStoreOptions } from "../../utils/toStoreOptions";

import Button from "../../components/common/button/Button";
import FilterBar from "../../components/common/filterBar/FilterBar";
import FilterChips from "../../components/common/filterBar/FilterChips";
import FilterSelect from "../../components/common/filterBar/FilterSelect";
import FormModal from "../../components/common/formModal/FormModal";
import KpiCard from "../../components/common/kpiCard/KpiCard";
import Loader from "../../components/common/loader/Loader";
import Message from "../../components/common/message/Message";
import PageHeader from "../../components/common/pageHeader/PageHeader";
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

// pagina Vendite per i due ruoli: il responsabile vede tutti i negozi e sceglie il periodo,
// il dipendente vede solo le sue vendite di oggi e può annullarle con un motivo
const Sales = () => {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  // su telefono il negozio va nel menu "Filtri"
  const isPhone = useIsPhone();
  // fino a 1200px le card, sopra la tabella: sotto, la tabella si stringe e nasconde il totale
  const showCards = useMediaQuery("(max-width: 1199.98px)");

  // una pagina di vendite, i totali (solo vendite non annullate) e quante pagine ci sono
  const [sales, setSales] = useState([]);
  const [totals, setTotals] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  // filtri del responsabile: si parte da oggi e da tutti i negozi ("")
  const [filters, setFilters] = useState({ period: "today", store: "" });
  // i negozi, per il menu del filtro (solo il responsabile)
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");
  // true finché i dati non arrivano la prima volta: intanto gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // aumentarlo ricarica le vendite (dopo un annullamento)
  const [refreshCount, setRefreshCount] = useState(0);
  // la vendita da annullare (modale aperto), oppure null
  const [saleToCancel, setSaleToCancel] = useState(null);

  // le vendite: i filtri li applica il server (sono divise in pagine da 20).
  // Il dipendente vede sempre oggi e solo le sue (soldBy); toQuery salta i valori vuoti
  useEffect(() => {
    const query = toQuery({
      ...PERIOD_RANGES[isAdmin ? filters.period : "today"](),
      store: filters.store,
      soldBy: isAdmin ? "" : user._id,
      page,
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
  }, [filters.period, filters.store, page, refreshCount, isAdmin, user._id]);

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
  // quanti filtri del menu sono attivi, per il pallino su "Filtri" (su telefono c'è solo il negozio)
  const menuFilterCount = filters.store ? 1 : 0;

  // props uguali per tabella e card: "Annulla vendita" solo per il dipendente
  const listProps = {
    showStore: isAdmin,
    showSeller: isAdmin,
    onCancel: isAdmin ? undefined : setSaleToCancel,
  };

  // periodo a pulsanti: resta sempre in vista, anche su telefono
  const periodFilter = isAdmin && (
    <FilterChips
      label="Periodo"
      options={PERIOD_OPTIONS}
      value={filters.period}
      onChange={(value) => changeFilter("period", value)}
    />
  );
  // negozio a menu a tendina: su telefono va nel menu "Filtri"
  const storeFilter = isAdmin && (
    <FilterSelect
      label="Negozio"
      allLabel="Tutti i negozi"
      options={toStoreOptions(stores)}
      value={filters.store}
      onChange={(value) => changeFilter("store", value)}
    />
  );

  return (
    <Container fluid>
      {/* su telefono il menu "Filtri" (con il negozio) sta a destra del sottotitolo */}
      <PageHeader
        title="Vendite"
        subtitle={subtitle}
        subtitleAside={
          isAdmin &&
          isPhone && (
            <FilterBar compact activeCount={menuFilterCount}>
              {storeFilter}
            </FilterBar>
          )
        }
        error={error}
      />

      {/* filtri solo per il responsabile: il periodo sempre, il negozio da tablet in su */}
      {isAdmin && (
        <FilterBar>
          {periodFilter}
          {!isPhone && storeFilter}
        </FilterBar>
      )}

      {/* le card dei totali: due per riga su telefono, quattro da xl.
          Contano solo le vendite non annullate (lo fa il server); finché non arrivano, 0.
          Colori scelti per la pagina: arancio, blu, magenta, viola */}
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
        {/* netto e IVA servono al responsabile, per i conti */}
        {isAdmin && (
          <>
            <Col>
              <KpiCard
                color="primary"
                label="Netto"
                value={formatEuro(totals?.netRevenue ?? 0)}
                detail="senza IVA"
              />
            </Col>
            <Col>
              <KpiCard
                color="secondary"
                label="IVA"
                value={formatEuro(totals?.vat ?? 0)}
                detail="da versare"
              />
            </Col>
          </>
        )}
      </Row>

      {/* la rotellina mentre arrivano i dati; poi il messaggio se non ci sono vendite */}
      {isLoading && <Loader />}
      {!isLoading && sales.length === 0 && !error && (
        <Message>
          {isAdmin
            ? "Nessuna vendita in questo periodo"
            : "Nessuna vendita oggi"}
        </Message>
      )}

      {/* fino a 1200px le card (una colonna su telefono, due su tablet); sopra la tabella */}
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
          <SaleTable sales={sales} {...listProps} />
        ))}

      {/* le pagine solo se sono più di una: Precedente e Successiva si spengono agli estremi */}
      {totalPages > 1 && (
        <nav className="sales-pagination" aria-label="Pagine delle vendite">
          <Button
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage((prevPage) => prevPage - 1)}
          >
            Precedente
          </Button>
          <span className="sales-pagination-label">
            Pagina {page} di {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page === totalPages}
            onClick={() => setPage((prevPage) => prevPage + 1)}
          >
            Successiva
          </Button>
        </nav>
      )}

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
