import "./home.css";
import { loadData } from "../../api/loadData";
import { replaceTask, toggleTaskStatus } from "../../api/tasks";
import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

import { getToday, getWeek, isSameDay, toQuery } from "../../utils/dates";
import { getPercent } from "../../utils/getPercent";
import { formatEuro } from "../../utils/formatEuro";
import { formatLongDate } from "../../utils/formatLongDate";

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
  // shifts: i turni della settimana di tutto il negozio (servono anche per i colleghi)
  const [shifts, setShifts] = useState([]);
  // hours: ore pianificate e ore di contratto della settimana
  const [hours, setHours] = useState(null);
  // tasks: le task di oggi del dipendente
  const [tasks, setTasks] = useState([]);
  // sales: incasso e numero di vendite di oggi del dipendente
  const [sales, setSales] = useState(null);
  const [error, setError] = useState("");

  // data di oggi per esteso e nome del negozio (arriva con l'utente, dall'AuthContext)
  const today = formatLongDate();
  const storeName = user.store?.name ?? "";

  // all'apertura carico tutto in parallelo.
  // [user._id] in fondo: se cambia l'utente ricarico (in pratica succede solo all'inizio)
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

  // spunta o toglie la spunta a una task: la cambio sul server,
  // poi metto la task aggiornata nella lista senza ricaricare tutto
  const toggleTask = async (task) => {
    try {
      const updatedTask = await toggleTaskStatus(task);
      setTasks((prevTasks) => replaceTask(prevTasks, updatedTask));
    } catch (e) {
      setError(e.message);
    }
  };

  // valori calcolati: si ricalcolano da soli ogni volta che cambia lo stato
  // i turni di oggi, di tutti
  const now = new Date();
  const todayShifts = shifts.filter((shift) => isSameDay(shift.startAt, now));
  // i miei turni della settimana, per la striscia dei giorni
  const myWeekShifts = shifts.filter((shift) => shift.user._id === user._id);
  // il mio turno di oggi (find: uno solo), oppure undefined se riposo
  const myShift = todayShifts.find((shift) => shift.user._id === user._id);
  // i turni di oggi degli altri, per i badge dei colleghi
  const colleagueShift = todayShifts.filter(
    (shift) => shift.user._id !== user._id,
  );
  // quante task di oggi ho già fatto (è un numero, per il .length in fondo) e la percentuale
  const doneTasks = tasks.filter((task) => task.status === "done").length;
  const percent = getPercent(doneTasks, tasks.length);

  return (
    <Container fluid>
      <PageHeader
        title={`Ciao, ${user.name}!`}
        // sottotitolo: "sabato 14 novembre · Bookshop Museo", i due pezzi vanno a capo interi
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
          {/* card magenta con il turno di oggi */}
          <MyShiftCard shift={myShift} colleagues={colleagueShift} />
        </Col>
      </Row>

      {/* tre card: due per riga su telefono (la terza a tutta larghezza), tre su tablet e computer */}
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

      {/* due riquadri affiancati da lg in su, alti uguali grazie a h-100 */}
      <Row className="g-4 mt-1">
        <Col lg={6}>
          <Panel
            className="h-100"
            title="Task di oggi"
            aside={
              <span className="section-count">
                {doneTasks} su {tasks.length}
              </span>
            }
            footer={
              <Link to="/employee/tasks" className="section-link">
                Vedi tutte le task
              </Link>
            }
          >
            {/* barra, lista con le caselle e link in fondo */}
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
