import "./footer.css";

// piè di pagina. rel="noopener noreferrer": la nuova scheda non può controllare questa
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
