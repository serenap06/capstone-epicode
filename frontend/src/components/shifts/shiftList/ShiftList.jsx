import { formatTimeRange } from "../../../utils/formatTime";
import { formatFullName } from "../../../utils/formatFullName";
import Badge from "../../common/badge/Badge";
import "./shiftList.css";

// elenco di turni raggruppati per negozio, per dashboard e home
const ShiftList = ({ shifts }) => {
  const now = new Date();
  // nomi dei negozi senza doppioni: map prende il nome da ogni turno,
  // new Set toglie i doppioni e [...] lo ritrasforma in array
  const storeNames = [...new Set(shifts.map((shift) => shift.store.name))];

  return (
    <div className="shift-list">
      {storeNames.map((storeName) => (
        <div key={storeName} className="shift-list-group">
          <p className="shift-list-store">{storeName}</p>

          {/* i turni di questo negozio */}
          {shifts
            .filter((shift) => shift.store.name === storeName)
            .map((shift) => {
              // "In turno" se adesso siamo tra l'inizio e la fine del turno
              const isNow =
                new Date(shift.startAt) <= now && now <= new Date(shift.endAt);

              return (
                <div key={shift._id} className="shift-list-row">
                  <span className="shift-list-name">
                    {formatFullName(shift.user)}
                  </span>
                  {isNow && <Badge color="secondary">In turno</Badge>}
                  <span className="shift-list-time">
                    {formatTimeRange(shift.startAt, shift.endAt)}
                  </span>
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
};

export default ShiftList;
