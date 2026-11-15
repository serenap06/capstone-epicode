import "./avatar.css";

// foto dell'utente, oppure le iniziali in un cerchio viola.
// size: il diametro in pixel (40 nella barra in alto, 120 nel profilo).
// alt="" perché accanto c'è sempre il nome: lo screen reader non lo legge due volte
const Avatar = ({ user, size = 40 }) => {
  const initials = `${user.name[0]}${user.surname[0]}`;
  // grandezza e testo in proporzione al cerchio
  const style = { width: size, height: size, fontSize: size * 0.35 };

  return user.avatar ? (
    <img src={user.avatar} alt="" className="avatar" style={style} />
  ) : (
    <span className="avatar" style={style} aria-hidden="true">
      {initials}
    </span>
  );
};

export default Avatar;
