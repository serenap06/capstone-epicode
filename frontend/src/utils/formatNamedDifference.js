// import
import { formatEuro } from "./formatEuro";

// differenza con il nome davanti: "POS: tutto torna", "Contanti: mancano 5,00 €", "POS: 5,00 € in più"
export const formatNamedDifference = (name, difference) => {
  if (difference === 0) return `${name}: tutto torna`;
  if (difference < 0) return `${name}: mancano ${formatEuro(-difference)}`;
  return `${name}: ${formatEuro(difference)} in più`;
};
