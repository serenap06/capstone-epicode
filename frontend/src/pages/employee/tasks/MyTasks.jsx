// import
import "./myTasks.css";
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import { useAuth } from "../../../hooks/useAuth";
import { useIsPhone } from "../../../hooks/useIsPhone";
import { loadData } from "../../../api/loadData";
import { replaceTask, toggleTaskStatus } from "../../../api/tasks";
import { isSameDay } from "../../../utils/dates";
import { formatDayLabel } from "../../../utils/formatDayLabel";
import { getPercent } from "../../../utils/getPercent";
import {
  formatPeriod,
  getPeriodRange,
  movePeriodDate,
  PERIOD_NAV_LABELS,
  PERIOD_OPTIONS,
} from "../../../utils/periods";
import { toQuery } from "../../../utils/toQuery";

import FilterBar from "../../../components/common/filterBar/FilterBar";
import FilterChips from "../../../components/common/filterBar/FilterChips";
import FilterSelect from "../../../components/common/filterBar/FilterSelect";
import Loader from "../../../components/common/loader/Loader";
import Message from "../../../components/common/message/Message";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import ProgressBar from "../../../components/common/progressBar/ProgressBar";
import WeekNav from "../../../components/common/weekNav/WeekNav";
import MyTaskCard from "../../../components/tasks/myTaskCard/MyTaskCard";

// opzioni fisse dei filtri
const STATUS_OPTIONS = [
  { value: "", label: "Tutte" },
  { value: "pending", label: "Da fare" },
  { value: "done", label: "Fatte" },
];

const TYPE_OPTIONS = [
  { value: "daily", label: "Giornaliere" },
  { value: "monthly", label: "Mensili" },
];

// componente MyTasks: le mie task di un giorno, una settimana o un mese (anche passati), con filtri
const MyTasks = () => {
  // utente collegato
  const { user } = useAuth();
  // tutte le mie task del periodo (stato e tipo li filtro qui)
  const [myTasks, setMyTasks] = useState([]);
  const [error, setError] = useState("");
  // true fino ai primi dati: gira la rotellina
  const [isLoading, setIsLoading] = useState(true);

  // filtri: periodo (di base oggi) e gli altri ("" = nessuno)
  const [filters, setFilters] = useState({
    period: "day",
    status: "",
    type: "",
  });
  // un giorno del periodo mostrato (le frecce e il calendario lo spostano)
  const [referenceDate, setReferenceDate] = useState(new Date());

  // su telefono lo Stato in vista e gli altri filtri nel menu
  const isPhone = useIsPhone();

  // il mio negozio
  const storeName = user.store?.name ?? "";

  // inizio e fine del periodo mostrato, per il server
  const range = getPeriodRange(filters.period, referenceDate);
  const from = range.start.toISOString();
  const to = range.end.toISOString();

  // prendo le task del periodo a ogni cambio di periodo
  useEffect(() => {
    // ignore: true se parte una richiesta più nuova (la risposta vecchia la scarto)
    let ignore = false;
    loadData(
      `/tasks/mine?${toQuery({ from, to })}`,
      (data) => {
        if (!ignore) setMyTasks(data.tasks);
      },
      setError,
    ).finally(() => setIsLoading(false));
    // pulizia: React la chiama prima di rifare l'effetto
    return () => {
      ignore = true;
    };
  }, [from, to]);

  // "Segna come fatto" e "Annulla": aggiorno la task nella lista
  const toggleTask = async (task) => {
    try {
      const updatedTask = await toggleTaskStatus(task);
      setMyTasks((prevTasks) => replaceTask(prevTasks, updatedTask));
    } catch (e) {
      setError(e.message);
    }
  };

  // cambio un filtro
  const changeFilter = (name, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // frecce: sposto il periodo
  const moveReference = (step) => {
    setReferenceDate((prevDate) =>
      movePeriodDate(filters.period, prevDate, step),
    );
  };

  // fatte e percentuale del periodo (contano tutte, anche con i filtri)
  const doneTasks = myTasks.filter((task) => task.status === "done");
  const percent = getPercent(doneTasks.length, myTasks.length);

  // task da mostrare: stato e tipo scelti
  const visibleTasks = myTasks.filter(
    (task) =>
      (filters.status === "" || task.status === filters.status) &&
      (filters.type === "" || task.type === filters.type),
  );

  // giorni con almeno una task, senza doppioni (già in ordine)
  const dayKeys = [
    ...new Set(
      visibleTasks.map((task) => new Date(task.dueDate).toDateString()),
    ),
  ];
  // per ogni giorno le sue task
  const sections = dayKeys.map((dayKey) => ({
    day: dayKey,
    tasks: visibleTasks.filter((task) => isSameDay(task.dueDate, dayKey)),
  }));

  // filtri attivi (il periodo no), per il messaggio
  const activeFilterCount = [filters.status, filters.type].filter(
    (value) => value !== "",
  ).length;

  // true se è il periodo in corso (spegne "Oggi", "Questa settimana"...)
  const isCurrentPeriod =
    getPeriodRange(filters.period, new Date()).start.getTime() ===
    range.start.getTime();
  // scritte delle frecce per il periodo
  const [previousLabel, nextLabel, todayLabel] =
    PERIOD_NAV_LABELS[filters.period];

  // i tre filtri, scritti una volta (in riga da tablet, nel menu su telefono)
  const periodFilter = (
    <FilterChips
      label="Periodo"
      options={PERIOD_OPTIONS}
      value={filters.period}
      onChange={(value) => changeFilter("period", value)} // nuovo periodo
    />
  );

  // stato
  const statusFilter = (
    <FilterChips
      label="Stato"
      options={STATUS_OPTIONS}
      value={filters.status}
      onChange={(value) => changeFilter("status", value)} // nuovo stato
    />
  );

  // tipo
  const typeFilter = (
    <FilterSelect
      label="Tipo"
      allLabel="Ogni tipo"
      options={TYPE_OPTIONS}
      value={filters.type}
      onChange={(value) => changeFilter("type", value)} // nuovo tipo
    />
  );

  return (
    <Container fluid>
      <PageHeader
        title="Le mie task"
        subtitle={
          <>
            {storeName && <span className="text-nowrap">{storeName} ·</span>}{" "}
            <span className="text-nowrap">
              {formatPeriod(filters.period, range)} ·
            </span>{" "}
            <span className="text-nowrap">
              {doneTasks.length} su {myTasks.length} completate
            </span>
          </>
        }
        error={error}
      >
        {/* frecce e calendario, sotto la barra delle completate */}
        <div className="my-tasks-header-tools">
          <WeekNav
            onPrevious={() => moveReference(-1)} // periodo prima
            onNext={() => moveReference(1)} // periodo dopo
            onToday={() => setReferenceDate(new Date())} // periodo in corso
            isCurrentWeek={isCurrentPeriod}
            previousLabel={previousLabel}
            nextLabel={nextLabel}
            todayLabel={todayLabel}
            onPickDate={setReferenceDate} // giorno dal calendario
            selectedDate={referenceDate}
            period={filters.period}
          />
          <ProgressBar percent={percent} className="my-tasks-progress" />
        </div>
      </PageHeader>
      {/* telefono: lo Stato e accanto "Filtri"; da tablet tutto in riga */}
      {isPhone ? (
        <FilterBar>
          <div className="filter-row">
            {statusFilter}
            <FilterBar
              compact
              activeCount={
                [filters.type].filter((value) => value !== "").length
              }
            >
              {periodFilter}
              {typeFilter}
            </FilterBar>
          </div>
        </FilterBar>
      ) : (
        <FilterBar>
          {periodFilter}
          {statusFilter}
          {typeFilter}
        </FilterBar>
      )}
      {isLoading && <Loader />}
      {!isLoading && visibleTasks.length === 0 && !error && (
        <Message>
          {activeFilterCount > 0
            ? "Nessuna task con questi filtri"
            : "Nessuna task in questo periodo"}
        </Message>
      )}
      {/* una sezione per giorno ("Oggi", "Domani", "Ieri" o la data) */}
      {sections.map((section) => (
        <Row as="section" key={section.day} className="mb-4">
          <Col className="my-tasks-list">
            <h2 className="section-label">{formatDayLabel(section.day)}</h2>
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
