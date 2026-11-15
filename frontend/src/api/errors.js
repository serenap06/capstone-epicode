// traduzione dei messaggi del backend: a sinistra il messaggio in inglese
// che arriva dal server, a destra quello che legge l'utente
const MESSAGES = {
  "Invalid email or password": "Email o password non corrette",
  "Validation failed": "Controlla i dati inseriti",
  "Forbidden": "Non hai i permessi per questa operazione",
  "Product not found": "Prodotto non trovato",
  "Task not found": "Task non trovata",
  "Handled requests cannot be deleted":
    "Le richieste già gestite non si possono annullare",
  "You cannot delete your own account": "Non puoi eliminare il tuo account",
  "One or more products are not available":
    "Uno o più prodotti non sono disponibili",
  "No employees in this store": "In questo negozio non ci sono dipendenti",
};

// messaggi di riserva, in base al codice della risposta,
// per quando il messaggio del server non è nell'elenco sopra
const BY_STATUS = {
  400: "Richiesta non valida",
  401: "Sessione scaduta, accedi di nuovo",
  403: "Non hai i permessi per questa operazione",
  404: "Elemento non trovato",
  409: "Esiste già un elemento con questi dati",
  500: "Errore del server, riprova più tardi",
};

// sceglie il messaggio da mostrare, in quest'ordine:
// 1. traduzione esatta del messaggio
// 2. caso speciale della giacenza, che contiene il nome del prodotto
// 3. messaggio in base al codice, oppure uno generico
export const translateError = (message, status) => {
  if (MESSAGES[message]) return MESSAGES[message];
  // ?. evita l'errore se message è vuoto
  if (message?.startsWith("Not enough stock for:")) {
    return message.replace("Not enough stock for:", "Giacenza insufficiente per:");
  }
  return BY_STATUS[status] || "Si è verificato un errore";
};
