import { isLowStock } from "../../../utils/isLowStock";
import Badge from "../../common/badge/Badge";

// stato di una giacenza: "Sotto soglia" arancio come gli avvisi, "Ok" magenta come "Fatto"
const StockStatusBadge = ({ stock }) => {
  return isLowStock(stock) ? (
    <Badge color="warning">Sotto soglia</Badge>
  ) : (
    <Badge color="primary">Ok</Badge>
  );
};

export default StockStatusBadge;
