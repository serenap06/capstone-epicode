// import
import "./shiftWeekGrid.css";
import { Fragment } from "react";
import { isSameDay } from "../../../utils/dates";
import { formatDayName } from "../../../utils/formatDayName";
import { formatHourRange } from "../../../utils/formatTime";
import { groupByStore } from "../../../utils/groupByStore";
import { getDayShifts } from "../../../utils/getDayShifts";
import HoursStatus from "../hoursStatus/HoursStatus";

// componente ShiftWeekGrid: la settimana del responsabile, una riga per persona e una colonna per giorno.
// props: days, shifts, hours = le righe delle ore, onShiftClick = modifica, onEmptyClick = nuovo turno
const ShiftWeekGrid = ({ days, shifts, hours, onShiftClick, onEmptyClick }) => {
  const today = new Date();
  // persone per negozio; i nomi dei negozi solo se sono più di uno
  const groups = groupByStore(hours);
  const showStoreNames = groups.length > 1;

  return (
    // su schermi stretti scorre in orizzontale
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
            // Fragment con key: le righe di un negozio senza elementi in più
            <Fragment key={group.store._id}>
              {/* con più negozi, il nome sopra le sue persone */}
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
                    // i turni della persona nel giorno
                    const dayShifts = getDayShifts(shifts, row.employeeId, day);
                    return (
                      <td key={day.toDateString()}>
                        {/* testo nascosto per lo screen reader */}
                        {dayShifts.length > 0 ? (
                          dayShifts.map((shift) => (
                            <button
                              key={shift._id}
                              type="button"
                              className="shift-grid-shift"
                              onClick={() => onShiftClick?.(shift)} // modifico il turno
                            >
                              {formatHourRange(shift.startAt, shift.endAt)}
                              <span className="visually-hidden">
                                , modifica
                              </span>
                            </button>
                          ))
                        ) : (
                          <button
                            type="button"
                            className="shift-grid-rest"
                            onClick={() => onEmptyClick?.(row.employeeId, day)} // nuovo turno per questa persona e questo giorno
                          >
                            Riposo
                            <span className="visually-hidden">
                              , aggiungi un turno
                            </span>
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
