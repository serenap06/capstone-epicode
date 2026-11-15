import "./filterBar.css";

// gruppo di pulsanti a scelta singola, per esempio Tutte / Da fare / Fatte.
// label: nome del gruppo per gli screen reader ("Stato")
// options: [{ value, label }] → value va al codice, label è il testo del pulsante
// value: il valore scelto adesso; onChange riceve il nuovo valore quando si clicca
const FilterChips = ({ label, options, value, onChange }) => {
  return (
    <div className="filter-chips" role="group" aria-label={label}>
      {options.map((option) => (
        // aria-pressed dice se il pulsante è quello scelto: serve agli screen reader
        // e al CSS, che colora il pulsante con [aria-pressed="true"]
        <button
          key={option.value}
          type="button"
          className="filter-chip"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default FilterChips;
