// import
import { useState } from "react";
import { useForm } from "react-hook-form";
import { changePassword } from "../../../api/users";
import Button from "../../common/button/Button";
import FormField from "../../common/formField/FormField";
import Message from "../../common/message/Message";
import PasswordInput from "../../common/passwordInput/PasswordInput";

// componente PasswordForm: cambio della mia password nel Profilo (attuale, nuova e conferma).
// L'attuale la controlla il server, che le due nuove coincidano lo controllo qui
const PasswordForm = () => {
  // errore del server e "Password cambiata"
  const [serverError, setServerError] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // salvo e svuoto i campi con reset
  const onSubmit = async (formData) => {
    setServerError("");
    setIsSaved(false);
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      reset();
      setIsSaved(true);
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="form-stack">
      {serverError && <Message type="error">{serverError}</Message>}

      {/* autoComplete aiuta il gestore delle password */}
      <FormField
        label="Password attuale"
        htmlFor="current-password"
        error={errors.currentPassword?.message}
      >
        <PasswordInput
          id="current-password"
          autoComplete="current-password"
          className="form-input"
          aria-invalid={errors.currentPassword ? "true" : "false"}
          {...register("currentPassword", {
            required: "Scrivi la password attuale",
          })}
        />
      </FormField>

      <div className="form-row">
        <FormField
          label="Nuova password"
          htmlFor="new-password"
          error={errors.newPassword?.message}
        >
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            className="form-input"
            aria-invalid={errors.newPassword ? "true" : "false"}
            {...register("newPassword", {
              required: "Scrivi la nuova password",
              minLength: { value: 8, message: "Almeno 8 caratteri" },
            })}
          />
        </FormField>
        {/* la conferma deve essere uguale alla nuova */}
        <FormField
          label="Ripeti la nuova password"
          htmlFor="confirm-password"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            className="form-input"
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            {...register("confirmPassword", {
              required: "Ripeti la nuova password",
              validate: (value, formValues) =>
                value === formValues.newPassword ||
                "Le due password sono diverse",
            })}
          />
        </FormField>
      </div>

      <div className="form-actions align-items-center">
        {isSaved && (
          <span className="profile-saved" role="status">
            Password cambiata
          </span>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvataggio..." : "Cambia password"}
        </Button>
      </div>
    </form>
  );
};

export default PasswordForm;
