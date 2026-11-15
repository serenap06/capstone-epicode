import { useEffect, useState } from "react";

// true quando lo schermo rispetta la media query, per esempio "(max-width: 425px)".
// Serve quando su schermi diversi mostro componenti diversi, non solo stili diversi
export const useMediaQuery = (query) => {
  // valore iniziale: la larghezza di adesso
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
