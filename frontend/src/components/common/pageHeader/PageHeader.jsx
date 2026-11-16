import { Col, Row } from "react-bootstrap";
import Message from "../message/Message";

// intestazione della pagina: titolo, sottotitolo, errore e, a destra, quello tra i tag.
// titleAside: qualcosa a destra del titolo (per esempio il "+" su telefono);
// subtitleAside: qualcosa a destra del sottotitolo (per esempio "Filtri" su telefono)
const PageHeader = ({
  title,
  titleAside,
  subtitle,
  subtitleAside,
  error,
  children,
}) => {
  return (
    // align-items-end: la colonna di destra si allinea in basso
    <Row className="align-items-end g-3 mb-4">
      <Col>
        <div className="page-title-row">
          <h1 className="page-title">{title}</h1>
          {titleAside}
        </div>
        {subtitle && (
          <div className="page-subtitle-row">
            <p className="page-subtitle">{subtitle}</p>
            {subtitleAside}
          </div>
        )}
        {error && <Message type="error">{error}</Message>}
      </Col>
      {/* colonna di destra solo se serve: tutta la riga su telefono, stretta da md */}
      {children && (
        <Col xs={12} md="auto">
          {children}
        </Col>
      )}
    </Row>
  );
};

export default PageHeader;
