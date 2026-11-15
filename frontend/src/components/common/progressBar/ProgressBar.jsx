import "./progressBar.css";

// barra di avanzamento da 0 a 100; aria-hidden perché il numero è già scritto accanto
const ProgressBar = ({ percent, className = "" }) => {
  return (
    <div className={`progress-track ${className}`} aria-hidden="true">
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  );
};

export default ProgressBar;
