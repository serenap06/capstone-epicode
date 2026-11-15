import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { createTask } from "../../../api/tasks";
import { CATEGORY } from "../../../utils/taskLabel";
import { formatFullName } from "../../../utils/formatFullName";
import Button from "../../common/button/Button";
import FormField from "../../common/formField/FormField";
import Message from "../../common/message/Message";

// opzioni fisse dei menu a tendina: value va al server, label è il testo che si legge
const PRIORITY_OPTIONS = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Media" },
  { value: "low", label: "Bassa" },
];

const TYPE_OPTIONS = [
  { value: "daily", label: "Giornaliera" },
  { value: "monthly", label: "Mensile" },
];

// modulo per creare una task, dentro il modale "Nuova task".
// stores ed employees arrivano dalla pagina; onCreated e onCancel sono funzioni della pagina
const TaskForm = ({ stores, employees, onCreated, onCancel }) => {
  // errore che arriva dal server (per esempio un negozio senza dipendenti)
  const [serverError, setServerError] = useState("");

  // useForm gestisce i campi. defaultValues sono i valori iniziali:
  // priorità media, categoria operativa, tipo giornaliera, nessuna persona scelta
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

  // useWatch legge un campo mentre l'utente compila e ridisegna il modulo quando cambia:
  // mi serve per mostrare i dipendenti del negozio scelto e per nascondere
  // l'elenco quando la task è "A tutto il negozio".
  // control è il "collegamento" al modulo creato da useForm
  const selectedStore = useWatch({ control, name: "store" });
  const isGlobal = useWatch({ control, name: "isGlobal" });

  // solo i dipendenti del negozio scelto (il backend crea le task in un negozio solo)
  const storeEmployees = employees.filter(
    (employee) => employee.store?._id === selectedStore,
  );

  // quando cambio negozio tolgo le spunte: altrimenti resterebbe scelta
  // una persona dell'altro negozio
  useEffect(() => {
    setValue("assignedTo", []);
  }, [selectedStore, setValue]);

  // all'invio: handleSubmit controlla prima i campi obbligatori,
  // poi chiama onSubmit con tutti i valori in formData
  const onSubmit = async (formData) => {
    setServerError("");
    try {
      await createTask({
        ...formData,
        // descrizione vuota → undefined, cioè non la mando: il database non accetta testo vuoto
        description: formData.description || undefined,
        // il campo dà "2026-11-15T17:00" senza fuso orario: toISOString lo trasforma
        // nell'ora esatta, così il server non la legge come ora di un altro paese
        dueDate: new Date(formData.dueDate).toISOString(),
        // se è globale le persone le sceglie il server (tutti i dipendenti del negozio)
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

      {/* form-columns: due blocchi affiancati da 992px in su, uno sotto l'altro prima */}
      <div className="form-columns">
        {/* a sinistra: i dettagli della task */}
        <div className="form-stack">
          {/* errors.title?.message: il ?. serve perché errors.title esiste solo se il campo è sbagliato.
              aria-invalid colora il bordo del campo sbagliato (vedi formField.css) */}
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

          {/* textarea: un campo di testo su più righe (rows = quante righe si vedono) */}
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
              {/* datetime-local: il browser mostra il calendario con l'orario */}
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
              {/* Object.entries trasforma CATEGORY in coppie ["operations", "Operativa"]:
                  così le opzioni arrivano da taskLabel.js e non le riscrivo */}
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

        {/* a destra: negozio e persone, raggruppati sotto il titolo "Assegnazione" (legend) */}
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
              {/* prima voce vuota: finché resta questa, il campo è da compilare */}
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
          {/* le caselle hanno tutte il nome "assignedTo": react-hook-form mette in un array
              i value di quelle spuntate, cioè gli id delle persone, come vuole il backend.
              validate: va bene se la task è globale, oppure se c'è almeno una persona,
              altrimenti restituisce il messaggio di errore */}
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

      {/* Annulla chiude il modale; Crea task invia il modulo (type="submit").
          Mentre aspetto il server il bottone è disattivato, così non si crea due volte */}
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
