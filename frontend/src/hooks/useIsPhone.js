// import
import { useMediaQuery } from "./useMediaQuery";

// true sui telefoni (fino a 767px, come "md" di Bootstrap)
export const useIsPhone = () => useMediaQuery("(max-width: 767.98px)");
