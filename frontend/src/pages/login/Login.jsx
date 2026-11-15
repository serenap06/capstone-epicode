import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { getHomePath } from "../../utils/getHomePath";
import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Alert,
  Container,
  Form,
  FormControl,
  Button,
  FormLabel,
  FormCheck,
} from "react-bootstrap";
import { Lock, User } from "lucide-react";
import "./login.css";

// pagina di accesso: email, password e "Ricordami"
const Login = () => {
  // useForm: register collega i campi, handleSubmit li controlla prima dell'invio
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  // serverError: l'errore del server (per esempio password sbagliata)
  const [serverError, setServerError] = useState("");

  // aspetto di sapere se c'è un utente; se è già collegato va alla sua pagina
  if (loading) return null;
  if (user) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  // invio: login e poi la pagina del ruolo
  const onSubmit = async ({ email, password, remember }) => {
    setServerError("");
    try {
      const loggedUser = await login(email, password, remember);
      navigate(getHomePath(loggedUser.role));
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <Container className="login-page">
      <h1 className="login-title">LOGIN</h1>

      {/* errore del server */}
      {serverError && <Alert className="mx-3">{serverError}</Alert>}

      <Form
        // noValidate: i controlli li fa react-hook-form, non il browser
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="login-form mt-4"
      >
        {/* etichetta solo per gli screen reader, icona dentro il campo */}
        <Form.Group className="mb-3" controlId="email">
          <FormLabel visuallyHidden>Email</FormLabel>
          <div className="login-field">
            <User className="login-icon" />
            <FormControl
              placeholder="email"
              type="email"
              className="login-input"
              {...register("email", { required: "Email obbligatoria" })}
            />
          </div>
          {errors.email && (
            <p className="login-error">{errors.email.message}</p>
          )}
        </Form.Group>
        {/* campo password, stessa struttura */}
        <Form.Group className="mb-3" controlId="password">
          <FormLabel visuallyHidden>Password</FormLabel>
          <div className="login-field">
            <Lock className="login-icon" />
            <FormControl
              placeholder="password"
              type="password"
              className="login-input"
              {...register("password", { required: "Password obbligatoria" })}
            />
          </div>
          {errors.password && (
            <p className="login-error">{errors.password.message}</p>
          )}
        </Form.Group>
        {/* "Ricordami": il token resta anche chiudendo il browser */}
        <FormCheck
          type="checkbox"
          id="remember"
          label="Ricordami"
          className="login-remember m-4"
          {...register("remember")}
        />

        {/* disattivato mentre aspetto: niente doppio invio */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="login-button w-100"
        >
          {isSubmitting ? "accesso in corso" : "accedi"}
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
