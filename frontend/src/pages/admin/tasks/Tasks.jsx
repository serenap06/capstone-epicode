import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import { useIsPhone } from "../../../hooks/useIsPhone";
import { loadData } from "../../../api/loadData";
import { deleteTaskGroup } from "../../../api/tasks";
import { addDays, getToday, isSameDay } from "../../../utils/dates";
import { formatDayLabel } from "../../../utils/formatDayLabel";
import { isTaskDone } from "../../../utils/isTaskDone";
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
import TaskCard from "../../../components/tasks/taskCard/TaskCard";
import TaskForm from "../../../components/tasks/taskForm/TaskForm";

// pagina Task del responsabile: le task da oggi in avanti, con i filtri

// opzioni fisse dei filtri (fuori dal componente perché non cambiano)
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

const TYPE_OPTIONS = [
  { value: "daily", label: "Giornaliere" },
  { value: "monthly", label: "Mensili" },
];

const Tasks = () => {
  // tasks: dal server già raggruppate (una per gruppo, con le persone dentro)
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  // true finché i dati non arrivano la prima volta: intanto gira la rotellina
  const [isLoading, setIsLoading] = useState(true);

  // stores: i negozi, per i menu a tendina
  const [stores, setStores] = useState([]);

  // employees: i dipendenti, per assegnare le task nuove
  const [employees, setEmployees] = useState([]);

  // showForm: true con il modale "Nuova task" aperto
  const [showForm, setShowForm] = useState(false);

  // refreshCount: aumentarlo fa ripartire lo useEffect delle task (ricarica la lista)
  const [refreshCount, setRefreshCount] = useState(0);

  // filters: tutti i filtri; "" = nessun filtro
  const [filters, setFilters] = useState({
    due: "",
    status: "",
    store: "",
    type: "",
  });

  // taskToDelete: la task da eliminare, oppure null (conferma chiusa)
  const [taskToDelete, setTaskToDelete] = useState(null);

  // isDeleting: true mentre aspetto il server
  const [isDeleting, setIsDeleting] = useState(false);

  // su telefono (fino a 767px): "+" accanto al titolo, Stato in vista
  // e gli altri filtri nel menu "Filtri"
  const isPhone = useIsPhone();

  useEffect(() => {
    // negozi e dipendenti una volta sola (da /users tengo solo i dipendenti)
    loadData("/stores", (data) => setStores(data.stores), setError);
    loadData(
      "/users",
      (data) =>
        setEmployees(data.users.filter((user) => user.role === "employee")),
      setError,
    );
  }, []);

  useEffect(() => {
    // negozio e tipo li filtra il server (toQuery salta i vuoti);
    // si ricarica anche quando cambia refreshCount
    const query = toQuery({
      from: getToday().from,
      store: filters.store,
      type: filters.type,
    });
    loadData(
      `/tasks?${query}`,
      (data) => setTasks(data.tasks),
      setError,
    ).finally(() => setIsLoading(false));
  }, [filters.store, filters.type, refreshCount]);

  // task ancora aperte, per il sottotitolo
  const openTaskCount = tasks.filter((task) => !isTaskDone(task)).length;

  // cambia un filtro: copio gli altri e sovrascrivo quello ([name] usa il valore come chiave)
  const changeFilter = (name, value) =>
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));

  // "Nuova task": modale con il modulo vuoto
  const openNewForm = () => setShowForm(true);

  // dopo il salvataggio chiudo il modale e ricarico (servono le task raggruppate)
  const handleSaved = () => {
    setShowForm(false);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // elimino sul server e tolgo la task dalla lista; finally chiude sempre la conferma
  const confirmDelete = async () => {
    setIsDeleting(true);
    setError("");
    try {
      await deleteTaskGroup(taskToDelete._id);
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== taskToDelete._id),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
    }
  };

  // filtri attivi, per il pallino su "Filtri"
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;
  // su telefono il pallino di "Filtri" conta solo quelli dentro il menu (non lo Stato)
  const menuFilterCount = [filters.due, filters.store, filters.type].filter(
    (value) => value !== "",
  ).length;

  // negozi nel formato { value, label } di FilterSelect
  const storeOptions = toStoreOptions(stores);

  // scadenza: oggi, domani o tutte
  const matchesDue = (task) => {
    if (filters.due === "today") return isSameDay(task.dueDate, new Date());
    if (filters.due === "tomorrow") {
      return isSameDay(task.dueDate, addDays(new Date(), 1));
    }
    return true;
  };

  // lo stato lo filtro qui: per il responsabile una task è fatta solo quando l'hanno finita tutti.
  // Cambiare stato non fa richieste al server
  const matchesStatus = (task) => {
    if (filters.status === "done") return isTaskDone(task);
    if (filters.status === "pending") return !isTaskDone(task);
    return true;
  };

  const visibleTasks = tasks.filter(
    (task) => matchesDue(task) && matchesStatus(task),
  );

  // i giorni con almeno una task, senza doppioni e già in ordine di scadenza
  const dayKeys = [
    ...new Set(
      visibleTasks.map((task) => new Date(task.dueDate).toDateString()),
    ),
  ];
  // per ogni giorno le sue task (le tonde servono a restituire un oggetto)
  const sections = dayKeys.map((dayKey) => ({
    day: dayKey,
    tasks: visibleTasks.filter((task) => isSameDay(task.dueDate, dayKey)),
  }));

  // i quattro filtri scritti una volta: sul computer stanno tutti in riga,
  // su telefono lo Stato resta in vista e gli altri tre vanno nel menu "Filtri"
  const dueFilter = (
    <FilterChips
      label="Scadenza"
      options={DUE_OPTIONS}
      value={filters.due}
      onChange={(value) => changeFilter("due", value)}
    />
  );

  const statusFilter = (
    <FilterChips
      label="Stato"
      options={STATUS_OPTIONS}
      value={filters.status}
      onChange={(value) => changeFilter("status", value)}
    />
  );

  const storeFilter = (
    <FilterSelect
      label="Negozio"
      allLabel="Tutti i negozi"
      options={storeOptions}
      value={filters.store}
      onChange={(value) => changeFilter("store", value)}
    />
  );

  const typeFilter = (
    <FilterSelect
      label="Tipo"
      allLabel="Ogni tipo"
      options={TYPE_OPTIONS}
      value={filters.type}
      onChange={(value) => changeFilter("type", value)}
    />
  );

  // "Nuova task": su telefono solo il "+" accanto al titolo, da tablet in su con il testo
  const addButton = (
    <AddButton label="Nuova task" iconOnly={isPhone} onClick={openNewForm} />
  );

  return (
    <Container fluid>
      {/* su telefono il menu "Filtri" (Scadenza, Negozio, Tipo) sta a destra di "in corso" */}
      <PageHeader
        title="Task"
        titleAside={isPhone && addButton}
        subtitle={`${openTaskCount} in corso`}
        subtitleAside={
          isPhone && (
            <FilterBar compact activeCount={menuFilterCount}>
              {dueFilter}
              {storeFilter}
              {typeFilter}
            </FilterBar>
          )
        }
        error={error}
      >
        {/* da tablet in su il bottone va a destra dell'intestazione */}
        {!isPhone && addButton}
      </PageHeader>
      {/* su telefono in vista solo lo Stato; da tablet in su tutti i filtri in riga */}
      {isPhone ? (
        <FilterBar>{statusFilter}</FilterBar>
      ) : (
        <FilterBar>
          {dueFilter}
          {statusFilter}
          {storeFilter}
          {typeFilter}
        </FilterBar>
      )}
      {isLoading && <Loader />}
      {!isLoading && visibleTasks.length === 0 && !error && (
        <Message>
          {activeFilterCount > 0
            ? "Nessuna task con questi filtri"
            : "Nessuna task in programma"}
        </Message>
      )}
      {/* una sezione per giorno: "Oggi", "Domani" o la data */}
      {sections.map((section) => (
        <Row as="section" key={section.day} className="mb-4">
          <Col className="d-flex flex-column gap-3">
            <h2 className="section-label">{formatDayLabel(section.day)}</h2>
            {section.tasks.map((task) => (
              <TaskCard key={task._id} task={task} onDelete={setTaskToDelete} />
            ))}
          </Col>
        </Row>
      ))}

      {/* modale "Nuova task": chiudendolo il modulo sparisce, così si riapre vuoto */}
      <FormModal
        wide
        show={showForm}
        title="Nuova task"
        onClose={() => setShowForm(false)}
      >
        <TaskForm
          stores={stores}
          employees={employees}
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      </FormModal>

      {/* !! trasforma taskToDelete in true/false; ?. perché a modale chiuso è null */}
      <ConfirmDialog
        show={!!taskToDelete}
        title="Eliminare la task?"
        message={`"${taskToDelete?.title}" verrà eliminata. Non si può annullare.`}
        confirmLabel="Elimina"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </Container>
  );
};

export default Tasks;
