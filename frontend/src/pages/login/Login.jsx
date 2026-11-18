import "./login.css";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Container,
  Form,
  FormCheck,
  FormControl,
  FormLabel,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Lock, User } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { getHomePath } from "../../utils/getHomePath";

import Button from "../../components/common/button/Button";
import Message from "../../components/common/message/Message";
import PasswordInput from "../../components/common/passwordInput/PasswordInput";

// password degli account demo, dal file .env (VITE_DEMO_PASSWORD): non è scritta nel codice.
// Se manca, i bottoni della demo non compaiono
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD;

// i due account della demo, uno per ruolo
const DEMO_ACCOUNTS = [
  { label: "Responsabile", email: "responsabile@demo.it" },
  { label: "Dipendente", email: "marta@demo.it" },
];

// pagina di accesso: logo, email, password, "Ricordami" e i bottoni della demo
const Login = () => {
  // useForm: register collega i campi, handleSubmit li controlla prima dell'invio;
  // setValue scrive in un campo (lo usano i bottoni della demo)
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
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

  // bottone della demo: riempie email e password, poi si preme "Accedi"
  const fillDemo = (email) => {
    setValue("email", email);
    setValue("password", DEMO_PASSWORD);
    clearErrors();
    setServerError("");
  };

  return (
    <Container className="login-page">
      {/* logo come nella barra in alto, più grande */}
      <p className="app-logo login-logo">
        Store<span>Squad</span>
      </p>
      <p className="login-tagline">Il gestionale dei punti vendita</p>
      <h1 className="login-title">Accedi</h1>

      {/* errore del server, come nelle altre pagine */}
      {serverError && <Message type="error">{serverError}</Message>}

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
            <User className="login-icon" aria-hidden="true" />
            <FormControl
              placeholder="Email"
              type="email"
              autoComplete="email"
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
            <Lock className="login-icon" aria-hidden="true" />
            {/* PasswordInput: il campo con l'occhio per vedere la password.
                id="password" come il controlId del gruppo, così l'etichetta resta collegata */}
            <PasswordInput
              id="password"
              placeholder="Password"
              autoComplete="current-password"
              className="form-control login-input"
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
          className="login-remember my-4"
          {...register("remember")}
        />

        {/* il bottone comune dell'app, a pillola; spento mentre aspetto: niente doppio invio */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="login-button w-100"
        >
          {isSubmitting ? "Accesso in corso..." : "Accedi"}
        </Button>
      </Form>

      {/* demo: un bottone per ruolo riempie i campi, così chi prova l'app non deve
          ricordarsi email e password */}
      {DEMO_PASSWORD && (
        <section className="login-demo" aria-label="Prova la demo">
          <p className="login-demo-title">Prova la demo come</p>
          <div className="login-demo-buttons">
            {DEMO_ACCOUNTS.map((account) => (
              <Button
                key={account.email}
                variant="secondary"
                onClick={() => fillDemo(account.email)}
              >
                {account.label}
              </Button>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
};

export default Login;
