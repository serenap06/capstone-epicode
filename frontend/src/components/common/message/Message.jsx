import "./message.css";

// messaggio di pagina: type "error" (riquadro arancio) o "info" (testo grigio)
const Message = ({ type = "info", children }) => {
  const isError = type === "error";
  return (
    // role="alert": lo screen reader legge subito l'errore
    <p
      className={`message ${isError ? "message-error" : ""}`}
      role={isError ? "alert" : undefined}
    >
      {children}
    </p>
  );
};

export default Message;
