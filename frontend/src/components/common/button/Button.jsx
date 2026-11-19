// import
import "./button.css";

// componente Button: il bottone dell'app.
// props: variant = primary, secondary o danger; type di base "button" ("submit" per i moduli);
// ...props = tutto il resto (onClick, disabled, aria-label...)
const Button = ({
  variant = "primary",
  type = "button",
  className = "",
  children,
  ...props
}) => {
  return (
    <button
      type={type}
      className={`app-button app-button-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
