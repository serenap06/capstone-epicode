// import
import "./filterBar.css";
import { useId } from "react";

// componente SortSelect: menu "Ordina" delle card (lì non ci sono intestazioni da cliccare).
// props: options = [{ field, direction, label }], sort = l'ordine scelto, defaultSort, onChange.
// Ogni voce vale "campo-direzione" (es. "amount-desc"); "Ordina per" vale "" = ordine di partenza
const SortSelect = ({ options, sort, defaultSort, onChange }) => {
  // id per collegare etichetta e menu
  const selectId = useId();

  // con l'ordine di partenza si vede "Ordina per"
  const isDefaultSort =
    sort.field === defaultSort.field &&
    sort.direction === defaultSort.direction;

  // da "amount-desc" a { field, direction }
  const changeSort = (value) => {
    if (value === "") {
      onChange(defaultSort);
      return;
    }
    const [field, direction] = value.split("-");
    onChange({ field, direction });
  };

  return (
    <div className="sort-select">
      {/* etichetta solo per lo screen reader */}
      <label htmlFor={selectId} className="visually-hidden">
        Ordina
      </label>
      <select
        id={selectId}
        className="filter-select"
        value={isDefaultSort ? "" : `${sort.field}-${sort.direction}`}
        onChange={(event) => changeSort(event.target.value)}
      >
        <option value="">Ordina per</option>
        {/* l'ordine di partenza non si ripete */}
        {options
          .filter(
            (option) =>
              option.field !== defaultSort.field ||
              option.direction !== defaultSort.direction,
          )
          .map((option) => (
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
