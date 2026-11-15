// funzioni per lavorare con le date: intervalli da chiedere al server e confronti tra giorni

// trasforma due date nell'oggetto { from, to } che il backend accetta come filtro.
// toISOString scrive la data nel formato che il server capisce: "2026-11-14T00:00:00.000Z"
const toRange = (start, end) => ({
  from: start.toISOString(),
  to: end.toISOString(),
});

// inizio e fine di oggi: dalle 00:00:00 alle 23:59:59
export const getToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return toRange(start, end);
};

// da lunedì a domenica della settimana che contiene "date" (se manca, oggi)
export const getWeek = (date = new Date()) => {
  const start = new Date(date);
  // getDay() conta da domenica (0) a sabato (6). Con +6 e il resto della divisione
  // per 7 ottengo quanti giorni sono passati da lunedì: lunedì 0, martedì 1... domenica 6
  const daysFromMonday = (start.getDay() + 6) % 7;
  // torno indietro fino a lunedì e mi metto a mezzanotte
  start.setDate(start.getDate() - daysFromMonday);
  start.setHours(0, 0, 0, 0);

  // la fine è domenica, sei giorni dopo, alle 23:59:59
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return toRange(start, end);
};

// i sette giorni, da lunedì a domenica, della settimana che contiene "date"
export const getWeekDays = (date = new Date()) => {
  const monday = new Date(getWeek(date).from);
  // Array.from({ length: 7 }) crea un array di 7 posti; per ogni posto creo
  // una data partendo da lunedì e aggiungendo index giorni (0, 1, 2... 6).
  // "_" è il primo valore che non mi serve, mi serve solo index
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
};

// trasforma un oggetto nel testo "from=...&to=..." da mettere nella richiesta.
// Le voci vuote ("" o mancanti) vengono saltate: un filtro non scelto non va mandato
export const toQuery = (params) => {
  // Object.entries trasforma { a: 1, b: "" } in [["a", 1], ["b", ""]],
  // poi il filter tiene solo le coppie con un valore
  const filledEntries = Object.entries(params).filter(
    ([, value]) => value !== "" && value !== undefined && value !== null,
  );
  return new URLSearchParams(filledEntries).toString();
};

// true se le due date cadono nello stesso giorno, l'ora non conta.
// toDateString scrive solo il giorno ("Sat Nov 14 2026"), così confronto quello
export const isSameDay = (firstDate, secondDate) =>
  new Date(firstDate).toDateString() === new Date(secondDate).toDateString();

// una nuova data spostata di "days" giorni (negativo = indietro).
// Creo una copia per non modificare la data che mi hanno passato
export const addDays = (date, days) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};
