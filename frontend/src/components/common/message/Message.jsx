import "./message.css";

// messaggio di pagina. type "error" per gli errori (riquadro arancio),
// "info" per avvisi come "Nessuna task" (testo grigio). children è il testo
const Message = ({ type = "info", children }) => {
  const isError = type === "error";
  return (
    // role="alert" fa leggere subito l'errore agli screen reader
    <p
      className={`message ${isError ? "message-error" : ""}`}
      role={isError ? "alert" : undefined}
    >
      {children}
    </p>
  );
};

export default Message;
