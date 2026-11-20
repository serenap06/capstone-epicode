// import
import "./myShifts.css";
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import { useAuth } from "../../../hooks/useAuth";
import { loadData } from "../../../api/loadData";
import { addDays, getWeek, getWeekDays, isSameDay } from "../../../utils/dates";
import { formatWeekRange } from "../../../utils/formatWeekRange";
import { toQuery } from "../../../utils/toQuery";

import Loader from "../../../components/common/loader/Loader";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import WeekNav from "../../../components/common/weekNav/WeekNav";
import HoursSummary from "../../../components/shifts/hoursSummary/HoursSummary";
import ShiftDayList from "../../../components/shifts/shiftDayList/ShiftDayList";

// componente MyShifts: le mie ore e i sette giorni, con le frecce per cambiare settimana
const MyShifts = () => {
  // utente collegato
  const { user } = useAuth();
  // turni della settimana di tutto il negozio
  const [shifts, setShifts] = useState([]);
  // le mie ore (null finché non arrivano)
  const [hours, setHours] = useState(null);
  const [error, setError] = useState("");
  // true fino ai primi dati: gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // un giorno della settimana mostrata (le frecce lo spostano di 7 giorni)
  const [referenceDate, setReferenceDate] = useState(new Date());

  // prendo turni e ore a ogni cambio di settimana
  useEffect(() => {
    // ignore: true se parte una richiesta più nuova (la risposta vecchia la scarto)
    let ignore = false;
    const weekQuery = toQuery(getWeek(referenceDate));

    // Promise.all aspetta le due richieste, poi spengo la rotellina
    Promise.all([
      loadData(
        `/shifts?${weekQuery}`,
        (data) => {
          if (!ignore) setShifts(data.shifts);
        },
        setError,
      ),
      loadData(
        `/shifts/hours?${weekQuery}`,
        (data) => {
          if (!ignore) setHours(data.hours[0]);
        },
        setError,
      ),
    ]).finally(() => setIsLoading(false));
    // pulizia: React la chiama prima di rifare l'effetto
    return () => {
      ignore = true;
    };
  }, [referenceDate]);

  // i 7 giorni
  const weekDays = getWeekDays(referenceDate);
  // true se è la settimana in corso (spegne "Questa settimana")
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
        {/* le frecce spostano referenceDate */}
        <WeekNav
          onPrevious={() => setReferenceDate(addDays(referenceDate, -7))}
          onNext={() => setReferenceDate(addDays(referenceDate, 7))}
          onToday={() => setReferenceDate(new Date())}
          isCurrentWeek={isCurrentWeek}
          onPickDate={setReferenceDate} // giorno dal calendario: la sua settimana
          selectedDate={referenceDate}
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
          {/* prima la rotellina (se no sembrerebbe tutto riposo) */}
          {isLoading ? (
            <Loader />
          ) : (
            // userId: per separare i miei turni da quelli dei colleghi
            <ShiftDayList days={weekDays} shifts={shifts} userId={user._id} />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default MyShifts;
