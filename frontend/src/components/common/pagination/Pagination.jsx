// import
import "./pagination.css";

import Button from "../button/Button";

// componente Pagination: Precedente, "Pagina 1 di 3", Successiva (solo con più pagine).
// props: page, totalPages, label = nome per lo screen reader, onChange(numero),
// scrollTarget = ref all'inizio dell'elenco, se non è in cima alla pagina
const Pagination = ({ page, totalPages, label, onChange, scrollTarget }) => {
  if (totalPages <= 1) return null;

  // cambio pagina e torno all'inizio dell'elenco
  const goToPage = (newPage) => {
    onChange(newPage);
    if (scrollTarget?.current) {
      scrollTarget.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
