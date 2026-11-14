import "./badge.css";

// etichetta a pillola usata in tutta l'app.
// color: "primary" (magenta), "secondary" (viola), "warning" (arancio), "white" (su sfondi colorati)
const Badge = ({ color = "secondary", children }) => {
  return <span className={`app-badge app-badge-${color}`}>{children}</span>;
};

export default Badge;
