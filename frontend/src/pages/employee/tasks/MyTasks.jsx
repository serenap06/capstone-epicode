import "./myTasks.css";
import { loadData } from "../../../api/loadData";
import { replaceTask, toggleTaskStatus } from "../../../api/tasks";
import { useAuth } from "../../../hooks/useAuth";

import { useState, useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";

import { getToday, isSameDay } from "../../../utils/dates";
import { getPercent } from "../../../utils/getPercent";
import Message from "../../../components/common/message/Message";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import ProgressBar from "../../../components/common/progressBar/ProgressBar";
import MyTaskCard from "../../../components/tasks/myTaskCard/MyTaskCard";

// pagina "Le mie task" del dipendente: task divise in Oggi, Prossimi giorni e Questo mese
const MyTasks = () => {
  const { user } = useAuth();
  // myTasks: tutte le mie task da oggi in avanti. È l'unico stato con dati: il resto si calcola da qui
  const [myTasks, setMyTasks] = useState([]);
  const [error, setError] = useState("");

  // nome del negozio (arriva con l'utente); ?? "" mette una stringa vuota se manca
  const storeName = user.store?.name ?? "";

  // all'apertura chiedo solo le task da oggi in poi (from = inizio di oggi)
  useEffect(() => {
    loadData(
      `/tasks/mine?from=${getToday().from}`,
      (data) => setMyTasks(data.tasks),
      setError,
    );
  }, []);

  // "Segna come fatto" e "Annulla": cambio lo stato sul server,
  // poi metto la task aggiornata nella lista; sottotitolo e barra si aggiornano da soli
  const toggleTask = async (task) => {
    try {
      const updatedTask = await toggleTaskStatus(task);
      setMyTasks((prevTasks) => replaceTask(prevTasks, updatedTask));
    } catch (e) {
      setError(e.message);
    }
  };

  // le task che scadono oggi, quelle già fatte e la percentuale per la barra
  const todayTasks = myTasks.filter((task) =>
    isSameDay(task.dueDate, new Date()),
  );
  const doneTodayTasks = todayTasks.filter((task) => task.status === "done");
  const percent = getPercent(doneTodayTasks.length, todayTasks.length);

  // le task che NON scadono oggi (il ! davanti significa "non"), divise in giornaliere e mensili
  const upcomingTasks = myTasks.filter(
    (task) => !isSameDay(task.dueDate, new Date()),
  );
  const nextDaysTasks = upcomingTasks.filter((task) => task.type === "daily");
  const monthlyTasks = upcomingTasks.filter((task) => task.type === "monthly");

  // le tre sezioni in un array, così il JSX le disegna con una map invece di ripeterlo tre volte
  const sections = [
    { title: "Oggi", tasks: todayTasks },
    { title: "Prossimi giorni", tasks: nextDaysTasks },
    { title: "Questo mese", tasks: monthlyTasks },
  ];

  return (
    <Container fluid>
      <PageHeader
        title="Le mie task"
        subtitle={
          <>
            {storeName && <span className="text-nowrap">{storeName} ·</span>}{" "}
            <span className="text-nowrap">
              {doneTodayTasks.length} su {todayTasks.length} completate oggi
            </span>
          </>
        }
        error={error}
      >
        {/* la barra va a destra del titolo, dentro PageHeader */}
        <ProgressBar percent={percent} className="my-tasks-progress" />
      </PageHeader>
      {myTasks.length === 0 && !error && (
        <Message>Nessuna task in programma</Message>
      )}
      {/* filter toglie le sezioni vuote, così non compare un titolo senza task sotto */}
      {sections
        .filter((section) => section.tasks.length > 0)
        .map((section) => (
          <Row as="section" key={section.title} className="mb-4">
            <Col className="my-tasks-list">
              <h2 className="section-label">{section.title}</h2>
              {section.tasks.map((task) => (
                <MyTaskCard key={task._id} task={task} onToggle={toggleTask} />
              ))}
            </Col>
          </Row>
        ))}
    </Container>
  );
};

export default MyTasks;
