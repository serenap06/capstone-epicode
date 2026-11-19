// import (stesso riquadro delle vendite annullate)
import "../../sales/cancelledNote/cancelledNote.css";
import { formatFullName } from "../../../utils/formatFullName";
import { formatShortDate } from "../../../utils/formatShortDate";

// componente RejectedNote: chi ha respinto la richiesta, quando e il motivo. props: request
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
