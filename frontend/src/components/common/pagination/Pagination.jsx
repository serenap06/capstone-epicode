// import
import { useEffect, useLayoutEffect, useRef } from "react";
import "./pagination.css";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import Button from "../button/Button";

// componente Pagination: Prima, Precedente, "Pagina 1 di 3", Successiva, Ultima (solo con più pagine).
// Su telefono e tablet piccolo solo le icone e "1 di 3". Cambiando pagina i pulsanti restano fermi sotto il mouse.
// props: page, totalPages, label = nome per lo screen reader, onChange(numero)
const Pagination = ({ page, totalPages, label, onChange }) => {
  // i pulsanti
  const navRef = useRef(null);
  // dove devono restare i pulsanti dopo il clic (null = nessun cambio pagina in corso)
  const keptTopRef = useRef(null);

  // dopo ogni render (anche quando arrivano i dati dal server) rimetto i pulsanti dov'erano:
  // la pagina nuova può essere più corta o più lunga, scorro della differenza, subito
  useLayoutEffect(() => {
    if (keptTopRef.current === null || !navRef.current) return;
    const shift =
      navRef.current.getBoundingClientRect().top - keptTopRef.current;
    if (shift !== 0) window.scrollBy({ top: shift, behavior: "instant" });
  });

  // se scorro o clicco altro smetto di tenerli fermi (un nuovo clic sulle pagine riparte)
  useEffect(() => {
    const stopKeeping = () => {
      keptTopRef.current = null;
    };
    const userEvents = ["wheel", "touchstart", "keydown", "mousedown"];
    userEvents.forEach((eventName) =>
      window.addEventListener(eventName, stopKeeping),
    );
    // pulizia: tolgo gli ascoltatori quando la paginazione sparisce
    return () =>
      userEvents.forEach((eventName) =>
        window.removeEventListener(eventName, stopKeeping),
      );
  }, []);

  if (totalPages <= 1) return null;

  // mi segno dove sono i pulsanti e cambio pagina
  const goToPage = (newPage) => {
    keptTopRef.current = navRef.current.getBoundingClientRect().top;
    onChange(newPage);
  };

  return (
    <nav ref={navRef} className="app-pagination" aria-label={label}>
      <Button
        variant="secondary"
        disabled={page === 1}
        aria-label="Prima pagina"
        onClick={() => goToPage(1)}
      >
        <ChevronsLeft size={18} aria-hidden="true" />
        <span className="app-button-label">Prima</span>
      </Button>
      <Button
        variant="secondary"
        disabled={page === 1}
        aria-label="Pagina precedente"
        onClick={() => goToPage(page - 1)}
      >
        <ChevronLeft size={18} aria-hidden="true" />
        <span className="app-button-label">Precedente</span>
      </Button>
      <span className="app-pagination-label">
        <span className="app-pagination-word">Pagina </span>
        {page} di {totalPages}
      </span>
      <Button
        variant="secondary"
        disabled={page === totalPages}
        aria-label="Pagina successiva"
        onClick={() => goToPage(page + 1)}
      >
        <span className="app-button-label">Successiva</span>
        <ChevronRight size={18} aria-hidden="true" />
      </Button>
      <Button
        variant="secondary"
        disabled={page === totalPages}
        aria-label="Ultima pagina"
        onClick={() => goToPage(totalPages)}
      >
        <span className="app-button-label">Ultima</span>
        <ChevronsRight size={18} aria-hidden="true" />
      </Button>
    </nav>
  );
};

export default Pagination;
