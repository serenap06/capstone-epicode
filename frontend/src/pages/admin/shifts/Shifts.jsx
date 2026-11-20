// import
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
import Badge from "../../../components/common/badge/Badge";
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

// componente Shifts: la settimana dei turni e le ore di ogni dipendente
const Shifts = () => {
  // negozi, per i pulsanti
  const [stores, setStores] = useState([]);
  // negozio mostrato ("" = tutti)
  const [selectedStore, setSelectedStore] = useState("");
  // un giorno della settimana mostrata
  const [referenceDate, setReferenceDate] = useState(new Date());
  // turni della settimana
  const [shifts, setShifts] = useState([]);
  // una riga per dipendente: contratto e ore pianificate
  const [hours, setHours] = useState([]);
  const [error, setError] = useState("");
  // true fino ai primi dati: gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // aumentarlo ricarica turni e ore
  const [refreshCount, setRefreshCount] = useState(0);
  // modale del modulo: turno da modificare (null = nuovo) e persona e giorno già scelti
  const [showForm, setShowForm] = useState(false);
  const [shiftToEdit, setShiftToEdit] = useState(null);
  const [formDefaults, setFormDefaults] = useState({});
  // conferma dell'eliminazione
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // su telefono il giorno scelto (0 = lunedì); parto da oggi
  const [selectedDayIndex, setSelectedDayIndex] = useState(
    (new Date().getDay() + 6) % 7,
  );

  // telefono: giorni a pulsanti e liste; da tablet la tabella
  const isPhone = useIsPhone();

  // prendo i negozi una volta sola
  useEffect(() => {
    loadData("/stores", (data) => setStores(data.stores), setError);
  }, []);

  // prendo turni e ore al cambio di negozio, di settimana e al refreshCount
  useEffect(() => {
    // ignore: true se parte una richiesta più nuova (la risposta vecchia la scarto)
    let ignore = false;
    const query = toQuery({ store: selectedStore, ...getWeek(referenceDate) });
    // Promise.all aspetta le due richieste, poi spengo la rotellina
    Promise.all([
      loadData(
        `/shifts?${query}`,
        (data) => {
          if (!ignore) setShifts(data.shifts);
        },
        setError,
      ),
      loadData(
        `/shifts/hours?${query}`,
        (data) => {
          if (!ignore) setHours(data.hours);
        },
        setError,
      ),
    ]).finally(() => setIsLoading(false));
    // pulizia: React la chiama prima di rifare l'effetto
    return () => {
      ignore = true;
    };
  }, [selectedStore, referenceDate, refreshCount]);

  // nuovo turno: dal bottone (vuoto) o da "Riposo" (persona e giorno già scelti)
  const openNewForm = (employeeId, day) => {
    setShiftToEdit(null);
    setFormDefaults({ employeeId, day });
    setShowForm(true);
  };

  // clic su un turno: lo modifico
  const openEditForm = (shift) => {
    setShiftToEdit(shift);
    setShowForm(true);
  };

  // salvato: chiudo e ricarico
  const handleSaved = () => {
    setShowForm(false);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // "Elimina" nel modulo: chiudo il modulo e chiedo conferma
  const askDelete = (shift) => {
    setShowForm(false);
    setShiftToDelete(shift);
  };

  // elimino il turno e ricarico; finally chiude sempre la conferma
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

  // giorno scelto dal calendario: la sua settimana e, su telefono, proprio quel giorno
  const pickDate = (date) => {
    setReferenceDate(date);
    setSelectedDayIndex((date.getDay() + 6) % 7);
  };

  // valori calcolati
  const weekDays = getWeekDays(referenceDate);
  // il giorno scelto su telefono (cambiando settimana resta lo stesso giorno)
  const selectedDay = weekDays[selectedDayIndex];
  const isCurrentWeek = isSameDay(weekDays[0], getWeekDays()[0]);
  const storeName = selectedStore
    ? stores.find((store) => store._id === selectedStore)?.name
    : "Tutti i negozi";
  // pulsanti: "Tutti" e poi i negozi
  const storeOptions = [
    { value: "", label: "Tutti" },
    ...toStoreOptions(stores),
  ];

  // "Nuovo turno": su telefono solo il "+" accanto al titolo
  const addButton = (
    <AddButton
      label="Nuovo turno"
      iconOnly={isPhone}
      onClick={() => openNewForm()} // modulo vuoto
    />
  );

  return (
    <Container fluid>
      <PageHeader
        title="Turni"
        titleAside={isPhone && addButton}
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
        {/* frecce e calendario; da tablet "Nuovo turno" sulla stessa riga */}
        <div className="shifts-header-actions">
          <WeekNav
            onPrevious={() => setReferenceDate(addDays(referenceDate, -7))}
            onNext={() => setReferenceDate(addDays(referenceDate, 7))}
            onToday={() => setReferenceDate(new Date())}
            isCurrentWeek={isCurrentWeek}
            onPickDate={pickDate} // giorno dal calendario
            selectedDate={referenceDate}
          />
          {!isPhone && addButton}
        </div>
      </PageHeader>

      {/* a 320px i pulsanti dei negozi si rimpiccioliscono */}
      <div className="shifts-filters">
        <FilterBar>
          <FilterChips
            label="Negozio"
            options={storeOptions}
            value={selectedStore}
            onChange={setSelectedStore} // cambio negozio
          />
        </FilterBar>
      </div>

      {isLoading && <Loader />}
      {!isLoading && hours.length === 0 && !error && (
        <Message>Nessun dipendente</Message>
      )}

      {/* telefono: giorni a pulsanti, persone del giorno e ore; da tablet la tabella */}
      {hours.length > 0 &&
        (isPhone ? (
          <>
            <WeekDayPicker
              days={weekDays}
              selectedIndex={selectedDayIndex}
              onSelect={setSelectedDayIndex} // scelgo il giorno
            />
            <div className="d-flex flex-column gap-4">
              <Panel
                title={formatLongDate(selectedDay)}
                aside={
                  isSameDay(selectedDay, new Date()) && (
                    <Badge color="primary">Oggi</Badge>
                  )
                } // il badge "Oggi" se il giorno scelto è oggi
                className="shifts-day-panel"
              >
                <DayStaffList
                  day={selectedDay} // il giorno scelto
                  shifts={shifts}
                  hours={hours} // le persone con le loro ore
                  onShiftClick={openEditForm} // clic su un turno: lo modifico
                  onEmptyClick={openNewForm} // clic su "Riposo": nuovo turno
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
              days={weekDays} // i 7 giorni
              shifts={shifts}
              hours={hours} // le persone con le loro ore
              onShiftClick={openEditForm} // clic su un turno: lo modifico
              onEmptyClick={openNewForm} // clic su "Riposo": nuovo turno
            />
          </Panel>
        ))}

      {/* modale del turno */}
      <FormModal
        show={showForm}
        title={shiftToEdit ? "Modifica turno" : "Nuovo turno"}
        onClose={() => setShowForm(false)}
      >
        <ShiftForm
          shift={shiftToEdit} // turno da modificare (null = nuovo)
          defaults={formDefaults} // persona e giorno già scelti
          employees={hours} // le persone, con negozio e ore
          weekDays={weekDays} // i giorni della settimana mostrata
          onSaved={handleSaved} // chiudo e ricarico
          onCancel={() => setShowForm(false)}
          onDelete={askDelete} // chiudo il modulo e chiedo conferma
        />
      </FormModal>

      {/* conferma dell'eliminazione */}
      <ConfirmDialog
        show={!!shiftToDelete}
        title="Eliminare il turno?"
        message={`Il turno di ${shiftToDelete?.user.name} verrà eliminato. Non si può annullare.`}
        confirmLabel="Elimina"
        isLoading={isDeleting} // spento mentre aspetto il server
        onConfirm={confirmDelete} // elimino il turno
        onCancel={() => setShiftToDelete(null)}
      />
    </Container>
  );
};

export default Shifts;
