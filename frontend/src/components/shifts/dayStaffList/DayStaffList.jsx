// import
import "./dayStaffList.css";
import { Fragment } from "react";
import { formatTimeRange } from "../../../utils/formatTime";
import { groupByStore } from "../../../utils/groupByStore";
import { getDayShifts } from "../../../utils/getDayShifts";

// componente DayStaffList: il personale di un giorno, su telefono (nome e orario, oppure "Riposo").
// props: day, shifts, hours = le persone, onShiftClick = modifica, onEmptyClick = nuovo turno
const DayStaffList = ({ day, shifts, hours, onShiftClick, onEmptyClick }) => {
  // persone per negozio; i nomi dei negozi solo se sono più di uno
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
            // i turni della persona nel giorno
            const dayShifts = getDayShifts(shifts, row.employeeId, day);
            return (
              <li key={row.employeeId}>
                {dayShifts.length > 0 ? (
                  dayShifts.map((shift) => (
                    <button
                      key={shift._id}
                      type="button"
                      className="day-staff-row"
                      onClick={() => onShiftClick(shift)} // modifico il turno
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
                    onClick={() => onEmptyClick(row.employeeId, day)} // nuovo turno per questa persona e questo giorno
                  >
                    <span className="day-staff-name">{row.employee}</span>
                    <span className="day-staff-rest">
                      Riposo
                      <span className="visually-hidden">
                        , aggiungi un turno
                      </span>
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
