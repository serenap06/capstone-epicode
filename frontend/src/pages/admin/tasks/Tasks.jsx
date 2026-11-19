// import
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import { useIsPhone } from "../../../hooks/useIsPhone";
import { loadData } from "../../../api/loadData";
import { deleteTaskGroup } from "../../../api/tasks";
import { getToday, getTomorrow, isSameDay } from "../../../utils/dates";
import { formatDayLabel } from "../../../utils/formatDayLabel";
import { PAGE_SIZE } from "../../../utils/pageSize";
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

// opzioni fisse dei filtri
const DUE_OPTIONS = [
  { value: "", label: "Tutte" },
  { value: "today", label: "Oggi" },
  { value: "tomorrow", label: "Domani" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Tutte" },
  { value: "pending", label: "Da fare" },
  { value: "done", label: "Fatte" },
];

// periodo da chiedere per ogni scadenza: tutte (da oggi in poi), oggi, domani
const DUE_RANGES = {
  "": () => ({ from: getToday().from }),
  today: getToday,
  tomorrow: getTomorrow,
};

const TYPE_OPTIONS = [
  { value: "daily", label: "Giornaliere" },
  { value: "monthly", label: "Mensili" },
];

// componente Tasks: le task da oggi in poi, con filtri e pagine (le fa il server)
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

  // filtri ("" = nessuno)
  const [filters, setFilters] = useState({
    due: "",
    status: "",
    store: "",
    type: "",
  });

  // la task da eliminare (null = conferma chiusa)
  const [taskToDelete, setTaskToDelete] = useState(null);

  // true mentre aspetto il server
  const [isDeleting, setIsDeleting] = useState(false);

  // su telefono il "+" accanto al titolo e i filtri nel menu (tranne lo Stato)
  const isPhone = useIsPhone();

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

  // prendo una pagina di task a ogni cambio di filtri o pagina e al refreshCount
  useEffect(() => {
    // ignore: true se parte una richiesta più nuova (la risposta vecchia la scarto)
    let ignore = false;
    // i filtri li applica il server; "Fatte" = l'hanno finita tutti
    const query = toQuery({
      ...DUE_RANGES[filters.due](),
      status: filters.status,
      store: filters.store,
      type: filters.type,
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
  }, [filters, page, refreshCount]);

  // cambio un filtro e torno alla pagina 1
  const changeFilter = (name, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
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

  // filtri attivi, per il messaggio
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;
  // su telefono il pallino conta solo i filtri del menu
  const menuFilterCount = [filters.due, filters.store, filters.type].filter(
    (value) => value !== "",
  ).length;

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
  const dueFilter = (
    <FilterChips
      label="Scadenza"
      options={DUE_OPTIONS}
      value={filters.due}
      onChange={(value) => changeFilter("due", value)} // nuova scadenza: pagina 1
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

  return (
    <Container fluid>
      <PageHeader
        title="Task"
        titleAside={isPhone && addButton}
        subtitle={`${openCount} in corso`}
        error={error}
      >
        {/* da tablet il bottone a destra */}
        {!isPhone && addButton}
      </PageHeader>
      {/* telefono: lo Stato e accanto "Filtri"; da tablet tutto in riga */}
      {isPhone ? (
        <FilterBar>
          <div className="filter-row">
            {statusFilter}
            <FilterBar compact activeCount={menuFilterCount}>
              {dueFilter}
              {storeFilter}
              {typeFilter}
            </FilterBar>
          </div>
        </FilterBar>
      ) : (
        <FilterBar>
          {dueFilter}
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
            : "Nessuna task in programma"}
        </Message>
      )}
      {/* una sezione per giorno ("Oggi", "Domani" o la data); due card per riga da 1200px */}
      {sections.map((section) => (
        <section key={section.day} className="mb-4">
          <h2 className="section-label mb-3">{formatDayLabel(section.day)}</h2>
          <Row xs={1} xl={2} className="g-3">
            {section.tasks.map((task) => (
              <Col key={task._id}>
                {/* passo la task alla card; il cestino chiede conferma */}
                <TaskCard task={task} onDelete={setTaskToDelete} />
              </Col>
            ))}
          </Row>
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
