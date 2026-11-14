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

const MyShifts = () => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [hours, setHours] = useState(null);
  const [error, setError] = useState("");
  const [referenceDate, setReferenceDate] = useState(new Date());

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

  const weekDays = getWeekDays(referenceDate);
  const isCurrentWeek = isSameDay(weekDays[0], getWeekDays()[0]);
  const storeName = user.store?.name ?? "";

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
        <WeekNav
          onPrevious={() => setReferenceDate(addDays(referenceDate, -7))}
          onNext={() => setReferenceDate(addDays(referenceDate, 7))}
          onToday={() => setReferenceDate(new Date())}
          isCurrentWeek={isCurrentWeek}
        />
      </PageHeader>

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
          <ShiftDayList days={weekDays} shifts={shifts} userId={user._id} />
        </Col>
      </Row>
    </Container>
  );
};

export default MyShifts;
