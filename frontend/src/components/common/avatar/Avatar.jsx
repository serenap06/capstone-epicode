import "./avatar.css";

// foto dell'utente, oppure le iniziali in un cerchio viola.
// size: il diametro in pixel: 36 (tabella Utenti), 40 (barra in alto), 44 (card Utenti),
// 120 (profilo). Ognuno ha la sua classe nel CSS (avatar-40...), con il testo in proporzione.
// alt="" perché accanto c'è sempre il nome: lo screen reader non lo legge due volte
const Avatar = ({ user, size = 40 }) => {
  const initials = `${user.name[0]}${user.surname[0]}`;
  const className = `avatar avatar-${size}`;

  return user.avatar ? (
    <img src={user.avatar} alt="" className={className} />
  ) : (
    <span className={className} aria-hidden="true">
      {initials}
    </span>
  );
};

export default Avatar;
