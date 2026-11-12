// Traduzione dei messaggi del backend
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
};

// Messaggi di riserva, in base al codice della risposta
const BY_STATUS = {
  400: "Richiesta non valida",
  401: "Sessione scaduta, accedi di nuovo",
  403: "Non hai i permessi per questa operazione",
  404: "Elemento non trovato",
  409: "Esiste già un elemento con questi dati",
  500: "Errore del server, riprova più tardi",
};

export const translateError = (message, status) => {
  if (MESSAGES[message]) return MESSAGES[message];
  if (message?.startsWith("Not enough stock for:")) {
    return message.replace("Not enough stock for:", "Giacenza insufficiente per:");
  }
  return BY_STATUS[status] || "Si è verificato un errore";
};