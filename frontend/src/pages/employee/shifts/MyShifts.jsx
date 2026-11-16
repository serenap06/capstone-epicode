import "./myShifts.css";
import { loadData } from "../../../api/loadData";
import { useAuth } from "../../../hooks/useAuth";
import { useState, useEffect } from "react";
import {
  addDays,
  getWeek,
  getWeekDays,
  isSameDay,
} from "../../../utils/dates";
import { toQuery } from "../../../utils/toQuery";
import { formatWeekRange } from "../../../utils/formatWeekRange";
import { Container, Row, Col } from "react-bootstrap";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import ShiftDayList from "../../../components/shifts/shiftDayList/ShiftDayList";
import HoursSummary from "../../../components/shifts/hoursSummary/HoursSummary";
import WeekNav from "../../../components/common/weekNav/WeekNav";

// pagina "I miei turni": ore, i sette giorni e le frecce per cambiare settimana
const MyShifts = () => {
  const { user } = useAuth();
  // shifts: i turni della settimana di tutto il negozio (anche dei colleghi)
  const [shifts, setShifts] = useState([]);
  // hours: null finché non arriva
  const [hours, setHours] = useState(null);
  const [error, setError] = useState("");
  // referenceDate: un giorno della settimana mostrata; le frecce la spostano di 7 giorni
  const [referenceDate, setReferenceDate] = useState(new Date());

  // ricarico turni e ore a ogni cambio di settimana
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

  // i 7 giorni
  const weekDays = getWeekDays(referenceDate);
  // true se è la settimana in corso (disattiva "Questa settimana")
  const isCurrentWeek = isSameDay(weekDays[0], getWeekDays()[0]);
  const storeName = user.store?.name ?? "";

  // i miei turni della settimana, per "5 turni"
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
        {/* le frecce cambiano solo referenceDate */}
        <WeekNav
          onPrevious={() => setReferenceDate(addDays(referenceDate, -7))}
          onNext={() => setReferenceDate(addDays(referenceDate, 7))}
          onToday={() => setReferenceDate(new Date())}
          isCurrentWeek={isCurrentWeek}
        />
      </PageHeader>

      {/* riepilogo ore, quando arriva */}
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
          {/* per ogni giorno la lista trova il mio turno e i colleghi */}
          <ShiftDayList days={weekDays} shifts={shifts} userId={user._id} />
        </Col>
      </Row>
    </Container>
  );
};

export default MyShifts;
