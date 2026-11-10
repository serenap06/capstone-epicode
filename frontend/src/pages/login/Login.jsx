import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
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

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  if (loading) return null;
  if (user) {
    return (
      <Navigate to={user.role === "admin" ? "/admin" : "/employee"} replace />
    );
  }

  const onSubmit = async ({ email, password, remember }) => {
    setServerError("");
    try {
      const loggedUser = await login(email, password, remember);
      navigate(loggedUser.role === "admin" ? "/admin" : "/employee");
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <Container className="login-page">
      <h1 className="login-title">LOGIN</h1>

      {serverError && <Alert className="mx-3">{serverError}</Alert>}

      <Form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="login-form mt-4"
      >
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
        <FormCheck
          type="checkbox"
          id="remember"
          label="Ricordami"
          className="login-remember m-4"
          {...register("remember")}
        />

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
