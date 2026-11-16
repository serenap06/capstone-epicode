import "./home.css";
import { loadData } from "../../api/loadData";
import { replaceTask, toggleTaskStatus } from "../../api/tasks";
import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

import { getToday, getWeek, isSameDay } from "../../utils/dates";
import { toQuery } from "../../utils/toQuery";
import { getPercent } from "../../utils/getPercent";
import { formatEuro } from "../../utils/formatEuro";
import { formatLongDate } from "../../utils/formatLongDate";
import { formatHours } from "../../utils/formatHours";

import KpiCard from "../../components/common/kpiCard/KpiCard";
import Message from "../../components/common/message/Message";
import PageHeader from "../../components/common/pageHeader/PageHeader";
import Panel from "../../components/common/panel/Panel";
import ProgressBar from "../../components/common/progressBar/ProgressBar";
import MyShiftCard from "../../components/shifts/myShiftCard/MyShiftCard";
import MyTaskList from "../../components/tasks/myTaskList/MyTaskList";
import WeekShifts from "../../components/shifts/weekShifts/WeekShifts";

// pagina iniziale del dipendente: turno di oggi, indicatori, task di oggi e settimana
const Home = () => {
  const { user } = useAuth();
  // shifts: i turni della settimana di tutto il negozio (anche dei colleghi)
  const [shifts, setShifts] = useState([]);
  // hours: ore pianificate e di contratto
  const [hours, setHours] = useState(null);
  // tasks: le task di oggi del dipendente
  const [tasks, setTasks] = useState([]);
  // sales: incasso e vendite di oggi
  const [sales, setSales] = useState(null);
  const [error, setError] = useState("");

  // data di oggi e nome del negozio
  const today = formatLongDate();
  const storeName = user.store?.name ?? "";

  // all'apertura carico tutto in parallelo (si ricarica solo se cambia l'utente)
  useEffect(() => {
    const todayQuery = toQuery(getToday());
    const weekQuery = toQuery(getWeek());

    loadData(
      `/shifts?${weekQuery}`,
      (data) => setShifts(data.shifts),
      setError,
    );
    loadData(
      `/shifts/hours?${weekQuery}`,
      (data) => setHours(data.hours[0]),
      setError,
    );
    loadData(
      `/tasks/mine?${todayQuery}`,
      (data) => setTasks(data.tasks),
      setError,
    );
    loadData(
      `/sales?soldBy=${user._id}&${todayQuery}`,
      (data) => setSales(data.totals),
      setError,
    );
  }, [user._id]);

  // spunta o toglie la spunta, poi aggiorna la task nella lista
  const toggleTask = async (task) => {
    try {
      const updatedTask = await toggleTaskStatus(task);
      setTasks((prevTasks) => replaceTask(prevTasks, updatedTask));
    } catch (e) {
      setError(e.message);
    }
  };

  // valori calcolati dallo stato: i turni di oggi di tutti
  const now = new Date();
  const todayShifts = shifts.filter((shift) => isSameDay(shift.startAt, now));
  // i miei turni della settimana
  const myWeekShifts = shifts.filter((shift) => shift.user._id === user._id);
  // il mio turno di oggi, oppure undefined se riposo
  const myShift = todayShifts.find((shift) => shift.user._id === user._id);
  // i turni di oggi dei colleghi
  const colleagueShifts = todayShifts.filter(
    (shift) => shift.user._id !== user._id,
  );
  // task di oggi fatte e percentuale
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const percent = getPercent(doneCount, tasks.length);

  return (
    <Container fluid>
      <PageHeader
        title={`Ciao, ${user.name}!`}
        // "sabato 14 novembre · Bookshop Museo": i due pezzi vanno a capo interi
        subtitle={
          <>
            <span className="text-nowrap">
              {today}
              {storeName && " ·"}
            </span>{" "}
            {storeName && <span className="text-nowrap">{storeName}</span>}
          </>
        }
        error={error}
      />
      <Row>
        <Col>
          {/* turno di oggi */}
          <MyShiftCard shift={myShift} colleagues={colleagueShifts} />
        </Col>
      </Row>

      {/* tre card: 2 per riga su telefono (la terza intera), 3 da sm */}
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
              hours
                ? `${formatHours(hours.scheduledHours)} / ${hours.weeklyHours} h`
                : "–"
            }
            detail="questa settimana"
          />
        </Col>
        <Col>
          <KpiCard
            to="/employee/tasks"
            color="turquoise"
            label="Task di oggi"
            value={`${doneCount} su ${tasks.length}`}
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

      {/* due riquadri affiancati da lg, alti uguali (h-100) */}
      <Row className="g-4 mt-1">
        <Col lg={6}>
          <Panel
            className="h-100"
            title="Task di oggi"
            aside={
              <span className="section-count">
                {doneCount} su {tasks.length}
              </span>
            }
            footer={
              <Link to="/employee/tasks" className="section-link">
                Vedi tutte le task
              </Link>
            }
          >
            {/* barra e lista con le caselle */}
            <ProgressBar percent={percent} className="home-progress" />
            {tasks.length === 0 && <Message>Nessuna task per oggi</Message>}
            <MyTaskList tasks={tasks} onToggle={toggleTask} />
          </Panel>
        </Col>

        <Col lg={6}>
          <Panel
            className="h-100"
            title="La tua settimana"
            footer={
              <Link to="/employee/shifts" className="section-link">
                Vedi tutti i turni
              </Link>
            }
          >
            {/* striscia dei sette giorni */}
            <WeekShifts shifts={myWeekShifts} />
          </Panel>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
