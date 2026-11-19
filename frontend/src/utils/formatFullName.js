// "Marta Bianchi"; persona eliminata: "Utente eliminato"
export const formatFullName = (user) =>
  user ? `${user.name} ${user.surname}` : "Utente eliminato";
