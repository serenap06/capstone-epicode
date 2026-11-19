// funzioni sulle date: intervalli per il server, confronti tra giorni, valori per i campi

// { from, to } in ISO, come li vuole il backend
const toRange = (start, end) => ({
  from: start.toISOString(),
  to: end.toISOString(),
});

// oggi, dalle 00:00 alle 23:59
export const getToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return toRange(start, end);
};

// domani, dalle 00:00 alle 23:59
export const getTomorrow = () => {
  const start = addDays(new Date(), 1);
  start.setHours(0, 0, 0, 0);
  const end = addDays(new Date(), 1);
  end.setHours(23, 59, 59, 999);
  return toRange(start, end);
};

// da lunedì a domenica della settimana di "date" (di base oggi)
export const getWeek = (date = new Date()) => {
  const start = new Date(date);
  // getDay() parte da domenica (0): così lunedì = 0... domenica = 6
  const daysFromMonday = (start.getDay() + 6) % 7;
  // torno a lunedì a mezzanotte
  start.setDate(start.getDate() - daysFromMonday);
  start.setHours(0, 0, 0, 0);

  // domenica alle 23:59
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return toRange(start, end);
};

// i 7 giorni della settimana di "date", da lunedì
export const getWeekDays = (date = new Date()) => {
  const monday = new Date(getWeek(date).from);
  // lunedì + 0, + 1... + 6 ("_" è il valore che non uso)
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
};

// true se è lo stesso giorno (l'ora non conta)
export const isSameDay = (firstDate, secondDate) =>
  new Date(firstDate).toDateString() === new Date(secondDate).toDateString();

// nuova data spostata di "days" giorni (negativo = indietro)
export const addDays = (date, days) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

// data per <input type="date">: "2026-11-16" con il giorno di qui
export const toDateInputValue = (date) => {
  const day = new Date(date);
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const dayNumber = String(day.getDate()).padStart(2, "0");
  return `${day.getFullYear()}-${month}-${dayNumber}`;
};

// orario per <input type="time">: "09:00"
export const toTimeInputValue = (date) => {
  const time = new Date(date);
  const hours = String(time.getHours()).padStart(2, "0");
  const minutes = String(time.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};
