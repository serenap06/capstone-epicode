import "./formField.css";

// un campo del modulo con la sua etichetta e il messaggio di errore.
// label: il testo dell'etichetta; htmlFor: l'id del campo, così cliccando sull'etichetta
// si va nel campo; error: il messaggio da mostrare se il campo è sbagliato;
// children: il campo vero e proprio (input, select, textarea), scritto dalla pagina
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
