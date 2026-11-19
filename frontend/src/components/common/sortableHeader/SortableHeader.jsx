// import
import "./sortableHeader.css";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

// componente SortableHeader: intestazione che ordina la tabella al clic.
// props: label, field = il campo della colonna, sort = l'ordine scelto, onSort(field), className
const SortableHeader = ({ label, field, sort, onSort, className }) => {
  const isActive = sort.field === field;
  const isAscending = sort.direction === "asc";

  // freccia: su e giù se la colonna non è scelta, altrimenti la direzione
  let Icon = ArrowUpDown;
  if (isActive) Icon = isAscending ? ArrowUp : ArrowDown;

  // aria-sort: come è ordinata la colonna, per lo screen reader
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
