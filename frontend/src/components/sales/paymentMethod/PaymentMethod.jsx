import "./paymentMethod.css";
import { Banknote, CreditCard } from "lucide-react";

// come è stata pagata una vendita: icona e testo ("Contanti" o "Carta")
const PaymentMethod = ({ method }) => {
  const isCard = method === "card";
  const Icon = isCard ? CreditCard : Banknote;

  return (
    <span className="payment-method">
      <Icon size={16} aria-hidden="true" />
      {isCard ? "Carta" : "Contanti"}
    </span>
  );
};

export default PaymentMethod;
