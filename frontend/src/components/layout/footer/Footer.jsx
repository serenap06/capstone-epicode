import "./footer.css";

// piè di pagina con il nome dell'app e il link al mio GitHub.
// target="_blank" apre il link in una nuova scheda; rel="noopener noreferrer" è per sicurezza,
// così la nuova scheda non può controllare la pagina da cui è stata aperta
const Footer = () => {
  return (
    <footer className="app-footer">
      StoreSquad · a study project by{" "}
      <a
        href="https://github.com/serenap06"
        target="_blank"
        rel="noopener noreferrer"
      >
        serenapDev
      </a>
    </footer>
  );
};

export default Footer;
