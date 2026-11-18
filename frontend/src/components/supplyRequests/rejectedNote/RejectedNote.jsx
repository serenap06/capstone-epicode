// stesso riquadro dei dettagli delle vendite annullate
import "../../sales/cancelledNote/cancelledNote.css";
import { formatFullName } from "../../../utils/formatFullName";
import { formatShortDate } from "../../../utils/formatShortDate";

// i dettagli di una richiesta respinta, che si aprono con il pulsante "Respinta":
// chi l'ha respinta, quando e il motivo. handledBy arriva con nome e cognome
const RejectedNote = ({ request }) => {
  return (
    <div className="cancelled-note">
      <p>
        Respinta
        {request.handledBy && ` da ${formatFullName(request.handledBy)}`} ·{" "}
        {formatShortDate(request.handledAt)}
      </p>
      <p>
        <strong>Motivo:</strong> {request.rejectReason}
      </p>
    </div>
  );
};

export default RejectedNote;
