import "./filterBar.css";
import { useId } from "react";

// menu "Ordina" per la vista a card, dove non ci sono intestazioni da cliccare.
// options: [{ field, direction, label }]; sort: l'ordine scelto ({ field, direction });
// defaultSort: l'ordine con cui parte la pagina. Ogni voce ha come valore "campo-direzione"
// (per esempio "amount-desc"); la prima voce, "Ordina per", vale "" e rimette l'ordine di partenza
const SortSelect = ({ options, sort, defaultSort, onChange }) => {
  // id unico per collegare l'etichetta al menu
  const selectId = useId();

  // con l'ordine di partenza il menu mostra "Ordina per", così si capisce a cosa serve
  const isDefaultSort =
    sort.field === defaultSort.field &&
    sort.direction === defaultSort.direction;

  // dalla voce scelta ("amount-desc") torno all'oggetto { field, direction }
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
      {/* etichetta letta solo dagli screen reader */}
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
        {/* l'ordine di partenza non si ripete: è già "Ordina per" */}
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
