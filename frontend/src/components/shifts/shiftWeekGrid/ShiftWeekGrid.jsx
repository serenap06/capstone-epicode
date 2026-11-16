import "./shiftWeekGrid.css";
import { Fragment } from "react";
import { isSameDay } from "../../../utils/dates";
import { formatDayName } from "../../../utils/formatDayName";
import { formatHourRange } from "../../../utils/formatTime";
import { groupByStore } from "../../../utils/groupByStore";
import HoursStatus from "../hoursStatus/HoursStatus";

// settimana del negozio per il responsabile: una riga per dipendente, una colonna per giorno
// e in fondo le ore. hours: le righe di /shifts/hours, una per dipendente.
// onShiftClick (modifica) e onEmptyClick (nuovo turno) arrivano dalla pagina:
// ?.() le chiama solo se la pagina le ha passate
const ShiftWeekGrid = ({ days, shifts, hours, onShiftClick, onEmptyClick }) => {
  const today = new Date();
  // le persone divise per negozio: i nomi dei negozi si vedono solo se sono più di uno
  const groups = groupByStore(hours);
  const showStoreNames = groups.length > 1;

  return (
    // su schermi stretti la tabella scorre in orizzontale
    <div className="shift-grid-scroll">
      <table className="shift-grid">
        <thead>
          <tr>
            <th scope="col">Dipendente</th>
            {days.map((day) => (
              <th
                key={day.toDateString()}
                scope="col"
                className={isSameDay(day, today) ? "shift-grid-today" : ""}
              >
                {formatDayName(day)} {day.getDate()}
              </th>
            ))}
            <th scope="col">Ore settimana</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            // Fragment con key: raggruppa le righe di un negozio senza aggiungere elementi
            <Fragment key={group.store._id}>
              {/* con più negozi, una riga con il nome sopra le sue persone */}
              {showStoreNames && (
                <tr className="shift-grid-group">
                  <th scope="rowgroup" colSpan={days.length + 2}>
                    {group.store.name}
                  </th>
                </tr>
              )}
              {group.rows.map((row) => (
                <tr key={row.employeeId}>
                  <th scope="row">
                    <span className="shift-grid-name">{row.employee}</span>
                    <span className="shift-grid-contract">
                      Contratto {row.weeklyHours ?? 0} h
                    </span>
                  </th>
                  {days.map((day) => {
                    // i turni di questa persona in questo giorno (di solito uno)
                    const dayShifts = shifts.filter(
                      (shift) =>
                        shift.user._id === row.employeeId &&
                        isSameDay(shift.startAt, day),
                    );
                    return (
                      <td key={day.toDateString()}>
                        {/* il testo nascosto dice allo screen reader cosa fa il bottone */}
                        {dayShifts.length > 0 ? (
                          dayShifts.map((shift) => (
                            <button
                              key={shift._id}
                              type="button"
                              className="shift-grid-shift"
                              onClick={() => onShiftClick?.(shift)}
                            >
                              {formatHourRange(shift.startAt, shift.endAt)}
                              <span className="visually-hidden">, modifica</span>
                            </button>
                          ))
                        ) : (
                          <button
                            type="button"
                            className="shift-grid-rest"
                            onClick={() => onEmptyClick?.(row.employeeId, day)}
                          >
                            Riposo
                            <span className="visually-hidden">, aggiungi un turno</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td>
                    <HoursStatus
                      scheduled={row.scheduledHours}
                      contract={row.weeklyHours ?? 0}
                    />
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShiftWeekGrid;
