// import
import "./weekDayPicker.css";
import { isSameDay } from "../../../utils/dates";
import { formatDayName } from "../../../utils/formatDayName";

// componente WeekDayPicker: i sette giorni come pulsanti (telefono).
// props: days, selectedIndex = il giorno scelto (0 = lunedì), onSelect
const WeekDayPicker = ({ days, selectedIndex, onSelect }) => {
  const today = new Date();

  return (
    <div className="week-day-picker" role="group" aria-label="Giorno">
      {days.map((day, index) => (
        // aria-pressed: il giorno scelto (anche per il CSS)
        <button
          key={day.toDateString()}
          type="button"
          className={`week-day-picker-day ${isSameDay(day, today) ? "week-day-picker-today" : ""}`}
          aria-pressed={index === selectedIndex}
          onClick={() => onSelect(index)}
        >
          <span className="week-day-picker-name">{formatDayName(day)}</span>
          <span className="week-day-picker-number">{day.getDate()}</span>
        </button>
      ))}
    </div>
  );
};

export default WeekDayPicker;
