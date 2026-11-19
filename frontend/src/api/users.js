// import
import api from "./api";

// richieste del mio profilo

// salvo nome, cognome ed email
export const updateProfile = async (profileData) => {
  const data = await api("/users/me", { method: "PATCH", body: profileData });
  return data.user;
};

// carico la foto profilo: FormData con il file "avatar"
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const data = await api("/users/me/avatar", {
    method: "PATCH",
    body: formData,
  });
  return data.user;
};

// tolgo la foto profilo
export const removeAvatar = async () => {
  const data = await api("/users/me/avatar", { method: "DELETE" });
  return data.user;
};

// cambio la mia password
export const changePassword = async (passwordData) => {
  await api("/users/me/password", { method: "PATCH", body: passwordData });
};

// gestione delle persone (solo il responsabile)

// nuova persona
export const createUser = async (userData) => {
  const data = await api("/users", { method: "POST", body: userData });
  return data.user;
};

// modifico dati, ruolo, negozio e ore
export const updateUser = async (userId, userData) => {
  const data = await api(`/users/${userId}`, {
    method: "PATCH",
    body: userData,
  });
  return data.user;
};

// elimino la persona (con turni e task)
export const deleteUser = async (userId) => {
  await api(`/users/${userId}`, { method: "DELETE" });
};
