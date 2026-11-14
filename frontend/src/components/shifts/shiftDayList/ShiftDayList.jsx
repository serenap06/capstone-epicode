import "./shiftDayList.css";
import { isSameDay } from "../../../utils/dates";
import ShiftDayCard from "../shiftDayCard/ShiftDayCard";

// i giorni della settimana: per ognuno il turno del dipendente e i colleghi
const ShiftDayList = ({ days, shifts, userId }) => {
  return (
    <div className="shift-day-list">
      {days.map((day) => {
        const dayShift = shifts.find(
          (shift) => shift.user._id === userId && isSameDay(shift.startAt, day),
        );
        const dayColleagues = shifts.filter(
          (shift) => shift.user._id !== userId && isSameDay(shift.startAt, day),
        );
        return (
          <ShiftDayCard
            key={day.toDateString()}
            day={day}
            shift={dayShift}
            colleagues={dayColleagues}
            isToday={isSameDay(day, new Date())}
          />
        );
      })}
    </div>
  );
};

export default ShiftDayList;
