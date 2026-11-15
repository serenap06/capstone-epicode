import { Col, Row } from "react-bootstrap";
import Message from "../message/Message";

// intestazione di ogni pagina: titolo, sottotitolo, errore e,
// a destra, quello che la pagina mette tra i tag (bottoni, barra...).
// subtitleAside: qualcosa da mettere sulla riga del sottotitolo, a destra
// (per esempio il menu "Filtri" su telefono)
const PageHeader = ({ title, subtitle, subtitleAside, error, children }) => {
  return (
    // align-items-end allinea il contenuto di destra al fondo del titolo
    <Row className="align-items-end g-3 mb-4">
      <Col>
        <h1 className="page-title">{title}</h1>
        {subtitle && (
          <div className="page-subtitle-row">
            <p className="page-subtitle">{subtitle}</p>
            {subtitleAside}
          </div>
        )}
        {error && <Message type="error">{error}</Message>}
      </Col>
      {/* colonna di destra solo se la pagina ci mette qualcosa:
          su telefono è larga tutta la riga (xs=12), da tablet in su quanto il contenuto (md="auto") */}
      {children && (
        <Col xs={12} md="auto">
          {children}
        </Col>
      )}
    </Row>
  );
};

export default PageHeader;
