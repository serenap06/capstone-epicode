// funzioni sulle date: intervalli da chiedere al server, confronti tra giorni e valori per i campi

// { from, to } nel formato ISO che il backend accetta come filtro
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

// da lunedì a domenica della settimana che contiene "date" (se manca, oggi)
export const getWeek = (date = new Date()) => {
  const start = new Date(date);
  // getDay() parte da domenica (0): così lunedì = 0, martedì = 1... domenica = 6
  const daysFromMonday = (start.getDay() + 6) % 7;
  // torno a lunedì, a mezzanotte
  start.setDate(start.getDate() - daysFromMonday);
  start.setHours(0, 0, 0, 0);

  // fine: domenica alle 23:59
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return toRange(start, end);
};

// i 7 giorni (da lunedì) della settimana di "date"
export const getWeekDays = (date = new Date()) => {
  const monday = new Date(getWeek(date).from);
  // 7 date: lunedì + 0, + 1... + 6 giorni ("_" è il valore che non mi serve)
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
};

// true se è lo stesso giorno, l'ora non conta (toDateString scrive solo il giorno)
export const isSameDay = (firstDate, secondDate) =>
  new Date(firstDate).toDateString() === new Date(secondDate).toDateString();

// nuova data spostata di "days" giorni (negativo = indietro), senza toccare l'originale
export const addDays = (date, days) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

// data per i campi <input type="date">: "2026-11-16", con il giorno di qui (non quello UTC)
export const toDateInputValue = (date) => {
  const day = new Date(date);
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const dayNumber = String(day.getDate()).padStart(2, "0");
  return `${day.getFullYear()}-${month}-${dayNumber}`;
};

// orario per i campi <input type="time">: "09:00"
export const toTimeInputValue = (date) => {
  const time = new Date(date);
  const hours = String(time.getHours()).padStart(2, "0");
  const minutes = String(time.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};
