// messaggi del backend (a sinistra) tradotti per l'utente (a destra)
const MESSAGES = {
  "Invalid email or password": "Email o password non corrette",
  "Validation failed": "Controlla i dati inseriti",
  Forbidden: "Non hai i permessi per questa operazione",
  "Product not found": "Prodotto non trovato",
  "Task not found": "Task non trovata",
  "Handled requests cannot be deleted":
    "Le richieste già gestite non si possono annullare",
  "You cannot delete your own account": "Non puoi eliminare il tuo account",
  "You cannot change your own role": "Non puoi cambiare il tuo ruolo",
  "One or more products are not available":
    "Uno o più prodotti non sono disponibili",
  "No employees in this store": "In questo negozio non ci sono dipendenti",
  "Upload error": "Foto non valida: usa png, jpg o webp fino a 2 MB",
  "User already has a shift in this time range":
    "Questa persona ha già un turno in questo orario",
  "User doesn't belong to this store": "Questa persona non lavora in questo negozio",
  "Current password is wrong": "La password attuale non è corretta",
  "New password must be different":
    "La nuova password deve essere diversa da quella attuale",
  "Store has employees":
    "Il negozio ha ancora del personale: spostalo prima in un altro negozio",
};

// messaggi di riserva in base al codice, se il messaggio non è nell'elenco sopra
const BY_STATUS = {
  400: "Richiesta non valida",
  401: "Sessione scaduta, accedi di nuovo",
  403: "Non hai i permessi per questa operazione",
  404: "Elemento non trovato",
  409: "Esiste già un elemento con questi dati",
  500: "Errore del server, riprova più tardi",
};

// sceglie il messaggio: traduzione esatta, poi giacenza (contiene il nome del prodotto),
// poi il codice, altrimenti uno generico
export const translateError = (message, status) => {
  if (MESSAGES[message]) return MESSAGES[message];
  // ?. evita l'errore se message è vuoto
  if (message?.startsWith("Not enough stock for:")) {
    return message.replace(
      "Not enough stock for:",
      "Giacenza insufficiente per:",
    );
  }
  return BY_STATUS[status] || "Si è verificato un errore";
};
