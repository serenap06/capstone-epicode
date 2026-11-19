// import
import "./filterBar.css";

// componente FilterChips: pulsanti a scelta singola (Tutte / Da fare / Fatte).
// props: label = nome del gruppo, options = [{ value, label }], value = la scelta, onChange
const FilterChips = ({ label, options, value, onChange }) => {
  return (
    <div className="filter-chips" role="group" aria-label={label}>
      {options.map((option) => (
        // aria-pressed segna il pulsante scelto (anche per il CSS)
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
