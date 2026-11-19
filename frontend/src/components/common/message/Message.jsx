// import
import "./message.css";

// componente Message: messaggio di pagina. props: type = "error" (riquadro arancio) o "info"
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
