import { useState, useEffect } from "react";
import api from "../../../api/api";
import KpiCard from "../../../components/ui/kpiCard/KpiCard";
import TaskCard from "../../../components/ui/taskCard/TaskCard";
import ShiftList from "../../../components/ui/shiftList/ShiftList";
import LowStockList from "../../../components/ui/lowStockList/LowStockList";
import { formatEuro } from "../../../utils/formatEuro";
import { formatLongDate } from "../../../utils/formatLongDate";
import { getToday } from "../../../utils/dates";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./dashboard.css";

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [lowStocks, setLowStocks] = useState([]);

  const today = formatLongDate();

  useEffect(() => {
    const range = new URLSearchParams(getToday()).toString();

    const loadKpis = async () => {
      try {
        const data = await api("/dashboard");
        setKpis(data.kpis);
      } catch (e) {
        setError(e.message);
      }
    };

    const loadTasks = async () => {
      try {
        const data = await api(`/tasks?${range}`);
        setTasks(data.tasks);
      } catch (e) {
        setError(e.message);
      }
    };

    const loadShifts = async () => {
      try {
        const data = await api(`/shifts?${range}`);
        setShifts(data.shifts);
      } catch (e) {
        setError(e.message);
      }
    };

    const loadLowStocks = async () => {
      try {
        const data = await api("/stocks?lowStock=true");
        setLowStocks(data.stocks);
      } catch (e) {
        setError(e.message);
      }
    };

    loadKpis();
    loadTasks();
    loadShifts();
    loadLowStocks();
  }, []);

  return (
    <Container fluid>
      <Row>
        <Col>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{today}</p>
          {error && <p role="alert">{error}</p>}
          {!error && !kpis && <p>Caricamento...</p>}
        </Col>
      </Row>

      {kpis && (
        <Row
          as="section"
          xs={2}
          md={3}
          xl={5}
          className="g-3 mt-1"
          aria-label="Indicatori"
        >
          <Col>
            <KpiCard
              to="/admin/shifts"
              color="primary"
              label="In turno oggi:"
              value={kpis.employeesOnShiftToday}
              detail="dipendenti"
            />
          </Col>
          <Col>
            <KpiCard
              to="/admin/tasks"
              color="secondary"
              label="Task:"
              value={`${kpis.tasksToday.done} su ${kpis.tasksToday.total}`}
              detail="completate"
            />
          </Col>
          <Col>
            <KpiCard
              to="/admin/sales"
              color="blue"
              label="Vendite:"
              value={formatEuro(kpis.salesToday.revenue)}
              detail={`${kpis.salesToday.count} vendite`}
            />
          </Col>
          <Col>
            <KpiCard
              to="/admin/stock"
              color="turquoise"
              label="Sotto scorta:"
              value={kpis.lowStockItems}
              detail="prodotti"
            />
          </Col>
          <Col>
            <KpiCard
              to="/admin/supply-requests"
              color="orange"
              label="Richieste di fornitura:"
              value={kpis.pendingSupplyRequests}
              detail="aperte"
            />
          </Col>
        </Row>
      )}

      <Row className="g-4 mt-2">
        <Col lg={7} id="section-tasks">
          <div className="section-header">
            <h2 className="section-title">Task di oggi</h2>
            <Link to="/admin/tasks" className="section-show-more">
              Vedi tutte
            </Link>
          </div>
          {tasks.length === 0 && <p>Nessuna task per oggi</p>}
          <div className="dashboard-tasks">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        </Col>

        <Col lg={5} className="d-flex flex-column gap-4">
          <section className="dashboard-panel" aria-labelledby="shifts-title">
            <div className="section-header">
              <h2 id="shifts-title" className="section-title">
                Turni di oggi
              </h2>
              <Link to="/admin/shifts" className="section-show-more">
                Vedi tutti
              </Link>
            </div>
            {shifts.length === 0 && <p>Nessun turno oggi</p>}
            <div className="dashboard-list">
              <ShiftList shifts={shifts} />
            </div>
          </section>

          <section
            className="dashboard-panel"
            aria-labelledby="low-stock-title"
          >
            <div className="section-header">
              <h2 id="low-stock-title" className="section-title">
                Sotto scorta
              </h2>
              <Link to="/admin/stock" className="section-show-more">
                Vedi tutti
              </Link>
            </div>
            {lowStocks.length === 0 && <p>Nessun prodotto sotto scorta</p>}
            <div className="dashboard-list">
              <LowStockList stocks={lowStocks} />
            </div>
          </section>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
