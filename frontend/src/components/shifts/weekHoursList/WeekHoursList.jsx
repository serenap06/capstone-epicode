// import
import "./weekHoursList.css";
import { Fragment } from "react";
import { groupByStore } from "../../../utils/groupByStore";
import HoursStatus from "../hoursStatus/HoursStatus";

// componente WeekHoursList: le ore della settimana di ogni persona, su telefono. props: hours
const WeekHoursList = ({ hours }) => {
  // persone per negozio; i nomi dei negozi solo se sono più di uno
  const groups = groupByStore(hours);
  const showStoreNames = groups.length > 1;

  return (
    <ul className="week-hours-list">
      {groups.map((group) => (
        <Fragment key={group.store._id}>
          {showStoreNames && (
            <li className="week-hours-group">{group.store.name}</li>
          )}
          {group.rows.map((row) => (
            <li key={row.employeeId} className="week-hours-row">
              <div>
                <p className="week-hours-name">{row.employee}</p>
                <p className="week-hours-contract">
                  Contratto {row.weeklyHours ?? 0} h
                </p>
              </div>
              <HoursStatus
                scheduled={row.scheduledHours}
                contract={row.weeklyHours ?? 0}
              />
            </li>
          ))}
        </Fragment>
      ))}
    </ul>
  );
};

export default WeekHoursList;
