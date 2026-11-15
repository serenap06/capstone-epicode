import "./shiftDayList.css";
import { isSameDay } from "../../../utils/dates";
import ShiftDayCard from "../shiftDayCard/ShiftDayCard";

// i giorni della settimana: per ognuno il turno del dipendente e i colleghi.
// days: i 7 giorni da mostrare; shifts: tutti i turni del negozio nella settimana;
// userId: l'id del dipendente, per distinguere i suoi turni da quelli dei colleghi
const ShiftDayList = ({ days, shifts, userId }) => {
  return (
    <div className="shift-day-list">
      {/* la map è sui giorni e non sui turni: così compaiono anche i giorni di riposo */}
      {days.map((day) => {
        // il turno del dipendente in quel giorno (find: ne cerco uno solo)
        const dayShift = shifts.find(
          (shift) => shift.user._id === userId && isSameDay(shift.startAt, day),
        );
        // i turni dei colleghi in quel giorno (filter: li voglio tutti)
        const dayColleagues = shifts.filter(
          (shift) => shift.user._id !== userId && isSameDay(shift.startAt, day),
        );
        return (
          // toDateString come key perché ogni giorno è unico
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
