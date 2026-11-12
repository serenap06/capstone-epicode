import { useState, useEffect } from "react";
import api from "../../../api/api";
import KpiCard from "../../../components/ui/kpiCard/KpiCard";
import TaskCard from "../../../components/ui/taskCard/TaskCard";
import ShiftList from "../../../components/ui/shiftList/ShiftList";
import LowStockList from "../../../components/ui/lowStockList/LowStockList";
import { formatEuro } from "../../../utils/formatEuro";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./dashboard.css";

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [lowStocks, setLowStocks] = useState([]);

  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  useEffect(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const range = `from=${startOfDay.toISOString()}&to=${endOfDay.toISOString()}`;

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
    <Container>
      <Row>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">{today}</p>
      </Row>
      <Row aria-label="Indicatori">
        {error && <p role="alert">{error}</p>}
        {!error && !kpis && <p>Caricamento</p>}

        {kpis && (
          <section className="dashboard-kpis">
            <KpiCard
              to="/admin/shifts"
              color="primary"
              label="In turno oggi:"
              value={kpis.employeesOnShiftToday}
              detail="dipendenti"
            ></KpiCard>
            <KpiCard
              to="/admin/tasks"
              color="secondary"
              label="Task:"
              value={`${kpis.tasksToday.done} su ${kpis.tasksToday.total}`}
              detail="completate"
            ></KpiCard>
            <KpiCard
              to="/admin/sales"
              color="blue"
              label="Vendite:"
              value={formatEuro(kpis.salesToday.revenue)}
              detail={`${kpis.salesToday.count} vendite`}
            ></KpiCard>
            <KpiCard
              to="/admin/stock"
              color="turquoise"
              label="Sotto scorta:"
              value={kpis.lowStockItems}
              detail="prodotti"
            ></KpiCard>
            <KpiCard
              to="/admin/supply-requests"
              color="orange"
              label="Richieste di fornitura:"
              value={kpis.pendingSupplyRequests}
              detail="aperte"
            ></KpiCard>
          </section>
        )}
      </Row>
      <Row className="dashboard-main">
        <Col md={8} lg={7} id="section-tasks">
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
        <Col>
          <Row>
            <Col className="section-shifts">
              <div className="section-header">
                <h2 className="section-title">Turni di oggi</h2>
                <Link to="/admin/shifts" className="section-show-more">
                  Vedi tutti
                </Link>
              </div>
              {shifts.length === 0 && <p>Nessun turno oggi</p>}
              <div className="dashboard-shifts">
                <ShiftList shifts={shifts} />
              </div>
            </Col>
          </Row>
          <Row>
            <Col className="section-lowStocks">
              <div className="section-header">
                <h2 className="section-title">Sotto scorta</h2>
                <Link to="/admin/stock" className="section-show-more">
                  Vedi tutti
                </Link>
              </div>
              {lowStocks.length === 0 && <p>Nessun prodotto sotto scorta</p>}
              <div className="dashboard-low-stocks">
                <LowStockList stocks={lowStocks} />
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
