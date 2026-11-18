import "./shifts.css";
import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";

import { useIsPhone } from "../../../hooks/useIsPhone";
import { loadData } from "../../../api/loadData";
import { deleteShift } from "../../../api/shifts";
import { addDays, getWeek, getWeekDays, isSameDay } from "../../../utils/dates";
import { formatLongDate } from "../../../utils/formatLongDate";
import { formatWeekRange } from "../../../utils/formatWeekRange";
import { toQuery } from "../../../utils/toQuery";
import { toStoreOptions } from "../../../utils/toStoreOptions";

import AddButton from "../../../components/common/addButton/AddButton";
import ConfirmDialog from "../../../components/common/confirmDialog/ConfirmDialog";
import FilterBar from "../../../components/common/filterBar/FilterBar";
import FilterChips from "../../../components/common/filterBar/FilterChips";
import FormModal from "../../../components/common/formModal/FormModal";
import Loader from "../../../components/common/loader/Loader";
import Message from "../../../components/common/message/Message";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import Panel from "../../../components/common/panel/Panel";
import WeekNav from "../../../components/common/weekNav/WeekNav";
import DayStaffList from "../../../components/shifts/dayStaffList/DayStaffList";
import ShiftForm from "../../../components/shifts/shiftForm/ShiftForm";
import ShiftWeekGrid from "../../../components/shifts/shiftWeekGrid/ShiftWeekGrid";
import WeekDayPicker from "../../../components/shifts/weekDayPicker/WeekDayPicker";
import WeekHoursList from "../../../components/shifts/weekHoursList/WeekHoursList";

// pagina Turni del responsabile: la settimana di un negozio e le ore di ogni dipendente
const Shifts = () => {
  const [stores, setStores] = useState([]);
  // selectedStore: l'id del negozio mostrato; "" = tutti i negozi (si parte da qui)
  const [selectedStore, setSelectedStore] = useState("");
  // referenceDate: un giorno della settimana mostrata, come in "I miei turni"
  const [referenceDate, setReferenceDate] = useState(new Date());
  // shifts: i turni del negozio nella settimana
  const [shifts, setShifts] = useState([]);
  // hours: una riga per dipendente, con contratto e ore pianificate
  const [hours, setHours] = useState([]);
  const [error, setError] = useState("");
  // true finché i dati non arrivano la prima volta: intanto gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // aumentarlo ricarica turni e ore (dopo un salvataggio o un'eliminazione)
  const [refreshCount, setRefreshCount] = useState(0);
  // modale del modulo: shiftToEdit è il turno da modificare (null = nuovo);
  // formDefaults: persona e giorno già scelti per un turno nuovo
  const [showForm, setShowForm] = useState(false);
  const [shiftToEdit, setShiftToEdit] = useState(null);
  const [formDefaults, setFormDefaults] = useState({});
  // conferma dell'eliminazione
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // su telefono: il giorno scelto come posizione nella settimana (0 = lunedì).
  // Parte da oggi: getDay() conta da domenica, con +6 e % 7 lunedì diventa 0
  const [selectedDayIndex, setSelectedDayIndex] = useState(
    (new Date().getDay() + 6) % 7,
  );

  // su telefono (fino a 767px) giorni a pulsanti e liste, come nel layout mobile;
  // da tablet in su la tabella della settimana
  const isPhone = useIsPhone();

  // i negozi una volta sola, per i pulsanti
  useEffect(() => {
    loadData("/stores", (data) => setStores(data.stores), setError);
  }, []);

  // turni e ore della settimana. Con "Tutti" store è "" e toQuery non lo manda:
  // il server restituisce tutti i negozi
  useEffect(() => {
    const query = toQuery({ store: selectedStore, ...getWeek(referenceDate) });
    // Promise.all aspetta tutte e due le richieste, poi finally spegne la rotellina
    Promise.all([
      loadData(`/shifts?${query}`, (data) => setShifts(data.shifts), setError),
      loadData(
        `/shifts/hours?${query}`,
        (data) => setHours(data.hours),
        setError,
      ),
    ]).finally(() => setIsLoading(false));
  }, [selectedStore, referenceDate, refreshCount]);

  // nuovo turno: dal bottone (senza persona e giorno) o dal clic su "Riposo" (con tutti e due)
  const openNewForm = (employeeId, day) => {
    setShiftToEdit(null);
    setFormDefaults({ employeeId, day });
    setShowForm(true);
  };

  // clic su un turno: modale con i dati di quel turno
  const openEditForm = (shift) => {
    setShiftToEdit(shift);
    setShowForm(true);
  };

  // dopo il salvataggio chiudo e ricarico: cambiano sia i turni sia le ore
  const handleSaved = () => {
    setShowForm(false);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // "Elimina" nel modulo: chiudo il modulo e chiedo conferma
  const askDelete = (shift) => {
    setShowForm(false);
    setShiftToDelete(shift);
  };

  // elimino sul server e ricarico turni e ore (cambiano le ore della persona);
  // finally chiude sempre la conferma
  const confirmDelete = async () => {
    setIsDeleting(true);
    setError("");
    try {
      await deleteShift(shiftToDelete._id);
      setRefreshCount((prevCount) => prevCount + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsDeleting(false);
      setShiftToDelete(null);
    }
  };

  // valori calcolati
  const weekDays = getWeekDays(referenceDate);
  // il giorno scelto su telefono: cambiando settimana resta lo stesso giorno (es. sempre martedì)
  const selectedDay = weekDays[selectedDayIndex];
  const isCurrentWeek = isSameDay(weekDays[0], getWeekDays()[0]);
  const storeName = selectedStore
    ? stores.find((store) => store._id === selectedStore)?.name
    : "Tutti i negozi";
  // i pulsanti: "Tutti" (valore "") e poi i negozi, nel formato { value, label } di FilterChips
  const storeOptions = [
    { value: "", label: "Tutti" },
    ...toStoreOptions(stores),
  ];

  return (
    <Container fluid>
      <PageHeader
        title="Turni"
        subtitle={
          <>
            {storeName && <span className="text-nowrap">{storeName} ·</span>}{" "}
            <span className="text-nowrap">
              settimana {formatWeekRange(weekDays)}
            </span>
          </>
        }
        error={error}
      >
        {/* settimana e "Nuovo turno" sulla stessa riga; su telefono il bottone è solo "+" */}
        <div className="shifts-header-actions">
          <WeekNav
            onPrevious={() => setReferenceDate(addDays(referenceDate, -7))}
            onNext={() => setReferenceDate(addDays(referenceDate, 7))}
            onToday={() => setReferenceDate(new Date())}
            isCurrentWeek={isCurrentWeek}
          />
          <AddButton
            label="Nuovo turno"
            iconOnly={isPhone}
            onClick={() => openNewForm()}
          />
        </div>
      </PageHeader>

      {/* il div serve al CSS: a 320px i pulsanti dei negozi si rimpiccioliscono */}
      <div className="shifts-filters">
        <FilterBar>
          <FilterChips
            label="Negozio"
            options={storeOptions}
            value={selectedStore}
            onChange={setSelectedStore}
          />
        </FilterBar>
      </div>

      {isLoading && <Loader />}
      {!isLoading && hours.length === 0 && !error && (
        <Message>Nessun dipendente</Message>
      )}

      {/* telefono: giorni a pulsanti, il personale del giorno e le ore.
          Da tablet in su: la tabella della settimana */}
      {hours.length > 0 &&
        (isPhone ? (
          <>
            <WeekDayPicker
              days={weekDays}
              selectedIndex={selectedDayIndex}
              onSelect={setSelectedDayIndex}
            />
            <div className="d-flex flex-column gap-4">
              <Panel
                title={formatLongDate(selectedDay)}
                className="shifts-day-panel"
              >
                <DayStaffList
                  day={selectedDay}
                  shifts={shifts}
                  hours={hours}
                  onShiftClick={openEditForm}
                  onEmptyClick={openNewForm}
                />
              </Panel>
              <Panel title="Ore della settimana">
                <WeekHoursList hours={hours} />
              </Panel>
            </div>
          </>
        ) : (
          <Panel title="Settimana e ore">
            <ShiftWeekGrid
              days={weekDays}
              shifts={shifts}
              hours={hours}
              onShiftClick={openEditForm}
              onEmptyClick={openNewForm}
            />
          </Panel>
        ))}

      <FormModal
        show={showForm}
        title={shiftToEdit ? "Modifica turno" : "Nuovo turno"}
        onClose={() => setShowForm(false)}
      >
        <ShiftForm
          shift={shiftToEdit}
          defaults={formDefaults}
          employees={hours}
          weekDays={weekDays}
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
          onDelete={askDelete}
        />
      </FormModal>

      <ConfirmDialog
        show={!!shiftToDelete}
        title="Eliminare il turno?"
        message={`Il turno di ${shiftToDelete?.user.name} verrà eliminato. Non si può annullare.`}
        confirmLabel="Elimina"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setShiftToDelete(null)}
      />
    </Container>
  );
};

export default Shifts;
