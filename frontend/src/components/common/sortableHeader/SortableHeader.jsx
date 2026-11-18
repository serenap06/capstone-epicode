import "./sortableHeader.css";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

// intestazione di colonna che ordina la tabella al clic.
// field: il campo di questa colonna; sort: l'ordine scelto ora ({ field, direction });
// onSort(field): la pagina calcola il nuovo ordine
const SortableHeader = ({ label, field, sort, onSort, className }) => {
  const isActive = sort.field === field;
  const isAscending = sort.direction === "asc";

  // la freccia: su e giù grigia se la colonna non è scelta, altrimenti la direzione
  let Icon = ArrowUpDown;
  if (isActive) Icon = isAscending ? ArrowUp : ArrowDown;

  // aria-sort dice agli screen reader come è ordinata la colonna
  let ariaSort = "none";
  if (isActive) ariaSort = isAscending ? "ascending" : "descending";

  return (
    <th scope="col" className={className} aria-sort={ariaSort}>
      <button
        type="button"
        className={`sortable-header ${isActive ? "sortable-header-active" : ""}`}
        onClick={() => onSort(field)}
      >
        {label}
        <Icon size={14} aria-hidden="true" />
      </button>
    </th>
  );
};

export default SortableHeader;
