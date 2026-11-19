// import
import "./badge.css";

// componente Badge: etichetta a pillola.
// props: color = primary, secondary (di base), warning, success, neutral o white
const Badge = ({ color = "secondary", children }) => {
  // color="warning" → classe "app-badge-warning"
  return <span className={`app-badge app-badge-${color}`}>{children}</span>;
};

export default Badge;
