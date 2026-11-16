import "./filterBar.css";
import { useId } from "react";
import { Search } from "lucide-react";

// campo di ricerca dei filtri: pillola bianca con la lente.
// label: il testo per lo screen reader, usato anche come segnaposto; onChange riceve il testo scritto
const FilterSearch = ({ label, value, onChange }) => {
  const inputId = useId();

  return (
    <div className="filter-search">
      <label htmlFor={inputId} className="visually-hidden">
        {label}
      </label>
      <Search className="filter-search-icon" size={16} aria-hidden="true" />
      <input
        id={inputId}
        type="search"
        className="filter-search-input"
        placeholder={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};

export default FilterSearch;
