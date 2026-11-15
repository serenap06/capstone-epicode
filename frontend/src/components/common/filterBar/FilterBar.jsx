import "./filterBar.css";
import { Dropdown } from "react-bootstrap";
import { SlidersHorizontal } from "lucide-react";

// contenitore dei filtri di una pagina.
// Normale: i filtri in riga, che vanno a capo se non ci stanno.
// compact: i filtri chiusi in un menu a tendina "Filtri", per gli schermi piccoli.
// activeCount: quanti filtri sono attivi, scritto in un pallino accanto a "Filtri"
const FilterBar = ({ compact = false, activeCount = 0, children }) => {
  if (compact) {
    return (
      // align="end": il menu si apre allineato a destra, così non esce dallo schermo.
      // autoClose="outside": si chiude solo cliccando fuori, non quando scegli un filtro
      <Dropdown align="end" autoClose="outside" className="filter-dropdown">
        <Dropdown.Toggle variant="light" className="filter-dropdown-toggle">
          <SlidersHorizontal size={16} aria-hidden="true" />
          Filtri
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
