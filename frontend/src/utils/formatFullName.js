// nome e cognome di un utente, per esempio "Marta Bianchi".
// Persona eliminata (le sue vendite e richieste restano): "Utente eliminato"
export const formatFullName = (user) =>
  user ? `${user.name} ${user.surname}` : "Utente eliminato";
