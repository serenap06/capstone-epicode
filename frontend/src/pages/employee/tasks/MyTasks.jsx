// import
import "./myTasks.css";
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import { useAuth } from "../../../hooks/useAuth";
import { loadData } from "../../../api/loadData";
import { replaceTask, toggleTaskStatus } from "../../../api/tasks";
import { getToday, isSameDay } from "../../../utils/dates";
import { getPercent } from "../../../utils/getPercent";
import { toQuery } from "../../../utils/toQuery";

import Loader from "../../../components/common/loader/Loader";
import Message from "../../../components/common/message/Message";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import ProgressBar from "../../../components/common/progressBar/ProgressBar";
import MyTaskCard from "../../../components/tasks/myTaskCard/MyTaskCard";

// componente MyTasks: le mie task divise in Oggi, Prossimi giorni e Questo mese
const MyTasks = () => {
  // utente collegato
  const { user } = useAuth();
  // le mie task da oggi in poi (il resto si calcola da qui)
  const [myTasks, setMyTasks] = useState([]);
  const [error, setError] = useState("");
  // true fino ai primi dati: gira la rotellina
  const [isLoading, setIsLoading] = useState(true);

  // il mio negozio
  const storeName = user.store?.name ?? "";

  // prendo le task da oggi in poi all'apertura
  useEffect(() => {
    loadData(
      `/tasks/mine?${toQuery({ from: getToday().from })}`,
      (data) => setMyTasks(data.tasks),
      setError,
    ).finally(() => setIsLoading(false));
  }, []);

  // "Segna come fatto" e "Annulla": aggiorno la task nella lista
  const toggleTask = async (task) => {
    try {
      const updatedTask = await toggleTaskStatus(task);
      setMyTasks((prevTasks) => replaceTask(prevTasks, updatedTask));
    } catch (e) {
      setError(e.message);
    }
  };

  // task di oggi, fatte e percentuale
  const todayTasks = myTasks.filter((task) =>
    isSameDay(task.dueDate, new Date()),
  );
  const doneTodayTasks = todayTasks.filter((task) => task.status === "done");
  const percent = getPercent(doneTodayTasks.length, todayTasks.length);

  // le altre, divise in giornaliere e mensili
  const upcomingTasks = myTasks.filter(
    (task) => !isSameDay(task.dueDate, new Date()),
  );
  const nextDaysTasks = upcomingTasks.filter((task) => task.type === "daily");
  const monthlyTasks = upcomingTasks.filter((task) => task.type === "monthly");

  // le tre sezioni, per disegnarle con una map
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
        {/* la barra a destra del titolo */}
        <ProgressBar percent={percent} className="my-tasks-progress" />
      </PageHeader>
      {isLoading && <Loader />}
      {!isLoading && myTasks.length === 0 && !error && (
        <Message>Nessuna task in programma</Message>
      )}
      {/* niente sezioni vuote */}
      {sections
        .filter((section) => section.tasks.length > 0)
        .map((section) => (
          <Row as="section" key={section.title} className="mb-4">
            <Col className="my-tasks-list">
              <h2 className="section-label">{section.title}</h2>
              {section.tasks.map((task) => (
                // onToggle: fatta / da fare
                <MyTaskCard key={task._id} task={task} onToggle={toggleTask} />
              ))}
            </Col>
          </Row>
        ))}
    </Container>
  );
};

export default MyTasks;
