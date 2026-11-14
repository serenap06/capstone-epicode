import { Col, Row } from "react-bootstrap";
import Message from "../message/Message";

// intestazione di ogni pagina: titolo, sottotitolo, errore e,
// a destra, quello che la pagina mette tra i tag (bottoni, barra...)
const PageHeader = ({ title, subtitle, error, children }) => {
  return (
    <Row className="align-items-end g-3 mb-4">
      <Col>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        {error && <Message type="error">{error}</Message>}
      </Col>
      {children && (
        <Col xs={12} md="auto">
          {children}
        </Col>
      )}
    </Row>
  );
};

export default PageHeader;
