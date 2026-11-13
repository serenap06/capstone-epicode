import "./myTasks.css";
import api from "../../../api/api";

import { useState, useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";

import { getToday, isSameDay } from "../../../utils/dates";
import MyTaskCard from "../../../components/ui/myTaskCard/MyTaskCard";

const MyTasks = () => {
  const [myTasks, setMyTasks] = useState([]);
  const [error, setError] = useState("");
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    const loadStore = async () => {
      try {
        const data = await api("/users/me");
        setStoreName(data.user.store?.name ?? "");
      } catch (e) {
        setError(e.message);
      }
    };
    const loadTasks = async () => {
      try {
        const data = await api(`/tasks/mine?from=${getToday().from}`);
        setMyTasks(data.tasks);
      } catch (e) {
        setError(e.message);
      }
    };
    loadStore();
    loadTasks();
  }, []);

  const todayTasks = myTasks.filter((task) =>
    isSameDay(task.dueDate, new Date()),
  );
  const doneTodayTasks = todayTasks.filter((task) => task.status === "done");
  const percent = todayTasks.length
    ? Math.round((doneTodayTasks.length / todayTasks.length) * 100)
    : 0;

  return (
    <Container fluid>
      <Row className="align-items-end g-3 mb-4">
        <Col>
          <h1 className="page-title">Le mie task</h1>
          <p className="page-subtitle">
            {storeName && <span className="text-nowrap">{storeName} ·</span>}{" "}
            <span className="text-nowrap">
              {doneTodayTasks.length} su {todayTasks.length} completate oggi
            </span>
          </p>
          {error && <p role="alert">{error}</p>}
        </Col>
        <Col xs={12} md="auto">
          <div className="progress-track my-tasks-progress" aria-hidden="true">
            <div
              className="progress-fill"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col className="my-tasks-list">
          {myTasks.map((task) => (
            <MyTaskCard key={task._id} task={task} />
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default MyTasks;
