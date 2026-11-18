import { useState } from "react";
import { useForm } from "react-hook-form";

import { rejectSupplyRequest } from "../../../api/supplyRequests";

import Button from "../../common/button/Button";
import FormField from "../../common/formField/FormField";
import Message from "../../common/message/Message";

// lunghezza massima del motivo, come nel backend
const MAX_REASON_LENGTH = 200;

// modulo "Respingi richiesta", nel modale (solo il responsabile): il motivo è obbligatorio,
// così il dipendente sa perché la fornitura non arriverà.
// request: la richiesta da respingere; onSaved: dopo il salvataggio; onCancel: chiude senza fare niente
const RejectSupplyForm = ({ request, onSaved, onCancel }) => {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { reason: "" } });

  // trim: un motivo fatto solo di spazi non vale
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

      {/* quale richiesta sto respingendo, per non sbagliare riga */}
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
