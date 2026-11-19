// import
import "./avatar.css";

// componente Avatar: la foto dell'utente o le iniziali nel cerchio viola.
// props: user = l'utente, size = 36, 40, 44 o 120 px (ognuno ha la sua classe nel CSS).
// alt="" perché accanto c'è sempre il nome
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
