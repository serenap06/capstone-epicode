// import
import { formatEuro } from "./formatEuro";

// differenza di cassa a parole: "Tutto torna", "Mancano 5,00 €", "5,00 € in più"
export const formatCashDifference = (difference) => {
  if (difference === 0) return "Tutto torna";
  if (difference < 0) return `Mancano ${formatEuro(-difference)}`;
  return `${formatEuro(difference)} in più`;
};
