import "./filterBar.css";

// pulsanti a scelta singola, per esempio Tutte / Da fare / Fatte.
// label: nome del gruppo per gli screen reader; options: [{ value, label }]
const FilterChips = ({ label, options, value, onChange }) => {
  return (
    <div className="filter-chips" role="group" aria-label={label}>
      {options.map((option) => (
        // aria-pressed segna il pulsante scelto, per gli screen reader e per il CSS
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
