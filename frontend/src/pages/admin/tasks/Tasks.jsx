import { loadData } from "../../../api/loadData";
import { deleteTaskGroup } from "../../../api/tasks";

import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Plus } from "lucide-react";

import { addDays, getToday, isSameDay, toQuery } from "../../../utils/dates";
import { formatDayLabel } from "../../../utils/formatDayLabel";
import { isTaskDone } from "../../../utils/isTaskDone";
import { useMediaQuery } from "../../../hooks/useMediaQuery";

import Message from "../../../components/common/message/Message";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import TaskCard from "../../../components/tasks/taskCard/TaskCard";
import FilterBar from "../../../components/common/filterBar/FilterBar";
import FilterChips from "../../../components/common/filterBar/FilterChips";
import FilterSelect from "../../../components/common/filterBar/FilterSelect";
import Button from "../../../components/common/button/Button";
import FormModal from "../../../components/common/formModal/FormModal";
import TaskForm from "../../../components/tasks/taskForm/TaskForm";
import ConfirmDialog from "../../../components/common/confirmDialog/ConfirmDialog";

// pagina Task del responsabile: tutte le task da oggi in avanti, con i filtri

// opzioni fisse dei filtri: stanno fuori dal componente perché non cambiano mai.
// value va al codice, label è il testo che si legge
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

// componente della pagina
const Tasks = () => {
  // tasks: le task arrivate dal server, già raggruppate (una per gruppo, con le persone dentro)
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  // stores: i negozi, per il menu a tendina
  const [stores, setStores] = useState([]);

  // employees: i dipendenti, per scegliere a chi assegnare una task nuova
  const [employees, setEmployees] = useState([]);

  // showForm: true quando il modale "Nuova task" è aperto
  const [showForm, setShowForm] = useState(false);

  // refreshCount: un contatore che serve solo a ricaricare la lista.
  // Sta nelle dipendenze dello useEffect delle task: aumentarlo di uno lo fa ripartire
  const [refreshCount, setRefreshCount] = useState(0);

  // filters: tutti i filtri in un oggetto. "" vuol dire nessun filtro
  const [filters, setFilters] = useState({
    due: "",
    status: "",
    store: "",
    type: "",
  });

  // taskToDelete: la task di cui chiedo conferma, oppure null (modale chiuso)
  const [taskToDelete, setTaskToDelete] = useState(null);

  // isDeleting: true mentre aspetto il server
  const [isDeleting, setIsDeleting] = useState(false);

  // true sugli schermi fino a 425px: lì i filtri vanno nel menu "Filtri"
  const isSmallScreen = useMediaQuery("(max-width: 425px)");

  useEffect(() => {
    // negozi e dipendenti li carico una volta sola, all'apertura.
    // /users restituisce tutti gli utenti: tengo solo i dipendenti
    loadData("/stores", (data) => setStores(data.stores), setError);
    loadData(
      "/users",
      (data) =>
        setEmployees(data.users.filter((user) => user.role === "employee")),
      setError,
    );
  }, []);

  useEffect(() => {
    // negozio e tipo li filtra il server: li metto nella richiesta.
    // toQuery salta quelli vuoti. Lo useEffect riparte quando cambia uno dei due,
    // oppure refreshCount (dopo aver creato una task)
    const query = toQuery({
      from: getToday().from,
      store: filters.store,
      type: filters.type,
    });
    loadData(`/tasks?${query}`, (data) => setTasks(data.tasks), setError);
  }, [filters.store, filters.type, refreshCount]);

  // quante task sono ancora aperte, per il sottotitolo
  const openTaskCount = tasks.filter((task) => !isTaskDone(task)).length;

  // cambia un filtro solo: copio gli altri con ...prevFilters e sovrascrivo quello cambiato.
  // [name] con le quadre usa il contenuto di name come chiave: "store" → store: value
  const changeFilter = (name, value) =>
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));

  // dopo la creazione: chiudo il modale e ricarico la lista. Il server risponde con
  // le singole copie, non con la task raggruppata che serve a TaskCard: per questo ricarico
  const handleCreated = () => {
    setShowForm(false);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // conferma dell'eliminazione: elimino sul server e tolgo la task dalla lista con filter.
  // finally chiude il modale sempre, anche se c'è un errore (che compare nell'intestazione)
  const confirmDelete = async () => {
    setIsDeleting(true);
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

  // quanti filtri sono attivi (quelli diversi da ""), per il pallino su "Filtri"
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;

  // i negozi nel formato { value, label } che vuole FilterSelect
  const storeOptions = stores.map((store) => ({
    value: store._id,
    label: store.name,
  }));

  const matchesDue = (task) => {
    if (filters.due === "today") return isSameDay(task.dueDate, new Date());
    if (filters.due === "tomorrow") {
      return isSameDay(task.dueDate, addDays(new Date(), 1));
    }
    return true;
  };

  // lo stato lo filtro qui nel browser e non sul server, perché per il responsabile
  // una task è fatta solo quando l'hanno finita tutti (isTaskDone).
  // Cambiare tra Tutte / Da fare / Fatte non fa richieste: la lista cambia subito
  const matchesStatus = (task) => {
    if (filters.status === "done") return isTaskDone(task);
    if (filters.status === "pending") return !isTaskDone(task);
    return true;
  };

  const visibleTasks = tasks.filter(
    (task) => matchesDue(task) && matchesStatus(task),
  );

  // i giorni che hanno almeno una task, senza doppioni:
  // map trasforma ogni task nel suo giorno scritto come testo, new Set toglie i doppioni.
  // Le task arrivano già in ordine di scadenza, quindi anche i giorni sono in ordine
  const dayKeys = [
    ...new Set(
      visibleTasks.map((task) => new Date(task.dueDate).toDateString()),
    ),
  ];
  // per ogni giorno, le sue task. Le tonde intorno alle graffe servono a restituire un oggetto
  const sections = dayKeys.map((dayKey) => ({
    day: dayKey,
    tasks: visibleTasks.filter((task) => isSameDay(task.dueDate, dayKey)),
  }));

  // i quattro filtri, scritti una volta sola: li uso nella barra su schermi grandi
  // e nel menu "Filtri" su telefono. Ogni filtro chiama changeFilter con il suo nome
  const filterControls = (
    <>
      <FilterChips
        label="Scadenza"
        options={DUE_OPTIONS}
        value={filters.due}
        onChange={(value) => changeFilter("due", value)}
      />
      <FilterChips
        label="Stato"
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(value) => changeFilter("status", value)}
      />
      <FilterSelect
        label="Negozio"
        allLabel="Tutti i negozi"
        options={storeOptions}
        value={filters.store}
        onChange={(value) => changeFilter("store", value)}
      />
      <FilterSelect
        label="Tipo"
        allLabel="Ogni tipo"
        options={TYPE_OPTIONS}
        value={filters.type}
        onChange={(value) => changeFilter("type", value)}
      />
    </>
  );

  return (
    <Container fluid>
      {/* su telefono il menu "Filtri" sta sulla riga di "in corso", a destra */}
      <PageHeader
        title="Task"
        subtitle={`${openTaskCount} in corso`}
        subtitleAside={
          isSmallScreen && (
            <FilterBar compact activeCount={activeFilterCount}>
              {filterControls}
            </FilterBar>
          )
        }
        error={error}
      >
        {/* tra i tag: il bottone va nella colonna di destra dell'intestazione */}
        <Button onClick={() => setShowForm(true)}>
          <Plus size={18} aria-hidden="true" /> Nuova task
        </Button>
      </PageHeader>
      {/* su schermi più grandi i filtri restano in riga sotto l'intestazione */}
      {!isSmallScreen && <FilterBar>{filterControls}</FilterBar>}
      {visibleTasks.length === 0 && !error && (
        <Message>Nessuna task in programma</Message>
      )}
      {/* una sezione per giorno, con il titoletto "Oggi", "Domani" o la data */}
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

      {/* modale "Nuova task": si apre quando showForm è true.
          Chiudendolo, il modulo si toglie dalla pagina: riaprendolo i campi sono di nuovo vuoti */}
      <FormModal
        wide
        show={showForm}
        title="Nuova task"
        onClose={() => setShowForm(false)}
      >
        <TaskForm
          stores={stores}
          employees={employees}
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      </FormModal>

      {/* !! trasforma taskToDelete in true/false: aperto se c'è una task da eliminare.
          taskToDelete?.title: il ?. serve perché quando il modale è chiuso taskToDelete è null */}
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
