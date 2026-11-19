// import
import "./paymentSplit.css";

import { formatEuro } from "../../../utils/formatEuro";
import { getPercent } from "../../../utils/getPercent";

import ProgressBar from "../../common/progressBar/ProgressBar";
import PaymentMethod from "../../sales/paymentMethod/PaymentMethod";

// componente PaymentSplit: contanti e carta, con incasso, vendite e percentuale.
// props: byPayment = le righe del server, totalRevenue = l'incasso del periodo
const PaymentSplit = ({ byPayment, totalRevenue }) => {
  // sempre tutti e due i metodi, anche con 0
  const rows = ["cash", "card"].map((method) => {
    const row = byPayment.find((payment) => payment.paymentMethod === method);
    return {
      method,
      revenue: row?.revenue ?? 0,
      salesCount: row?.salesCount ?? 0,
    };
  });

  return (
    <ul className="payment-split">
      {rows.map((row) => {
        const percent = getPercent(row.revenue, totalRevenue);
        return (
          <li key={row.method}>
            <div className="payment-split-top">
              <PaymentMethod method={row.method} />
              <strong>{formatEuro(row.revenue)}</strong>
            </div>
            <ProgressBar percent={percent} />
            <p className="payment-split-detail">
              {percent}% dell'incasso · {row.salesCount}{" "}
              {row.salesCount === 1 ? "vendita" : "vendite"}
            </p>
          </li>
        );
      })}
    </ul>
  );
};

export default PaymentSplit;
