import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { createTask } from "../../../api/tasks";
import { CATEGORY } from "../../../utils/taskLabel";
import { formatFullName } from "../../../utils/formatFullName";
import Button from "../../common/button/Button";
import FormField from "../../common/formField/FormField";
import Message from "../../common/message/Message";

// opzioni fisse: value va al server, label si legge
const PRIORITY_OPTIONS = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Media" },
  { value: "low", label: "Bassa" },
];

const TYPE_OPTIONS = [
  { value: "daily", label: "Giornaliera" },
  { value: "monthly", label: "Mensile" },
];

// modulo "Nuova task"; stores, employees, onCreated e onCancel arrivano dalla pagina
const TaskForm = ({ stores, employees, onCreated, onCancel }) => {
  // errore del server (per esempio un negozio senza dipendenti)
  const [serverError, setServerError] = useState("");

  // useForm gestisce i campi; defaultValues: i valori iniziali
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      category: "operations",
      type: "daily",
      store: "",
      isGlobal: false,
      assignedTo: [],
    },
  });

  // useWatch rilegge il campo a ogni modifica: mi serve per mostrare
  // i dipendenti del negozio scelto e nasconderli se la task è globale
  const selectedStore = useWatch({ control, name: "store" });
  const isGlobal = useWatch({ control, name: "isGlobal" });

  // solo i dipendenti del negozio scelto
  const storeEmployees = employees.filter(
    (employee) => employee.store?._id === selectedStore,
  );

  // cambiando negozio tolgo le spunte (erano persone dell'altro negozio)
  useEffect(() => {
    setValue("assignedTo", []);
  }, [selectedStore, setValue]);

  // handleSubmit controlla i campi e poi chiama onSubmit con i valori
  const onSubmit = async (formData) => {
    setServerError("");
    try {
      await createTask({
        ...formData,
        // descrizione vuota: non la mando (il database non accetta testo vuoto)
        description: formData.description || undefined,
        // toISOString: l'ora giusta con il fuso orario, per il server
        dueDate: new Date(formData.dueDate).toISOString(),
        // globale: le persone le sceglie il server
        assignedTo: formData.isGlobal ? undefined : formData.assignedTo,
      });
      onCreated();
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    // noValidate: i controlli li fa react-hook-form, non il browser
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="form-stack"
    >
      {serverError && <Message type="error">{serverError}</Message>}

      {/* due blocchi: affiancati da 992px, uno sotto l'altro prima */}
      <div className="form-columns">
        {/* a sinistra: i dettagli della task */}
        <div className="form-stack">
          {/* errors.title c'è solo se il campo è sbagliato; aria-invalid colora il bordo */}
          <FormField
            label="Titolo"
            htmlFor="task-title"
            error={errors.title?.message}
          >
            <input
              id="task-title"
              type="text"
              className="form-input"
              aria-invalid={errors.title ? "true" : "false"}
              {...register("title", { required: "Scrivi il titolo" })}
            />
          </FormField>

          {/* textarea: testo su più righe (rows = righe visibili) */}
          <FormField label="Descrizione" htmlFor="task-description">
            <textarea
              id="task-description"
              rows={2}
              className="form-input"
              {...register("description")}
            />
          </FormField>

          {/* scadenza e priorità sulla stessa riga */}
          <div className="form-row">
            <FormField
              label="Scadenza"
              htmlFor="task-due"
              error={errors.dueDate?.message}
            >
              {/* datetime-local: calendario con l'orario */}
              <input
                id="task-due"
                type="datetime-local"
                className="form-input"
                aria-invalid={errors.dueDate ? "true" : "false"}
                {...register("dueDate", { required: "Scegli la scadenza" })}
              />
            </FormField>
            <FormField label="Priorità" htmlFor="task-priority">
              <select
                id="task-priority"
                className="form-input"
                {...register("priority")}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* categoria e tipo sulla stessa riga */}
          <div className="form-row">
            <FormField label="Categoria" htmlFor="task-category">
              {/* opzioni da taskLabel.js: Object.entries dà le coppie [valore, testo] */}
              <select
                id="task-category"
                className="form-input"
                {...register("category")}
              >
                {Object.entries(CATEGORY).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Tipo" htmlFor="task-type">
              <select
                id="task-type"
                className="form-input"
                {...register("type")}
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* a destra: negozio e persone, sotto il titolo "Assegnazione" */}
        <fieldset className="form-fieldset">
          <legend>Assegnazione</legend>
          <FormField
            label="Negozio"
            htmlFor="task-store"
            error={errors.store?.message}
          >
            <select
              id="task-store"
              className="form-input"
              aria-invalid={errors.store ? "true" : "false"}
              {...register("store", { required: "Scegli il negozio" })}
            >
              {/* voce vuota: il campo resta da compilare */}
              <option value="">Scegli un negozio</option>
              {stores.map((store) => (
                <option key={store._id} value={store._id}>
                  {store.name}
                </option>
              ))}
            </select>
          </FormField>

          <label className="form-check-row">
            <input type="checkbox" {...register("isGlobal")} />
            A tutto il negozio
          </label>
          {!selectedStore && (
            <p className="form-hint m-0">Scegli prima il negozio</p>
          )}
          {/* le caselle "assignedTo" danno un array con gli id spuntati, come vuole il backend.
              validate: va bene se è globale o se c'è almeno una persona */}
          {!isGlobal &&
            storeEmployees.map((employee) => (
              <label key={employee._id} className="form-check-row">
                <input
                  type="checkbox"
                  value={employee._id}
                  {...register("assignedTo", {
                    validate: (value, formValues) =>
                      formValues.isGlobal ||
                      value.length > 0 ||
                      "Scegli almeno una persona",
                  })}
                />
                {formatFullName(employee)}
              </label>
            ))}
          {errors.assignedTo && (
            <p className="form-field-error" role="alert">
              {errors.assignedTo.message}
            </p>
          )}
          <p className="form-hint m-0">
            Verrà creata una copia della task per ogni persona.
          </p>
        </fieldset>
      </div>

      {/* Crea task invia il modulo (type="submit") e si disattiva mentre aspetto il server */}
      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creazione..." : "Crea task"}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
