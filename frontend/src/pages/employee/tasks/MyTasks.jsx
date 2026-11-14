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

const MyTasks = () => {
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState([]);
  const [error, setError] = useState("");

  const storeName = user.store?.name ?? "";

  useEffect(() => {
    loadData(
      `/tasks/mine?from=${getToday().from}`,
      (data) => setMyTasks(data.tasks),
      setError,
    );
  }, []);

  const toggleTask = async (task) => {
    try {
      const updatedTask = await toggleTaskStatus(task);
      setMyTasks((prevTasks) => replaceTask(prevTasks, updatedTask));
    } catch (e) {
      setError(e.message);
    }
  };

  const todayTasks = myTasks.filter((task) =>
    isSameDay(task.dueDate, new Date()),
  );
  const doneTodayTasks = todayTasks.filter((task) => task.status === "done");
  const percent = getPercent(doneTodayTasks.length, todayTasks.length);

  const upcomingTasks = myTasks.filter(
    (task) => !isSameDay(task.dueDate, new Date()),
  );
  const nextDaysTasks = upcomingTasks.filter((task) => task.type === "daily");
  const monthlyTasks = upcomingTasks.filter((task) => task.type === "monthly");

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
        <ProgressBar percent={percent} className="my-tasks-progress" />
      </PageHeader>
      {myTasks.length === 0 && !error && (
        <Message>Nessuna task in programma</Message>
      )}
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
