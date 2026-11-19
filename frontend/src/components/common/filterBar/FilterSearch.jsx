// import
import "./filterBar.css";
import { useId } from "react";
import { Search } from "lucide-react";

// componente FilterSearch: il campo di ricerca con la lente.
// props: label = testo nascosto e segnaposto, value, onChange = riceve il testo scritto
const FilterSearch = ({ label, value, onChange }) => {
  // id per collegare etichetta e campo
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
