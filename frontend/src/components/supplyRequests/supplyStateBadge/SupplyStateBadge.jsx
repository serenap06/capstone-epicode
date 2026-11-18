import Badge from "../../common/badge/Badge";

// stato di una richiesta: "In attesa" arancio come gli avvisi, "Accolta" magenta come "Ok",
// "Respinta" grigio (nelle liste al suo posto c'è il pulsante che apre il motivo)
const SupplyStateBadge = ({ request }) => {
  if (request.state === "open") return <Badge color="warning">In attesa</Badge>;
  if (request.state === "handled")
    return <Badge color="primary">Accolta</Badge>;
  return <Badge color="neutral">Respinta</Badge>;
};

export default SupplyStateBadge;
