import "./button.css";

// bottone comune dell'app.
// variant: "primary" (magenta pieno, l'azione principale), "secondary" (bianco con bordo,
// per Annulla e azioni secondarie), "danger" (per eliminare).
// type: di default "button"; nei moduli il bottone che invia va scritto con type="submit".
// ...props raccoglie tutte le altre props (onClick, disabled, aria-label...)
// e le passa al <button> così come sono, senza doverle elencare una per una
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
