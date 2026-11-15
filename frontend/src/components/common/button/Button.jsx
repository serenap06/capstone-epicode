import "./button.css";

// bottone comune. variant: "primary" (magenta), "secondary" (bianco), "danger" (eliminare).
// type di base "button": per inviare un modulo scrivo type="submit".
// ...props passa al <button> tutto il resto (onClick, disabled, aria-label...)
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
