// import
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";

import { useIsPhone } from "../../../hooks/useIsPhone";
import { useShowCards } from "../../../hooks/useShowCards";
import { loadData } from "../../../api/loadData";
import { deleteTaskGroup } from "../../../api/tasks";
import { isSameDay } from "../../../utils/dates";
import { formatDayLabel } from "../../../utils/formatDayLabel";
import { getNextSort } from "../../../utils/getNextSort";
import { getOptionParam } from "../../../utils/getOptionParam";
import { PAGE_SIZE } from "../../../utils/pageSize";
import {
  formatPeriod,
  getPeriodRange,
  movePeriodDate,
  PERIOD_NAV_LABELS,
  PERIOD_OPTIONS,
} from "../../../utils/periods";
import { toQuery } from "../../../utils/toQuery";
import { toStoreOptions } from "../../../utils/toStoreOptions";

import AddButton from "../../../components/common/addButton/AddButton";
import ConfirmDialog from "../../../components/common/confirmDialog/ConfirmDialog";
import FilterBar from "../../../components/common/filterBar/FilterBar";
import FilterChips from "../../../components/common/filterBar/FilterChips";
import FilterSelect from "../../../components/common/filterBar/FilterSelect";
import FormModal from "../../../components/common/formModal/FormModal";
import Loader from "../../../components/common/loader/Loader";
import Message from "../../../components/common/message/Message";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import Pagination from "../../../components/common/pagination/Pagination";
import TaskCard from "../../../components/tasks/taskCard/TaskCard";
import TaskForm from "../../../components/tasks/taskForm/TaskForm";
import TaskTable from "../../../components/tasks/taskTable/TaskTable";
import WeekNav from "../../../components/common/weekNav/WeekNav";

// opzioni fisse dei filtri
const STATUS_OPTIONS = [
  { value: "", label: "Tutte" },
  { value: "pending", label: "Da fare" },
  { value: "done", label: "Fatte" },
];

// ordine di partenza: per ora, dalla prima (sempre dentro il giorno)
const DEFAULT_SORT = { field: "time", direction: "asc" };

const TYPE_OPTIONS = [
  { value: "daily", label: "Giornaliere" },
  { value: "monthly", label: "Mensili" },
];

// componente Tasks: le task di un giorno, una settimana o un mese (anche passati), con filtri e pagine (le fa il server)
const Tasks = () => {
  // una pagina di task raggruppate, quante in corso e le pagine
  const [tasks, setTasks] = useState([]);
  const [openCount, setOpenCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  // true fino ai primi dati: gira la rotellina
  const [isLoading, setIsLoading] = useState(true);

  // negozi, per i menu
  const [stores, setStores] = useState([]);

  // dipendenti, per assegnare le task
  const [employees, setEmployees] = useState([]);

  // modale "Nuova task" aperto
  const [showForm, setShowForm] = useState(false);

  // aumentarlo ricarica le task
  const [refreshCount, setRefreshCount] = useState(0);

  // filtri: periodo (di base oggi) e gli altri ("" = nessuno)
  // filtri di partenza dall'indirizzo: dalla Dashboard "?period=day&status=pending" apre quelle di oggi da fare
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    period: getOptionParam(searchParams, "period", PERIOD_OPTIONS) || "day",
    status: getOptionParam(searchParams, "status", STATUS_OPTIONS),
    store: "",
    type: "",
  });
  // un giorno del periodo mostrato (le frecce e il calendario lo spostano)
  const [referenceDate, setReferenceDate] = useState(new Date());
  // ordine scelto dalle intestazioni della tabella (lo applica il server)
  const [sort, setSort] = useState(DEFAULT_SORT);

  // la task da eliminare (null = conferma chiusa)
  const [taskToDelete, setTaskToDelete] = useState(null);

  // true mentre aspetto il server
  const [isDeleting, setIsDeleting] = useState(false);

  // su telefono il "+" accanto al titolo e i filtri nel menu (tranne lo Stato)
  const isPhone = useIsPhone();
  // fino a 1366px le card, sopra la tabella
  const showCards = useShowCards();

  // inizio e fine del periodo mostrato, per il server
  const range = getPeriodRange(filters.period, referenceDate);
  const from = range.start.toISOString();
  const to = range.end.toISOString();

  // prendo negozi e dipendenti una volta sola
  useEffect(() => {
    // da /users tengo solo i dipendenti
    loadData("/stores", (data) => setStores(data.stores), setError);
    loadData(
      "/users",
      (data) =>
        setEmployees(data.users.filter((user) => user.role === "employee")),
      setError,
    );
  }, []);

  // prendo una pagina di task a ogni cambio di periodo, filtri o pagina e al refreshCount
  useEffect(() => {
    // ignore: true se parte una richiesta più nuova (la risposta vecchia la scarto)
    let ignore = false;
    // i filtri li applica il server; "Fatte" = l'hanno finita tutti
    const query = toQuery({
      from,
      to,
      status: filters.status,
      store: filters.store,
      type: filters.type,
      sortBy: sort.field,
      order: sort.direction,
      page,
      limit: PAGE_SIZE,
    });
    loadData(
      `/tasks?${query}`,
      (data) => {
        if (ignore) return;
        setTasks(data.tasks);
        setOpenCount(data.totals.openCount);
        setTotalPages(data.pagination.totalPages);
        // dopo un'eliminazione l'ultima pagina può sparire: torno all'ultima
        if (
          page > data.pagination.totalPages &&
          data.pagination.totalPages > 0
        ) {
          setPage(data.pagination.totalPages);
        }
      },
      setError,
    ).finally(() => setIsLoading(false));
    // pulizia: React la chiama prima di rifare l'effetto
    return () => {
      ignore = true;
    };
  }, [from, to, filters, sort, page, refreshCount]);

  // cambio un filtro e torno alla pagina 1
  const changeFilter = (name, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    setPage(1);
  };

  // frecce: sposto il periodo e torno alla pagina 1
  const moveReference = (step) => {
    setReferenceDate((prevDate) =>
      movePeriodDate(filters.period, prevDate, step),
    );
    setPage(1);
  };
  // clic su un'intestazione della tabella: nuovo ordine e pagina 1
  const sortByColumn = (field) => {
    setSort((prevSort) => getNextSort(prevSort, field));
    setPage(1);
  };

  // giorno scelto dal calendario (o oggi): vado al suo periodo
  const pickDate = (date) => {
    setReferenceDate(date);
    setPage(1);
  };

  // "Nuova task": modulo vuoto
  const openNewForm = () => setShowForm(true);

  // salvata: chiudo e ricarico
  const handleSaved = () => {
    setShowForm(false);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // elimino la task per tutti e ricarico; finally chiude la conferma
  const confirmDelete = async () => {
    setIsDeleting(true);
    setError("");
    try {
      await deleteTaskGroup(taskToDelete._id);
      setRefreshCount((prevCount) => prevCount + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
    }
  };

  // filtri attivi (il periodo no), per il messaggio
  const activeFilterCount = [
    filters.status,
    filters.store,
    filters.type,
  ].filter((value) => value !== "").length;
  // su telefono il pallino conta solo negozio e tipo (il periodo è nel sottotitolo)
  const menuFilterCount = [filters.store, filters.type].filter(
    (value) => value !== "",
  ).length;

  // true se è il periodo in corso (spegne "Oggi", "Questa settimana"...)
  const isCurrentPeriod =
    getPeriodRange(filters.period, new Date()).start.getTime() ===
    range.start.getTime();
  // scritte delle frecce per il periodo
  const [previousLabel, nextLabel, todayLabel] =
    PERIOD_NAV_LABELS[filters.period];

  // negozi per FilterSelect
  const storeOptions = toStoreOptions(stores);

  // giorni con almeno una task, senza doppioni (già in ordine)
  const dayKeys = [
    ...new Set(tasks.map((task) => new Date(task.dueDate).toDateString())),
  ];
  // per ogni giorno le sue task
  const sections = dayKeys.map((dayKey) => ({
    day: dayKey,
    tasks: tasks.filter((task) => isSameDay(task.dueDate, dayKey)),
  }));

  // i quattro filtri, scritti una volta (in riga da tablet, nel menu su telefono)
  const periodFilter = (
    <FilterChips
      label="Periodo"
      options={PERIOD_OPTIONS}
      value={filters.period}
      onChange={(value) => changeFilter("period", value)} // nuovo periodo: pagina 1
    />
  );

  // stato
  const statusFilter = (
    <FilterChips
      label="Stato"
      options={STATUS_OPTIONS}
      value={filters.status}
      onChange={(value) => changeFilter("status", value)} // nuovo stato: pagina 1
    />
  );

  // negozio
  const storeFilter = (
    <FilterSelect
      label="Negozio"
      allLabel="Tutti i negozi"
      options={storeOptions}
      value={filters.store}
      onChange={(value) => changeFilter("store", value)} // nuovo negozio: pagina 1
    />
  );

  // tipo
  const typeFilter = (
    <FilterSelect
      label="Tipo"
      allLabel="Ogni tipo"
      options={TYPE_OPTIONS}
      value={filters.type}
      onChange={(value) => changeFilter("type", value)} // nuovo tipo: pagina 1
    />
  );

  // "Nuova task": su telefono solo il "+"
  const addButton = (
    <AddButton label="Nuova task" iconOnly={isPhone} onClick={openNewForm} />
  );

  // frecce, bottone "in corso" e calendario
  const weekNav = (
    <WeekNav
      onPrevious={() => moveReference(-1)} // periodo prima
      onNext={() => moveReference(1)} // periodo dopo
      onToday={() => pickDate(new Date())} // periodo in corso
      isCurrentWeek={isCurrentPeriod}
      previousLabel={previousLabel}
      nextLabel={nextLabel}
      todayLabel={todayLabel}
      onPickDate={pickDate} // giorno dal calendario
      selectedDate={referenceDate}
      period={filters.period}
    />
  );

  return (
    <Container fluid>
      <PageHeader
        title="Task"
        titleAside={isPhone && addButton}
        subtitle={`${formatPeriod(filters.period, range)} · ${openCount} da fare`}
        error={error}
      >
        {/* frecce e calendario; da tablet accanto "Nuova task" */}
        {isPhone ? (
          weekNav
        ) : (
          <div className="d-flex gap-2">
            {weekNav}
            {addButton}
          </div>
        )}
      </PageHeader>
      {/* telefono: lo Stato e accanto "Filtri"; da tablet tutto in riga */}
      {isPhone ? (
        <FilterBar>
          <div className="filter-row">
            {statusFilter}
            <FilterBar compact activeCount={menuFilterCount}>
              {periodFilter}
              {storeFilter}
              {typeFilter}
            </FilterBar>
          </div>
        </FilterBar>
      ) : (
        <FilterBar>
          {periodFilter}
          {statusFilter}
          {storeFilter}
          {typeFilter}
        </FilterBar>
      )}
      {isLoading && <Loader />}
      {!isLoading && tasks.length === 0 && !error && (
        <Message>
          {activeFilterCount > 0
            ? "Nessuna task con questi filtri"
            : "Nessuna task in questo periodo"}
        </Message>
      )}
      {/* una sezione per giorno ("Oggi", "Domani", "Ieri" o la data):
          fino a 1366px le card (due per riga, una sola su telefono), sopra la tabella */}
      {sections.map((section) => (
        <section key={section.day} className="mb-4">
          <h2 className="section-label mb-3">{formatDayLabel(section.day)}</h2>
          {showCards ? (
            <Row xs={1} md={2} className="g-3">
              {section.tasks.map((task) => (
                <Col key={task._id}>
                  {/* passo la task alla card; il cestino chiede conferma */}
                  <TaskCard task={task} onDelete={setTaskToDelete} />
                </Col>
              ))}
            </Row>
          ) : (
            <TaskTable
              tasks={section.tasks} // le task del giorno
              sort={sort}
              onSort={sortByColumn} // clic su un'intestazione
              onDelete={setTaskToDelete} // il cestino chiede conferma
            />
          )}
        </section>
      ))}

      {/* le pagine, solo se sono più di una */}
      <Pagination
        page={page}
        totalPages={totalPages}
        label="Pagine delle task"
        onChange={setPage}
      />

      {/* modale "Nuova task" (chiudendolo il modulo si svuota) */}
      <FormModal
        wide
        show={showForm}
        title="Nuova task"
        onClose={() => setShowForm(false)}
      >
        <TaskForm
          stores={stores} // i negozi per il menu
          employees={employees} // i dipendenti da spuntare
          onSaved={handleSaved} // chiudo e ricarico
          onCancel={() => setShowForm(false)}
        />
      </FormModal>

      {/* conferma: !! = true/false, ?. perché a modale chiuso è null */}
      <ConfirmDialog
        show={!!taskToDelete}
        title="Eliminare la task?"
        message={`"${taskToDelete?.title}" verrà eliminata. Non si può annullare.`}
        confirmLabel="Elimina"
        isLoading={isDeleting} // spento mentre aspetto il server
        onConfirm={confirmDelete} // elimino la task per tutti
        onCancel={() => setTaskToDelete(null)}
      />
    </Container>
  );
};

export default Tasks;
