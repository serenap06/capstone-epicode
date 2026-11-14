const toRange = (start, end) => ({
  from: start.toISOString(),
  to: end.toISOString(),
});

// Inizio e fine di oggi
export const getToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return toRange(start, end);
};

// Da lunedì a domenica della settimana che contiene "date" (se manca, oggi)
export const getWeek = (date = new Date()) => {
  const start = new Date(date);
  const daysFromMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysFromMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return toRange(start, end);
};

// I sette giorni, da lunedì a domenica, della settimana che contiene "date"
export const getWeekDays = (date = new Date()) => {
  const monday = new Date(getWeek(date).from);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
};

// trasforma { from, to } nel testo "from=...&to=..." da mettere nella richiesta
export const toQuery = (range) => new URLSearchParams(range).toString();

// true se le due date cadono nello stesso giorno
export const isSameDay = (firstDate, secondDate) =>
  new Date(firstDate).toDateString() === new Date(secondDate).toDateString();

// una nuova data spostata di "days" giorni (negativo = indietro)
export const addDays = (date, days) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};
