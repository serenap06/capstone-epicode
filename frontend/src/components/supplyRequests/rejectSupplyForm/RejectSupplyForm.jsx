// import
import { useState } from "react";
import { useForm } from "react-hook-form";

import { rejectSupplyRequest } from "../../../api/supplyRequests";

import Button from "../../common/button/Button";
import FormField from "../../common/formField/FormField";
import Message from "../../common/message/Message";

// lunghezza massima del motivo, come nel backend
const MAX_REASON_LENGTH = 200;

// componente RejectSupplyForm: modulo "Respingi" con il motivo obbligatorio (il dipendente lo legge).
// props: request = la richiesta, onSaved, onCancel
const RejectSupplyForm = ({ request, onSaved, onCancel }) => {
  // errore del server
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { reason: "" } });

  // respingo la richiesta (trim: solo spazi non vale)
  const onSubmit = async ({ reason }) => {
    setServerError("");
    try {
      await rejectSupplyRequest(request._id, reason.trim());
      onSaved();
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="form-stack">
      {serverError && <Message type="error">{serverError}</Message>}

      {/* quale richiesta sto respingendo */}
      <p className="m-0">
        <strong>
          {request.requestedAmount} pz di {request.product.name}
        </strong>{" "}
        per {request.store.name}. Il motivo lo legge chi ha fatto la richiesta.
      </p>

      <FormField
        label="Motivo"
        htmlFor="reject-reason"
        error={errors.reason?.message}
      >
        <textarea
          id="reject-reason"
          rows={3}
          className="form-input"
          placeholder="Per esempio: non verrà più prodotto"
          aria-invalid={errors.reason ? "true" : "false"}
          {...register("reason", {
            validate: (value) =>
              value.trim() !== "" || "Scrivi perché respingi la richiesta",
            maxLength: {
              value: MAX_REASON_LENGTH,
              message: `Al massimo ${MAX_REASON_LENGTH} caratteri`,
            },
          })}
        />
      </FormField>

      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Indietro
        </Button>
        <Button type="submit" variant="danger" disabled={isSubmitting}>
          {isSubmitting ? "Salvataggio..." : "Respingi"}
        </Button>
      </div>
    </form>
  );
};

export default RejectSupplyForm;
