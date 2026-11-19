// import
import "./shiftDayList.css";
import { isSameDay } from "../../../utils/dates";
import ShiftDayCard from "../shiftDayCard/ShiftDayCard";

// componente ShiftDayList: i giorni della settimana con il mio turno e i colleghi.
// props: days, shifts, userId = per separare i miei turni
const ShiftDayList = ({ days, shifts, userId }) => {
  return (
    <div className="shift-day-list">
      {/* map sui giorni: così si vedono anche i riposi */}
      {days.map((day) => {
        // il mio turno
        const dayShift = shifts.find(
          (shift) => shift.user._id === userId && isSameDay(shift.startAt, day),
        );
        // i colleghi
        const dayColleagues = shifts.filter(
          (shift) => shift.user._id !== userId && isSameDay(shift.startAt, day),
        );
        return (
          // key: il giorno come testo
          <ShiftDayCard
            key={day.toDateString()}
            day={day} // il giorno
            shift={dayShift} // il mio turno (undefined = riposo)
            colleagues={dayColleagues} // i turni dei colleghi
            isToday={isSameDay(day, new Date())}
          />
        );
      })}
    </div>
  );
};

export default ShiftDayList;
