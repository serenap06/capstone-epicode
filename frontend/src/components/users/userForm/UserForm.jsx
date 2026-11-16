import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { createUser, updateUser } from "../../../api/users";
import Button from "../../common/button/Button";
import FormField from "../../common/formField/FormField";
import Message from "../../common/message/Message";
import PasswordInput from "../../common/passwordInput/PasswordInput";

// modulo di un utente, nel modale. user: quello da modificare, oppure null per uno nuovo.
// La password si sceglie solo alla creazione (il backend non la cambia in modifica).
// isSelf: true se sto modificando me stessa, così il ruolo non si può cambiare
const UserForm = ({ user, stores, isSelf, onSaved, onCancel }) => {
  const [serverError, setServerError] = useState("");
  const isEditing = Boolean(user);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name ?? "",
      surname: user?.surname ?? "",
      email: user?.email ?? "",
      password: "",
      role: user?.role ?? "employee",
      store: user?.store?._id ?? "",
      weeklyHours: user?.weeklyHours ?? "",
    },
  });

  // negozio e ore servono solo ai dipendenti: li mostro solo con quel ruolo
  const isEmployee = (useWatch({ control, name: "role" }) ?? user?.role) === "employee";

  const onSubmit = async (formData) => {
    setServerError("");
    // un campo spento (il ruolo quando modifico me stessa) non arriva in formData
    const role = formData.role ?? user.role;
    const employee = role === "employee";
    const userData = {
      name: formData.name,
      surname: formData.surname,
      email: formData.email,
      role,
      store: employee ? formData.store : undefined,
      // ore vuote = non le mando; altrimenti da testo a numero
      weeklyHours:
        employee && formData.weeklyHours !== ""
          ? Number(formData.weeklyHours)
          : undefined,
    };
    try {
      if (isEditing) {
        await updateUser(user._id, userData);
      } else {
        await createUser({ ...userData, password: formData.password });
      }
      onSaved(user);
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="form-stack">
      {serverError && <Message type="error">{serverError}</Message>}

      <div className="form-row">
        <FormField label="Nome" htmlFor="user-name" error={errors.name?.message}>
          <input
            id="user-name"
            type="text"
            className="form-input"
            aria-invalid={errors.name ? "true" : "false"}
            {...register("name", { required: "Scrivi il nome" })}
          />
        </FormField>
        <FormField
          label="Cognome"
          htmlFor="user-surname"
          error={errors.surname?.message}
        >
          <input
            id="user-surname"
            type="text"
            className="form-input"
            aria-invalid={errors.surname ? "true" : "false"}
            {...register("surname", { required: "Scrivi il cognome" })}
          />
        </FormField>
      </div>

      <FormField label="Email" htmlFor="user-email" error={errors.email?.message}>
        <input
          id="user-email"
          type="email"
          className="form-input"
          aria-invalid={errors.email ? "true" : "false"}
          {...register("email", {
            required: "Scrivi l'email",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Email non valida" },
          })}
        />
      </FormField>

      {/* la password solo per un utente nuovo: almeno 8 caratteri, come nel backend */}
      {!isEditing && (
        <FormField
          label="Password"
          htmlFor="user-password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="user-password"
            autoComplete="new-password"
            className="form-input"
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password", {
              required: "Scrivi la password",
              minLength: { value: 8, message: "Almeno 8 caratteri" },
            })}
          />
        </FormField>
      )}

      <div className="form-row">
        <FormField label="Ruolo" htmlFor="user-role">
          <select
            id="user-role"
            className="form-input"
            disabled={isSelf}
            {...register("role")}
          >
            <option value="employee">Dipendente</option>
            <option value="admin">Responsabile</option>
          </select>
        </FormField>

        {/* il negozio è obbligatorio solo per i dipendenti */}
        {isEmployee && (
          <FormField
            label="Negozio"
            htmlFor="user-store"
            error={errors.store?.message}
          >
            <select
              id="user-store"
              className="form-input"
              aria-invalid={errors.store ? "true" : "false"}
              {...register("store", {
                validate: (value, formValues) =>
                  formValues.role !== "employee" ||
                  value !== "" ||
                  "Scegli il negozio",
              })}
            >
              <option value="">Scegli un negozio</option>
              {stores.map((store) => (
                <option key={store._id} value={store._id}>
                  {store.name}
                </option>
              ))}
            </select>
          </FormField>
        )}
      </div>
      {isSelf && (
        <p className="form-hint m-0">Il tuo ruolo non si può cambiare da qui.</p>
      )}

      {isEmployee && (
        <FormField
          label="Ore settimanali di contratto"
          htmlFor="user-hours"
          error={errors.weeklyHours?.message}
        >
          <input
            id="user-hours"
            type="number"
            min="0"
            inputMode="numeric"
            className="form-input"
            aria-invalid={errors.weeklyHours ? "true" : "false"}
            {...register("weeklyHours", {
              validate: (value) =>
                value === "" ||
                (Number.isInteger(Number(value)) && Number(value) >= 0) ||
                "Scrivi un numero intero da 0 in su",
            })}
          />
        </FormField>
      )}

      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvataggio..." : isEditing ? "Salva" : "Crea utente"}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
