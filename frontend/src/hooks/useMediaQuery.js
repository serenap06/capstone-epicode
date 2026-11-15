import { useEffect, useState } from "react";

// true quando lo schermo rispetta la media query, per esempio "(max-width: 425px)".
// È la stessa regola che scrivo nel CSS, ma letta da JavaScript: serve quando
// su schermi diversi devo disegnare componenti diversi, non solo cambiare lo stile.
// Si aggiorna da solo quando la finestra cambia larghezza
export const useMediaQuery = (query) => {
  // valore iniziale: controllo subito la larghezza attuale
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    // ogni volta che la finestra passa sopra o sotto la soglia, aggiorno lo stato
    const handleChange = (event) => setMatches(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    // quando la pagina si chiude smetto di ascoltare, per non lasciare listener attivi
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
};
