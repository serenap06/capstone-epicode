import "./message.css";

// messaggio di pagina. type "error" per gli errori, "info" per avvisi come "Nessuna task"
const Message = ({ type = "info", children }) => {
  const isError = type === "error";
  return (
    <p
      className={`message ${isError ? "message-error" : ""}`}
      role={isError ? "alert" : undefined}
    >
      {children}
    </p>
  );
};

export default Message;
