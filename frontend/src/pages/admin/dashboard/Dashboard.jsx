import { useState, useEffect } from "react";
import { loadData } from "../../../api/loadData";
import KpiCard from "../../../components/common/kpiCard/KpiCard";
import Message from "../../../components/common/message/Message";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import Panel from "../../../components/common/panel/Panel";
import SectionHeader from "../../../components/common/sectionHeader/SectionHeader";
import TaskCard from "../../../components/tasks/taskCard/TaskCard";
import ShiftList from "../../../components/shifts/shiftList/ShiftList";
import LowStockList from "../../../components/stocks/lowStockList/LowStockList";
import { formatEuro } from "../../../utils/formatEuro";
import { formatLongDate } from "../../../utils/formatLongDate";
import { getToday, toQuery } from "../../../utils/dates";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./dashboard.css";

// pagina iniziale del responsabile: indicatori, task e turni di oggi, prodotti sotto scorta
const Dashboard = () => {
  // kpis: null finché non arrivano (intanto le card mostrano "–")
  const [kpis, setKpis] = useState(null);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [lowStocks, setLowStocks] = useState([]);

  // oggi per esteso
  const today = formatLongDate();

  // all'apertura le quattro richieste partono insieme
  useEffect(() => {
    // "from=...&to=..." di oggi
    const todayQuery = toQuery(getToday());

    loadData("/dashboard", (data) => setKpis(data.kpis), setError);
    loadData(`/tasks?${todayQuery}`, (data) => setTasks(data.tasks), setError);
    loadData(
      `/shifts?${todayQuery}`,
      (data) => setShifts(data.shifts),
      setError,
    );
    loadData(
      "/stocks?lowStock=true",
      (data) => setLowStocks(data.stocks),
      setError,
    );
  }, []);

  return (
    <Container fluid>
      <PageHeader title="Dashboard" subtitle={today} error={error} />
      {/* cinque card: 2 per riga su telefono, 3 su tablet, 5 da xl; ognuna porta alla sua pagina.
          Ci sono subito, con "–" finché non arrivano i numeri: così la pagina non salta */}
      <Row
        as="section"
        xs={2}
        md={3}
        xl={5}
        className="g-3"
        aria-label="Indicatori"
      >
        <Col>
          <KpiCard
            to="/admin/shifts"
            color="primary"
            label="In turno oggi:"
            value={kpis?.employeesOnShiftToday ?? "–"}
            detail="dipendenti"
          />
        </Col>
        <Col>
          <KpiCard
            to="/admin/tasks"
            color="secondary"
            label="Task:"
            value={
              kpis ? `${kpis.tasksToday.done} su ${kpis.tasksToday.total}` : "–"
            }
            detail="completate"
          />
        </Col>
        <Col>
          <KpiCard
            to="/admin/sales"
            color="blue"
            label="Vendite:"
            value={kpis ? formatEuro(kpis.salesToday.revenue) : "–"}
            detail={`${kpis?.salesToday.count ?? "–"} vendite`}
          />
        </Col>
        <Col>
          <KpiCard
            to="/admin/stock"
            color="turquoise"
            label="Sotto scorta:"
            value={kpis?.lowStockItems ?? "–"}
            detail="prodotti"
          />
        </Col>
        <Col>
          <KpiCard
            to="/admin/supply-requests"
            color="orange"
            label="Richieste di fornitura:"
            value={kpis?.pendingSupplyRequests ?? "–"}
            detail="aperte"
          />
        </Col>
      </Row>

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
          {tasks.length === 0 && <Message>Nessuna task per oggi</Message>}
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
            {shifts.length === 0 && <Message>Nessun turno oggi</Message>}
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
            {lowStocks.length === 0 && (
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
