import { useMediaQuery } from "./useMediaQuery";

// true sui telefoni (fino a 767px, dove inizia "md" di Bootstrap).
// La soglia è scritta solo qui: tutte le pagine usano la stessa
export const useIsPhone = () => useMediaQuery("(max-width: 767.98px)");
