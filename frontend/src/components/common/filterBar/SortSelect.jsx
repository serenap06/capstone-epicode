import "./filterBar.css";
import { useId } from "react";

// menu "Ordina" per la vista a card, dove non ci sono intestazioni da cliccare.
// options: [{ field, direction, label }]; sort: l'ordine scelto ({ field, direction }).
// Ogni voce ha come valore "campo-direzione" (per esempio "amount-desc")
const SortSelect = ({ options, sort, onChange }) => {
  // id unico per collegare l'etichetta al menu
  const selectId = useId();

  // dalla voce scelta ("amount-desc") torno all'oggetto { field, direction }
  const changeSort = (value) => {
    const [field, direction] = value.split("-");
    onChange({ field, direction });
  };

  return (
    <div className="sort-select">
      {/* etichetta letta solo dagli screen reader */}
      <label htmlFor={selectId} className="visually-hidden">
        Ordina
      </label>
      <select
        id={selectId}
        className="filter-select"
        value={`${sort.field}-${sort.direction}`}
        onChange={(event) => changeSort(event.target.value)}
      >
        {options.map((option) => (
          <option
            key={`${option.field}-${option.direction}`}
            value={`${option.field}-${option.direction}`}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortSelect;
