import { getWeekDays, isSameDay } from "../../../utils/dates";
import { formatHourRange } from "../../../utils/formatTime";
import { formatDayName } from "../../../utils/formatDayName";
import "./weekShifts.css";

// i sette giorni della settimana con il turno del dipendente o "Riposo"
const WeekShifts = ({ shifts }) => {
  const now = new Date();

  return (
    <ol className="week-shifts">
      {getWeekDays().map((day) => {
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
