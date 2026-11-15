import "./formField.css";

// campo del modulo con etichetta ed errore. htmlFor: l'id del campo (cliccando
// l'etichetta si va nel campo); children: l'input, il select o il textarea
const FormField = ({ label, htmlFor, error, children }) => {
  return (
    <div className="form-field">
      <label htmlFor={htmlFor} className="form-field-label">
        {label}
      </label>
      {children}
      {error && (
        <p className="form-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
