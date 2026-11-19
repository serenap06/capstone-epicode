// import
import { getWeekDays, isSameDay } from "../../../utils/dates";
import { formatHourRange } from "../../../utils/formatTime";
import { formatDayName } from "../../../utils/formatDayName";
import "./weekShifts.css";

// componente WeekShifts: i sette giorni della Home con il mio turno o "Riposo". props: shifts = i miei
const WeekShifts = ({ shifts }) => {
  const now = new Date();

  return (
    // <ol>: i giorni hanno un ordine
    <ol className="week-shifts">
      {getWeekDays().map((day) => {
        // il turno del giorno
        const shift = shifts.find((shift) => isSameDay(shift.startAt, day));
        const isToday = isSameDay(day, now);
        const dayName = formatDayName(day);

        return (
          <li
            key={day.toDateString()}
            className={`week-day ${isToday ? "week-day-today" : ""}`}
            aria-current={isToday ? "date" : undefined}
          >
            <span className="week-day-name">{isToday ? "Oggi" : dayName}</span>
            {/* orario corto: le caselle sono strette */}
            <span className="week-day-time">
              {shift ? formatHourRange(shift.startAt, shift.endAt) : "Riposo"}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default WeekShifts;
