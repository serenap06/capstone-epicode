// funzioni per scrivere gli orari

// orario senza zero iniziale nelle ore, per esempio "9:00" o "15:30".
// padStart(2, "0") aggiunge lo zero davanti ai minuti se ne serve: 5 diventa "05"
export const formatTime = (date) => {
  const time = new Date(date);
  const minutes = String(time.getMinutes()).padStart(2, "0");
  return `${time.getHours()}:${minutes}`;
};

// orario corto: solo l'ora se i minuti sono zero ("9"), altrimenti completo ("9:30").
// Non ha export perché la uso solo qui dentro
const formatShortTime = (date) =>
  new Date(date).getMinutes() === 0
    ? String(new Date(date).getHours())
    : formatTime(date);

// fascia oraria compatta, per esempio "9 – 17" oppure "9:30 – 17".
// Usata dove c'è poco spazio: settimana della Home e badge dei colleghi
export const formatHourRange = (start, end) =>
  `${formatShortTime(start)} – ${formatShortTime(end)}`;

// fascia oraria completa, per esempio "9:00 – 17:00"
export const formatTimeRange = (start, end) =>
  `${formatTime(start)} – ${formatTime(end)}`;
