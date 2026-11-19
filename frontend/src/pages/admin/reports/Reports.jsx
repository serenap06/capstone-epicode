import "./reports.css";
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import { loadData } from "../../../api/loadData";
import { buildReportSeries } from "../../../utils/buildReportSeries";
import { formatEuro } from "../../../utils/formatEuro";
import {
  formatPeriod,
  getPeriodRange,
  movePeriodDate,
  PERIOD_NAV_LABELS,
  REPORT_PERIOD_OPTIONS,
} from "../../../utils/periods";
import { toQuery } from "../../../utils/toQuery";
import { toStoreOptions } from "../../../utils/toStoreOptions";

import FilterBar from "../../../components/common/filterBar/FilterBar";
import FilterChips from "../../../components/common/filterBar/FilterChips";
import FilterSelect from "../../../components/common/filterBar/FilterSelect";
import KpiCard from "../../../components/common/kpiCard/KpiCard";
import Loader from "../../../components/common/loader/Loader";
import Message from "../../../components/common/message/Message";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import Panel from "../../../components/common/panel/Panel";
import WeekNav from "../../../components/common/weekNav/WeekNav";
import PaymentSplit from "../../../components/reports/paymentSplit/PaymentSplit";
import RevenueChart from "../../../components/reports/revenueChart/RevenueChart";
import SoldProducts from "../../../components/reports/soldProducts/SoldProducts";
import TopProducts from "../../../components/reports/topProducts/TopProducts";
import VatTable from "../../../components/reports/vatTable/VatTable";

// pagina Report del responsabile: incassi di un periodo (settimana, mese, trimestre,
// semestre o anno), di tutti i negozi o di uno. Le frecce spostano il periodo, come nei Turni.
// Contano solo le vendite non annullate (lo fa il server)
const Reports = () => {
  // report: totali, andamento, pagamenti, IVA per aliquota, i più venduti e tutti i prodotti venduti
  // (null finché non arriva)
  const [report, setReport] = useState(null);
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");
  // true finché i dati non arrivano la prima volta: intanto gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // il periodo scelto e un giorno dentro quel periodo (le frecce lo spostano)
  const [period, setPeriod] = useState("month");
  const [referenceDate, setReferenceDate] = useState(new Date());
  // il negozio scelto ("" = tutti)
  const [store, setStore] = useState("");

  // inizio, fine e raggruppamento del periodo mostrato
  const range = getPeriodRange(period, referenceDate);

  // il report, a ogni cambio di periodo, di data o di negozio. toQuery salta i valori vuoti.
  // from e to come testo: un oggetto Date nuovo a ogni disegno farebbe ripartire l'effetto
  const from = range.start.toISOString();
  const to = range.end.toISOString();
  useEffect(() => {
    // ignore: diventa true se parte una richiesta più nuova (la risposta vecchia la scarto)
    let ignore = false;
    const query = toQuery({ from, to, groupBy: range.groupBy, store });
    loadData(
      `/reports/revenue?${query}`,
      (data) => {
        if (!ignore) setReport(data.report);
      },
      setError,
    ).finally(() => setIsLoading(false));
    // pulizia: React la chiama prima di rifare l'effetto
    return () => {
      ignore = true;
    };
  }, [from, to, range.groupBy, store]);

  // i negozi una volta sola, per il filtro
  useEffect(() => {
    loadData("/stores", (data) => setStores(data.stores), setError);
  }, []);

  // valori calcolati

  // true se il periodo mostrato è quello in corso (spegne "Questo mese")
  const isCurrentPeriod =
    getPeriodRange(period, new Date()).start.getTime() ===
    range.start.getTime();
  // le scritte delle frecce per il periodo scelto
  const [previousLabel, nextLabel, todayLabel] = PERIOD_NAV_LABELS[period];

  // il nome del negozio scelto, per il sottotitolo (?? "": finché i negozi non arrivano)
  const storeName = store
    ? (stores.find((oneStore) => oneStore._id === store)?.name ?? "")
    : "Tutti i negozi";

  // le barre del grafico, anche dei periodi senza vendite
  const bars = report ? buildReportSeries(report.series, range, period) : [];
  const totals = report?.totals;
  const hasSales = totals?.salesCount > 0;

  // periodo a pulsanti, sempre in vista
  const periodFilter = (
    <FilterChips
      label="Periodo"
      options={REPORT_PERIOD_OPTIONS}
      value={period}
      onChange={setPeriod}
    />
  );
  // negozio a menu a tendina
  const storeFilter = (
    <FilterSelect
      label="Negozio"
      allLabel="Tutti i negozi"
      options={toStoreOptions(stores)}
      value={store}
      onChange={setStore}
    />
  );

  return (
    <Container fluid className="reports-page">
      <PageHeader
        title="Report"
        subtitle={
          <>
            <span className="text-nowrap">{formatPeriod(period, range)} ·</span>{" "}
            <span className="text-nowrap">{storeName}</span>
          </>
        }
        error={error}
      >
        {/* le frecce cambiano solo referenceDate; il bottone torna al periodo in corso */}
        <WeekNav
          onPrevious={() =>
            setReferenceDate(movePeriodDate(period, referenceDate, -1))
          }
          onNext={() =>
            setReferenceDate(movePeriodDate(period, referenceDate, 1))
          }
          onToday={() => setReferenceDate(new Date())}
          isCurrentWeek={isCurrentPeriod}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          todayLabel={todayLabel}
        />
      </PageHeader>

      {/* da tablet in su periodi e negozio in riga; su telefono i cinque periodi prendono
          tutta la riga e il negozio va sotto (vedi reports.css) */}
      <FilterBar>
        {periodFilter}
        {storeFilter}
      </FilterBar>

      {/* i totali del periodo: due per riga, quattro da 1400px. Il numero si adatta
          alla larghezza della card (reports.css), così anche gli importi di un anno ci stanno.
          Gli stessi colori della pagina Vendite: arancio, blu, magenta, viola */}
      <Row xs={2} xxl={4} className="g-3 mb-4">
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
            value={totals?.salesCount ?? 0}
            detail="scontrini"
          />
        </Col>
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
      </Row>

      {isLoading && <Loader />}
      {!isLoading && report && !hasSales && !error && (
        <Message>Nessuna vendita in questo periodo</Message>
      )}

      {/* i riquadri solo se ci sono vendite */}
      {hasSales && (
        <>
          {/* in alto il grafico (8 colonne) e accanto i cinque più venduti (4);
              sotto i 1200px uno sotto l'altro */}
          <Row className="g-4 mb-4">
            <Col xl={8}>
              <Panel title="Andamento degli incassi" className="h-100">
                <RevenueChart bars={bars} />
              </Panel>
            </Col>
            <Col xl={4}>
              <Panel title="Prodotti più venduti" className="h-100">
                <TopProducts products={report.topProducts} />
              </Panel>
            </Col>
          </Row>

          {/* poi tutti i prodotti venduti, a tutta larghezza, con ricerca, categoria e pagine */}
          <Panel
            title="Prodotti venduti"
            aside={
              <span className="reports-count">
                {report.soldProducts.length}{" "}
                {report.soldProducts.length === 1 ? "prodotto" : "prodotti"}
              </span>
            }
            className="mb-4"
          >
            <SoldProducts
              products={report.soldProducts}
              totalRevenue={totals.revenue}
            />
          </Panel>

          {/* in fondo i conti: IVA e pagamenti affiancati (servono per i corrispettivi) */}
          <Row className="g-4">
            <Col xl={6}>
              <Panel title="IVA per aliquota" className="h-100">
                <VatTable byVatRate={report.byVatRate} />
              </Panel>
            </Col>
            <Col xl={6}>
              <Panel title="Pagamenti" className="h-100">
                <PaymentSplit
                  byPayment={report.byPayment}
                  totalRevenue={totals.revenue}
                />
              </Panel>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Reports;
