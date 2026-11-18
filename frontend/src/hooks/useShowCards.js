import { useMediaQuery } from "./useMediaQuery";

// true fino a 1366px: lì le pagine con una tabella (Giacenze, Vendite, Utenti, Forniture)
// mostrano le card. Le tabelle hanno bisogno di circa 1000px e, con il menu a sinistra,
// ci stanno senza andare a capo solo da 1366px. La soglia è scritta solo qui
export const useShowCards = () => useMediaQuery("(max-width: 1365.98px)");
