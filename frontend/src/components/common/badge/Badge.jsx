import "./badge.css";

// etichetta a pillola usata in tutta l'app, per stati e nomi brevi ("Globale", "Da fare"...).
// color: "primary" (magenta), "secondary" (viola), "warning" (arancio), "white" (su sfondi colorati).
// Se non passo color usa "secondary". children è il testo scritto tra <Badge> e </Badge>
const Badge = ({ color = "secondary", children }) => {
  // la classe del colore si compone con il nome: color="warning" → "app-badge-warning"
  return <span className={`app-badge app-badge-${color}`}>{children}</span>;
};

export default Badge;
