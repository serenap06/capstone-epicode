// import
import "./formField.css";

// componente FormField: campo del modulo con etichetta ed errore.
// props: label, htmlFor = l'id del campo, error, children = input, select o textarea
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
