import api from "./api";

// richieste sul profilo dell'utente collegato

// salva nome, cognome ed email e restituisce l'utente aggiornato
export const updateProfile = async (profileData) => {
  const data = await api("/users/me", { method: "PATCH", body: profileData });
  return data.user;
};

// carica la foto profilo. FormData è la "busta" per mandare un file:
// "avatar" è il nome che il backend si aspetta (uploadAvatar.single("avatar"))
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const data = await api("/users/me/avatar", { method: "PATCH", body: formData });
  return data.user;
};
