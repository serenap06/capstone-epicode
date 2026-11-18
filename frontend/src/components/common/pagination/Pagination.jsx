import "./pagination.css";

import Button from "../button/Button";

// sotto un elenco diviso in pagine: Precedente, "Pagina 1 di 3", Successiva.
// Compare solo se le pagine sono più di una; i bottoni si spengono agli estremi.
// label: il nome per gli screen reader ("Pagine delle vendite"); onChange(numero): nuova pagina
const Pagination = ({ page, totalPages, label, onChange }) => {
  if (totalPages <= 1) return null;

  // cambio pagina e torno in cima: i bottoni sono in fondo alla lista,
  // e la pagina nuova si legge dall'inizio
  const goToPage = (newPage) => {
    onChange(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="app-pagination" aria-label={label}>
      <Button
        variant="secondary"
        disabled={page === 1}
        onClick={() => goToPage(page - 1)}
      >
        Precedente
      </Button>
      <span className="app-pagination-label">
        Pagina {page} di {totalPages}
      </span>
      <Button
        variant="secondary"
        disabled={page === totalPages}
        onClick={() => goToPage(page + 1)}
      >
        Successiva
      </Button>
    </nav>
  );
};

export default Pagination;
