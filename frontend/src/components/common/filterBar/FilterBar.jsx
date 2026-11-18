import "./filterBar.css";
import { Dropdown } from "react-bootstrap";
import { SlidersHorizontal } from "lucide-react";

// contenitore dei filtri: in riga, oppure (compact) chiusi nel menu "Filtri" per gli schermi piccoli.
// activeCount: il numero nel pallino accanto a "Filtri"
const FilterBar = ({ compact = false, activeCount = 0, children }) => {
  if (compact) {
    return (
      // il menu si apre a destra (align="end") e si chiude solo cliccando fuori
      <Dropdown align="end" autoClose="outside" className="filter-dropdown">
        {/* aria-label: quando la scritta è nascosta (vedi il CSS) resta il nome per gli screen reader */}
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
