import "./progressBar.css";

// barra di avanzamento: percent va da 0 a 100 (di solito calcolato con getPercent).
// La parte piena è un div dentro la "pista" con la larghezza in percentuale.
// aria-hidden perché il numero è già scritto nel testo accanto
const ProgressBar = ({ percent, className = "" }) => {
  return (
    <div className={`progress-track ${className}`} aria-hidden="true">
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  );
};

export default ProgressBar;
