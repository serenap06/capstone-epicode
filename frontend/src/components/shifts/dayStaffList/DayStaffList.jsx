import "./dayStaffList.css";
import { Fragment } from "react";
import { formatTimeRange } from "../../../utils/formatTime";
import { groupByStore } from "../../../utils/groupByStore";
import { getDayShifts } from "../../../utils/getDayShifts";

// il personale in un giorno, per il telefono: nome e orario, oppure "Riposo".
// Come nella tabella: un clic sul turno lo modifica, su "Riposo" ne crea uno nuovo.
// Con più negozi le persone sono divise sotto il nome del loro negozio
const DayStaffList = ({ day, shifts, hours, onShiftClick, onEmptyClick }) => {
  const groups = groupByStore(hours);
  const showStoreNames = groups.length > 1;

  return (
    <ul className="day-staff-list">
      {groups.map((group) => (
        <Fragment key={group.store._id}>
          {showStoreNames && (
            <li className="day-staff-group">{group.store.name}</li>
          )}
          {group.rows.map((row) => {
            // i turni di questa persona nel giorno scelto (di solito uno)
            const dayShifts = getDayShifts(shifts, row.employeeId, day);
            return (
              <li key={row.employeeId}>
                {dayShifts.length > 0 ? (
                  dayShifts.map((shift) => (
                    <button
                      key={shift._id}
                      type="button"
                      className="day-staff-row"
                      onClick={() => onShiftClick(shift)}
                    >
                      <span className="day-staff-name">{row.employee}</span>
                      <span className="day-staff-time">
                        {formatTimeRange(shift.startAt, shift.endAt)}
                      </span>
                    </button>
                  ))
                ) : (
                  <button
                    type="button"
                    className="day-staff-row"
                    onClick={() => onEmptyClick(row.employeeId, day)}
                  >
                    <span className="day-staff-name">{row.employee}</span>
                    <span className="day-staff-rest">
                      Riposo
                      <span className="visually-hidden">, aggiungi un turno</span>
                    </span>
                  </button>
                )}
              </li>
            );
          })}
        </Fragment>
      ))}
    </ul>
  );
};

export default DayStaffList;
