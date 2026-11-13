import "./home.css";
import api from "../../api/api";
import { toggleTaskStatus } from "../../api/tasks";
import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

import { getToday, getWeek, isSameDay } from "../../utils/dates";
import { formatEuro } from "../../utils/formatEuro";
import { formatLongDate } from "../../utils/formatLongDate";

import KpiCard from "../../components/ui/kpiCard/KpiCard";
import MyShiftCard from "../../components/ui/myShiftCard/MyShiftCard";
import MyTaskList from "../../components/ui/myTaskList/MyTaskList";
import WeekShifts from "../../components/ui/weekShifts/WeekShifts";

const Home = () => {
  const { user } = useAuth();
  const [storeName, setStoreName] = useState("");
  const [shifts, setShifts] = useState([]);
  const [hours, setHours] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [sales, setSales] = useState(null);
  const [error, setError] = useState("");

  const today = formatLongDate();

  useEffect(() => {
    const todayQuery = new URLSearchParams(getToday()).toString();
    const weekQuery = new URLSearchParams(getWeek()).toString();

    const loadStore = async () => {
      try {
        const data = await api("/users/me");
        setStoreName(data.user.store?.name ?? "");
      } catch (e) {
        setError(e.message);
      }
    };

    const loadShifts = async () => {
      try {
        const data = await api(`/shifts?${weekQuery}`);
        setShifts(data.shifts);
      } catch (e) {
        setError(e.message);
      }
    };

    const loadHours = async () => {
      try {
        const data = await api(`/shifts/hours?${weekQuery}`);
        setHours(data.hours[0]);
      } catch (e) {
        setError(e.message);
      }
    };

    const loadTasks = async () => {
      try {
        const data = await api(`/tasks/mine?${todayQuery}`);
        setTasks(data.tasks);
      } catch (e) {
        setError(e.message);
      }
    };

    const loadSales = async () => {
      try {
        const data = await api(`/sales?soldBy=${user._id}&${todayQuery}`);
        setSales(data.totals);
      } catch (e) {
        setError(e.message);
      }
    };
    loadStore();
    loadShifts();
    loadHours();
    loadTasks();
    loadSales();
  }, [user._id]);

  const toggleTask = async (task) => {
    try {
      const updatedTask = await toggleTaskStatus(task);
      setTasks((prevTasks) =>
        prevTasks.map((prevTask) =>
          prevTask._id === task._id
            ? { ...prevTask, ...updatedTask }
            : prevTask,
        ),
      );
    } catch (e) {
      setError(e.message);
    }
  };

  const now = new Date();
  const todayShifts = shifts.filter((shift) => isSameDay(shift.startAt, now));
  const myWeekShifts = shifts.filter((shift) => shift.user._id === user._id);
  const myShift = todayShifts.find((shift) => shift.user._id === user._id);
  const colleagueShift = todayShifts.filter(
    (shift) => shift.user._id !== user._id,
  );
  const doneTasks = tasks.filter((task) => task.status === "done").length;
  const percent = tasks.length
    ? Math.round((doneTasks / tasks.length) * 100)
    : 0;

  return (
    <Container fluid>
      <Row>
        <Col>
          <h1 className="page-title">Ciao, {user.name}!</h1>
          <p className="page-subtitle">
            <span className="text-nowrap">
              {today}
              {storeName && " ·"}
            </span>{" "}
            {storeName && <span className="text-nowrap">{storeName}</span>}
          </p>
          {error && <p role="alert">{error}</p>}
          <MyShiftCard shift={myShift} colleagues={colleagueShift} />
        </Col>
      </Row>

      <Row
        as="section"
        xs={2}
        sm={3}
        className="g-3 mt-1 home-kpis"
        aria-label="Bacheca utente"
      >
        <Col>
          <KpiCard
            to="/employee/shifts"
            color="secondary"
            label="Le tue ore"
            value={
              hours ? `${hours.scheduledHours} / ${hours.weeklyHours} h` : "–"
            }
            detail="questa settimana"
          />
        </Col>
        <Col>
          <KpiCard
            to="/employee/tasks"
            color="turquoise"
            label="Task di oggi"
            value={`${doneTasks} su ${tasks.length}`}
            detail="completate"
          />
        </Col>
        <Col xs={12} sm={4}>
          <KpiCard
            color="orange"
            label="Le tue vendite"
            value={formatEuro(sales?.revenue ?? 0)}
            detail={`${sales?.count ?? 0} vendite oggi`}
          />
        </Col>
      </Row>

      <Row className="g-4 mt-1">
        <Col lg={6}>
          <section className="home-panel" aria-labelledby="home-tasks-title">
            <div className="home-panel-header">
              <h2 id="home-tasks-title" className="section-title">
                Task di oggi
              </h2>
              <span className="home-panel-count">
                {doneTasks} su {tasks.length}
              </span>
            </div>
            <div className="progress-track home-progress" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
            {tasks.length === 0 && <p>Nessuna task per oggi</p>}
            <MyTaskList tasks={tasks} onToggle={toggleTask} />
            <Link to="/employee/tasks" className="home-panel-link">
              Vedi tutte le task
            </Link>
          </section>
        </Col>

        <Col lg={6}>
          <section className="home-panel" aria-labelledby="home-week-title">
            <h2 id="home-week-title" className="section-title">
              La tua settimana
            </h2>
            <WeekShifts shifts={myWeekShifts} />
            <Link to="/employee/shifts" className="home-panel-link">
              Vedi tutti i turni
            </Link>
          </section>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
