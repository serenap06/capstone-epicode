// import
import "./dashboard.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";

import { loadData } from "../../../api/loadData";
import { getToday } from "../../../utils/dates";
import { formatEuro } from "../../../utils/formatEuro";
import { formatLongDate } from "../../../utils/formatLongDate";
import { formatSalesCount } from "../../../utils/formatSalesCount";
import { toQuery } from "../../../utils/toQuery";

import KpiCard from "../../../components/common/kpiCard/KpiCard";
import Loader from "../../../components/common/loader/Loader";
import Message from "../../../components/common/message/Message";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import Panel from "../../../components/common/panel/Panel";
import SectionHeader from "../../../components/common/sectionHeader/SectionHeader";
import ShiftList from "../../../components/shifts/shiftList/ShiftList";
import LowStockList from "../../../components/stocks/lowStockList/LowStockList";
import TaskCard from "../../../components/tasks/taskCard/TaskCard";

// componente Dashboard: numeri, task e turni di oggi, prodotti sotto scorta
const Dashboard = () => {
  // numeri delle card (null finché non arrivano: si vede "–")
  const [kpis, setKpis] = useState(null);
  const [error, setError] = useState("");
  // true fino ai primi dati: gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // task, turni e giacenze sotto soglia
  const [tasks, setTasks] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [lowStocks, setLowStocks] = useState([]);

  // oggi per esteso
  const today = formatLongDate();

  // prendo tutto all'apertura, con quattro richieste insieme
  useEffect(() => {
    // "from=...&to=..." di oggi
    const todayQuery = toQuery(getToday());

    // Promise.all aspetta tutte le richieste, poi spengo la rotellina
    Promise.all([
      loadData("/dashboard", (data) => setKpis(data.kpis), setError),
      loadData(
        `/tasks?${todayQuery}`,
        (data) => setTasks(data.tasks),
        setError,
      ),
      loadData(
        `/shifts?${todayQuery}`,
        (data) => setShifts(data.shifts),
        setError,
      ),
      loadData(
        "/stocks?lowStock=true",
        (data) => setLowStocks(data.stocks),
        setError,
      ),
    ]).finally(() => setIsLoading(false));
  }, []);

  // colonne della card delle vendite: il totale, poi ogni negozio
  const salesColumns = kpis
    ? [
        {
          label: "Totale",
          value: formatEuro(kpis.salesToday.revenue),
          detail: formatSalesCount(kpis.salesToday.count),
        },
        ...kpis.salesToday.byStore.map((row) => ({
          key: row.store._id,
          label: row.store.name,
          value: formatEuro(row.revenue),
          detail: formatSalesCount(row.count),
        })),
      ]
    : [];

  return (
    <Container fluid>
      <PageHeader title="Dashboard" subtitle={today} error={error} />
      {/* card dei numeri, ognuna porta alla sua pagina ("–" finché non arrivano).
          Le vendite su tutta la riga: il totale e ogni negozio, con una linea tra loro */}
      <section aria-label="Indicatori">
        <Row className="g-3 mb-3">
          <Col xs={12}>
            <KpiCard
              to="/admin/sales" // la card porta alle Vendite
              color="orange"
              label="Vendite di oggi"
              value={kpis ? undefined : "–"} // finché non arrivano
              columns={salesColumns} // totale e negozi
            />
          </Col>
        </Row>
        {/* le altre quattro: 2 per riga, 4 da lg */}
        <Row xs={2} lg={4} className="g-3">
          <Col>
            <KpiCard
              to="/admin/shifts"
              color="primary"
              label="In turno oggi"
              value={kpis?.employeesOnShiftToday ?? "–"}
              detail="dipendenti"
            />
          </Col>
          <Col>
            <KpiCard
              to="/admin/tasks"
              color="secondary"
              label="Task di oggi"
              value={
                kpis
                  ? `${kpis.tasksToday.done} su ${kpis.tasksToday.total}`
                  : "–"
              }
              detail="completate"
            />
          </Col>
          <Col>
            <KpiCard
              to="/admin/stock?level=low" // le giacenze già filtrate: solo sotto soglia
              color="turquoise"
              label="Sotto scorta"
              value={kpis?.lowStockItems ?? "–"}
              detail="prodotti"
            />
          </Col>
          <Col>
            <KpiCard
              to="/admin/supply-requests?state=open" // solo le richieste in attesa
              color="blue"
              label="Richieste di fornitura"
              value={kpis?.pendingSupplyRequests ?? "–"}
              detail="aperte"
            />
          </Col>
        </Row>
      </section>

      {/* sotto: task a sinistra, turni e sotto scorta a destra */}
      <Row className="g-4 mt-2">
        <Col lg={7}>
          <SectionHeader
            title="Task di oggi"
            className="dashboard-tasks-header"
            aside={
              <Link to="/admin/tasks" className="section-link">
                Vedi tutte
              </Link>
            }
          />
          {isLoading && <Loader />}
          {!isLoading && tasks.length === 0 && !error && (
            <Message>Nessuna task per oggi</Message>
          )}
          {/* lista che scorre dentro */}
          <div className="dashboard-tasks">
            {tasks.map((task) => (
              // senza onDelete: dalla Dashboard non si elimina
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        </Col>

        <Col lg={5} className="d-flex flex-column gap-4">
          <Panel
            title="Turni di oggi"
            aside={
              <Link to="/admin/shifts" className="section-link">
                Vedi tutti
              </Link>
            }
          >
            {isLoading && <Loader />}
            {!isLoading && shifts.length === 0 && !error && (
              <Message>Nessun turno oggi</Message>
            )}
            <div className="dashboard-list">
              {/* i turni di oggi, divisi per negozio */}
              <ShiftList shifts={shifts} />
            </div>
          </Panel>

          <Panel
            title="Sotto scorta"
            aside={
              <Link to="/admin/stock?level=low" className="section-link">
                Vedi tutti
              </Link>
            }
          >
            {isLoading && <Loader />}
            {!isLoading && lowStocks.length === 0 && !error && (
              <Message>Nessun prodotto sotto scorta</Message>
            )}
            <div className="dashboard-list">
              {/* le giacenze sotto soglia */}
              <LowStockList stocks={lowStocks} />
            </div>
          </Panel>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
