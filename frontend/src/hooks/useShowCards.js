// import
import { useMediaQuery } from "./useMediaQuery";

// true fino a 1366px: le pagine con una tabella mostrano le card (sotto non ci sta)
export const useShowCards = () => useMediaQuery("(max-width: 1365.98px)");
