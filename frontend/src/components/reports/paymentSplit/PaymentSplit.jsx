import "./paymentSplit.css";

import { formatEuro } from "../../../utils/formatEuro";
import { getPercent } from "../../../utils/getPercent";

import ProgressBar from "../../common/progressBar/ProgressBar";
import PaymentMethod from "../../sales/paymentMethod/PaymentMethod";

// contanti e carta: incasso, numero di vendite e quanto pesano sul totale.
// byPayment: le righe del server ({ paymentMethod, revenue, salesCount });
// totalRevenue: l'incasso del periodo, per la percentuale
const PaymentSplit = ({ byPayment, totalRevenue }) => {
  // sempre tutti e due i metodi, anche quando uno non ha vendite (0)
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
