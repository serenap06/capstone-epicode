// import
import { useEffect, useState } from "react";

// true quando lo schermo rispetta la media query, es. "(max-width: 767.98px)"
export const useMediaQuery = (query) => {
  // valore iniziale
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    // si aggiorna quando la finestra passa la soglia
    const handleChange = (event) => setMatches(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    // alla chiusura tolgo il listener
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
};
