import "./myShifts.css";
import { loadData } from "../../../api/loadData";
import { useAuth } from "../../../hooks/useAuth";
import { useState, useEffect } from "react";
import {
  addDays,
  getWeek,
  getWeekDays,
  isSameDay,
  toQuery,
} from "../../../utils/dates";
import { formatWeekRange } from "../../../utils/formatWeekRange";
import { Container, Row, Col } from "react-bootstrap";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import ShiftDayList from "../../../components/shifts/shiftDayList/ShiftDayList";
import HoursSummary from "../../../components/shifts/hoursSummary/HoursSummary";
import WeekNav from "../../../components/common/weekNav/WeekNav";

// pagina "I miei turni" del dipendente: ore della settimana, i sette giorni e le frecce per cambiare settimana
const MyShifts = () => {
  const { user } = useAuth();
  // shifts: i turni della settimana di tutto il negozio (servono anche per i colleghi)
  const [shifts, setShifts] = useState([]);
  // hours parte da null: il riepilogo compare solo quando arrivano i dati
  const [hours, setHours] = useState(null);
  const [error, setError] = useState("");
  // referenceDate: una data qualsiasi della settimana mostrata. Parte da oggi,
  // le frecce la spostano di 7 giorni. Tutto il resto si calcola da lei
  const [referenceDate, setReferenceDate] = useState(new Date());

  // carico turni e ore della settimana di referenceDate.
  // [referenceDate] in fondo: lo useEffect riparte ogni volta che cambio settimana
  useEffect(() => {
    const weekQuery = toQuery(getWeek(referenceDate));

    loadData(
      `/shifts?${weekQuery}`,
      (data) => setShifts(data.shifts),
      setError,
    );
    loadData(
      `/shifts/hours?${weekQuery}`,
      (data) => setHours(data.hours[0]),
      setError,
    );
  }, [referenceDate]);

  // i 7 giorni da mostrare
  const weekDays = getWeekDays(referenceDate);
  // true se il lunedì mostrato è quello di questa settimana (serve a disattivare "Questa settimana")
  const isCurrentWeek = isSameDay(weekDays[0], getWeekDays()[0]);
  const storeName = user.store?.name ?? "";

  // quanti turni ho io nella settimana, per scrivere "5 turni"
  const myShiftCount = shifts.filter(
    (shift) => shift.user._id === user._id,
  ).length;

  return (
    <Container fluid>
      <PageHeader
        title="I miei turni"
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
        {/* frecce e "Questa settimana": cambiano solo referenceDate */}
        <WeekNav
          onPrevious={() => setReferenceDate(addDays(referenceDate, -7))}
          onNext={() => setReferenceDate(addDays(referenceDate, 7))}
          onToday={() => setReferenceDate(new Date())}
          isCurrentWeek={isCurrentWeek}
        />
      </PageHeader>

      {/* riepilogo ore, solo quando hours è arrivato */}
      {hours && (
        <Row className="mb-4">
          <Col>
            <HoursSummary hours={hours} shiftCount={myShiftCount} />
          </Col>
        </Row>
      )}
      <Row as="section">
        <Col>
          <h2 className="section-label mb-3">Giorni</h2>
          {/* la lista cerca da sola, per ogni giorno, il mio turno e quelli dei colleghi */}
          <ShiftDayList days={weekDays} shifts={shifts} userId={user._id} />
        </Col>
      </Row>
    </Container>
  );
};

export default MyShifts;
