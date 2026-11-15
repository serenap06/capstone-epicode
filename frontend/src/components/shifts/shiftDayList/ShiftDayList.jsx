import "./shiftDayList.css";
import { isSameDay } from "../../../utils/dates";
import ShiftDayCard from "../shiftDayCard/ShiftDayCard";

// i giorni della settimana con il mio turno e i colleghi.
// userId: per separare i miei turni da quelli dei colleghi
const ShiftDayList = ({ days, shifts, userId }) => {
  return (
    <div className="shift-day-list">
      {/* map sui giorni e non sui turni: così si vedono anche i riposi */}
      {days.map((day) => {
        // il mio turno (find: uno solo)
        const dayShift = shifts.find(
          (shift) => shift.user._id === userId && isSameDay(shift.startAt, day),
        );
        // i colleghi (filter: tutti)
        const dayColleagues = shifts.filter(
          (shift) => shift.user._id !== userId && isSameDay(shift.startAt, day),
        );
        return (
          // key: il giorno come testo, è unico
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
