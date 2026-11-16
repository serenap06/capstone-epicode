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
  const data = await api("/users/me/avatar", {
    method: "PATCH",
    body: formData,
  });
  return data.user;
};

// toglie la foto profilo: al suo posto tornano le iniziali
export const removeAvatar = async () => {
  const data = await api("/users/me/avatar", { method: "DELETE" });
  return data.user;
};

// cambia la propria password: il server controlla prima quella attuale
export const changePassword = async (passwordData) => {
  await api("/users/me/password", { method: "PATCH", body: passwordData });
};

// gestione degli utenti (solo per il responsabile)

// nuova persona, con la password scelta dal responsabile
export const createUser = async (userData) => {
  const data = await api("/users", { method: "POST", body: userData });
  return data.user;
};

// modifica dati, ruolo, negozio e ore (la password no)
export const updateUser = async (userId, userData) => {
  const data = await api(`/users/${userId}`, {
    method: "PATCH",
    body: userData,
  });
  return data.user;
};

// elimina la persona con i suoi turni e le sue task
export const deleteUser = async (userId) => {
  await api(`/users/${userId}`, { method: "DELETE" });
};
