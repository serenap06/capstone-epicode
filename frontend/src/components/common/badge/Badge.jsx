import "./badge.css";

// etichetta a pillola. color: "primary" (magenta), "secondary" (viola, di base),
// "warning" (arancio, sotto soglia), "success" (verde, pezzi a posto), "neutral" (grigio)
// o "white" (sulle card colorate)
const Badge = ({ color = "secondary", children }) => {
  // color="warning" → classe "app-badge-warning"
  return <span className={`app-badge app-badge-${color}`}>{children}</span>;
};

export default Badge;
