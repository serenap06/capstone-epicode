// import
import "./filterBar.css";
import { Dropdown } from "react-bootstrap";
import { SlidersHorizontal } from "lucide-react";

// componente FilterBar: i filtri in riga, oppure (compact) nel menu "Filtri".
// props: compact, activeCount = il numero nel pallino, children = i filtri
const FilterBar = ({ compact = false, activeCount = 0, children }) => {
  if (compact) {
    return (
      // menu a destra (align="end"), si chiude solo cliccando fuori
      <Dropdown align="end" autoClose="outside" className="filter-dropdown">
        {/* aria-label: il nome resta anche quando la scritta è nascosta */}
        <Dropdown.Toggle
          variant="light"
          className="filter-dropdown-toggle"
          aria-label="Filtri"
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          <span className="filter-dropdown-label">Filtri</span>
          {activeCount > 0 && (
            <span className="filter-dropdown-count">{activeCount}</span>
          )}
        </Dropdown.Toggle>
        <Dropdown.Menu className="filter-dropdown-menu">
          <section className="filter-dropdown-content" aria-label="Filtri">
            {children}
          </section>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  return (
    <section className="filter-bar" aria-label="Filtri">
      {children}
    </section>
  );
};

export default FilterBar;
