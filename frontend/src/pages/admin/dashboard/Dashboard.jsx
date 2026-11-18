import "./dashboard.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";

import { loadData } from "../../../api/loadData";
import { getToday } from "../../../utils/dates";
import { formatEuro } from "../../../utils/formatEuro";
import { formatLongDate } from "../../../utils/formatLongDate";
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

// pagina iniziale del responsabile: indicatori, task e turni di oggi, prodotti sotto scorta
const Dashboard = () => {
  // kpis: null finché non arrivano (intanto le card mostrano "–")
  const [kpis, setKpis] = useState(null);
  const [error, setError] = useState("");
  // true finché i dati non arrivano la prima volta: intanto gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [lowStocks, setLowStocks] = useState([]);

  // oggi per esteso
  const today = formatLongDate();

  // all'apertura le quattro richieste partono insieme
  useEffect(() => {
    // "from=...&to=..." di oggi
    const todayQuery = toQuery(getToday());

    // Promise.all aspetta tutte le richieste, poi finally spegne la rotellina
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

  return (
    <Container fluid>
      <PageHeader title="Dashboard" subtitle={today} error={error} />
      {/* le card dei numeri; ognuna porta alla sua pagina. Ci sono subito, con "–" finché
          non arrivano i numeri: così la pagina non salta.
          Le vendite per prime e su tutta la riga: l'incasso può essere un numero lungo */}
      <section aria-label="Indicatori">
        <Row className="g-3 mb-3">
          <Col xs={12}>
            <KpiCard
              to="/admin/sales"
              color="orange"
              label="Vendite di oggi"
              value={kpis ? formatEuro(kpis.salesToday.revenue) : "–"}
              detail={`${kpis?.salesToday.count ?? "–"} vendite`}
            />
          </Col>
        </Row>
        {/* le altre quattro: 2 per riga su telefono e tablet, 4 da lg */}
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
              to="/admin/stock"
              color="turquoise"
              label="Sotto scorta"
              value={kpis?.lowStockItems ?? "–"}
              detail="prodotti"
            />
          </Col>
          <Col>
            <KpiCard
              to="/admin/supply-requests"
              color="blue"
              label="Richieste di fornitura"
              value={kpis?.pendingSupplyRequests ?? "–"}
              detail="aperte"
            />
          </Col>
        </Row>
      </section>

      {/* sotto: task a sinistra (7 colonne), turni e sotto scorta a destra (5) */}
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
          {/* lista che scorre dentro (dashboard.css) */}
          <div className="dashboard-tasks">
            {tasks.map((task) => (
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
              <ShiftList shifts={shifts} />
            </div>
          </Panel>

          <Panel
            title="Sotto scorta"
            aside={
              <Link to="/admin/stock" className="section-link">
                Vedi tutti
              </Link>
            }
          >
            {isLoading && <Loader />}
            {!isLoading && lowStocks.length === 0 && !error && (
              <Message>Nessun prodotto sotto scorta</Message>
            )}
            <div className="dashboard-list">
              <LowStockList stocks={lowStocks} />
            </div>
          </Panel>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
