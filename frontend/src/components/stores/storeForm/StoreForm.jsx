import { useState } from "react";
import { useForm } from "react-hook-form";
import { createStore, updateStore } from "../../../api/stores";
import Button from "../../common/button/Button";
import FormField from "../../common/formField/FormField";
import Message from "../../common/message/Message";

// modulo del negozio, nel modale. store: quello da modificare, oppure null per uno nuovo
const StoreForm = ({ store, onSaved, onCancel }) => {
  const [serverError, setServerError] = useState("");
  const isEditing = Boolean(store);

  // con un negozio nuovo store è null: ?. e ?? "" fanno partire i campi vuoti
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: store?.name ?? "",
      address: store?.address ?? "",
      city: store?.city ?? "",
    },
  });

  const onSubmit = async (formData) => {
    setServerError("");
    try {
      if (isEditing) {
        await updateStore(store._id, formData);
      } else {
        await createStore(formData);
      }
      onSaved();
    } catch (e) {
      setServerError(e.message);
    }
  };

  const submitLabel = isEditing ? "Salva" : "Crea negozio";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="form-stack">
      {serverError && <Message type="error">{serverError}</Message>}
      <FormField label="Nome" htmlFor="store-name" error={errors.name?.message}>
        <input
          id="store-name"
          type="text"
          className="form-input"
          aria-invalid={errors.name ? "true" : "false"}
          {...register("name", { required: "Scrivi il nome" })}
        />
      </FormField>
      <div className="form-row">
        <FormField
          label="Indirizzo"
          htmlFor="store-address"
          error={errors.address?.message}
        >
          <input
            id="store-address"
            type="text"
            className="form-input"
            aria-invalid={errors.address ? "true" : "false"}
            {...register("address", { required: "Scrivi l'indirizzo" })}
          />
        </FormField>
        <FormField
          label="Città"
          htmlFor="store-city"
          error={errors.city?.message}
        >
          <input
            id="store-city"
            type="text"
            className="form-input"
            aria-invalid={errors.city ? "true" : "false"}
            {...register("city", { required: "Scrivi la città" })}
          />
        </FormField>
      </div>
      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvataggio..." : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default StoreForm;
