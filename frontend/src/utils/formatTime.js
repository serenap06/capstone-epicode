// funzioni per scrivere gli orari

// orario come "9:00" o "15:30" (padStart aggiunge lo zero ai minuti: 5 → "05")
export const formatTime = (date) => {
  const time = new Date(date);
  const minutes = String(time.getMinutes()).padStart(2, "0");
  return `${time.getHours()}:${minutes}`;
};

// solo l'ora se i minuti sono zero ("9"), altrimenti "9:30". Usata solo qui
const formatShortTime = (date) =>
  new Date(date).getMinutes() === 0
    ? String(new Date(date).getHours())
    : formatTime(date);

// fascia corta, per gli spazi stretti: "9 – 17" o "9:30 – 17"
export const formatHourRange = (start, end) =>
  `${formatShortTime(start)} – ${formatShortTime(end)}`;

// fascia completa: "9:00 – 17:00"
export const formatTimeRange = (start, end) =>
  `${formatTime(start)} – ${formatTime(end)}`;
