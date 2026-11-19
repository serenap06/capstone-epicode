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

// pagina Task del responsabile: le task da oggi in avanti, con i filtri.
// Filtri e pagine li fa il server: arrivano 10 task alla volta, in ordine di scadenza

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

// il periodo da chiedere al server per ogni scelta della scadenza:
// tutte = da oggi in avanti, oggi, domani
const DUE_RANGES = {
  "": () => ({ from: getToday().from }),
  today: getToday,
  tomorrow: getTomorrow,
};

const TYPE_OPTIONS = [
  { value: "daily", label: "Giornaliere" },
  { value: "monthly", label: "Mensili" },
];

const Tasks = () => {
  // tasks: una pagina, dal server già raggruppate (una per gruppo, con le persone dentro);
  // openCount: quante sono in corso (sottotitolo); totalPages e page: le pagine
  const [tasks, setTasks] = useState([]);
  const [openCount, setOpenCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
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
    // ignore: diventa true se parte una richiesta più nuova (la risposta vecchia la scarto)
    let ignore = false;
    // una pagina di task: tutti i filtri li applica il server (toQuery salta i vuoti).
    // Lo stato vale per la task intera: "Fatte" = l'hanno finita tutti.
    // Si ricarica a ogni cambio di filtri o pagina e quando cambia refreshCount
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
        // dopo un'eliminazione l'ultima pagina può sparire: torno all'ultima che c'è
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

  // cambia un filtro: copio gli altri e sovrascrivo quello ([name] usa il valore come chiave).
  // Con un filtro nuovo si riparte dalla prima pagina
  const changeFilter = (name, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    setPage(1);
  };

  // "Nuova task": modale con il modulo vuoto
  const openNewForm = () => setShowForm(true);

  // dopo il salvataggio chiudo il modale e ricarico (servono le task raggruppate)
  const handleSaved = () => {
    setShowForm(false);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // elimino sul server e ricarico (la pagina si riempie con la task successiva);
  // finally chiude sempre la conferma
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

  // i giorni con almeno una task della pagina, senza doppioni e già in ordine di scadenza
  const dayKeys = [
    ...new Set(tasks.map((task) => new Date(task.dueDate).toDateString())),
  ];
  // per ogni giorno le sue task (le tonde servono a restituire un oggetto)
  const sections = dayKeys.map((dayKey) => ({
    day: dayKey,
    tasks: tasks.filter((task) => isSameDay(task.dueDate, dayKey)),
  }));

  // i quattro filtri scritti una volta: da tablet in su stanno tutti in riga,
  // su telefono lo Stato resta in vista e gli altri tre vanno nel bottone "Filtri", accanto
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
      <PageHeader
        title="Task"
        titleAside={isPhone && addButton}
        subtitle={`${openCount} in corso`}
        error={error}
      >
        {/* da tablet in su il bottone va a destra dell'intestazione */}
        {!isPhone && addButton}
      </PageHeader>
      {/* su telefono lo Stato e accanto il bottone "Filtri" (Scadenza, Negozio, Tipo);
          da tablet in su tutti i filtri in riga */}
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
      {/* una sezione per giorno: "Oggi", "Domani" o la data.
          Dentro, una card per riga fino a 1200px e due per riga sopra */}
      {sections.map((section) => (
        <section key={section.day} className="mb-4">
          <h2 className="section-label mb-3">{formatDayLabel(section.day)}</h2>
          <Row xs={1} xl={2} className="g-3">
            {section.tasks.map((task) => (
              <Col key={task._id}>
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
