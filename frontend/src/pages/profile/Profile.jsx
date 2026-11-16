import "./profile.css";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Col, Container, Row, Spinner } from "react-bootstrap";
import { Camera } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { removeAvatar, updateProfile, uploadAvatar } from "../../api/users";
import { formatFullName } from "../../utils/formatFullName";
import { ROLE_LABEL } from "../../utils/roleLabel";

import Avatar from "../../components/common/avatar/Avatar";
import Button from "../../components/common/button/Button";
import FormField from "../../components/common/formField/FormField";
import PageHeader from "../../components/common/pageHeader/PageHeader";
import Panel from "../../components/common/panel/Panel";
import PasswordForm from "../../components/users/passwordForm/PasswordForm";

// peso massimo della foto, come nel backend: 2 MB = 2 × 1024 × 1024 byte
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

// pagina Profilo, uguale per responsabile e dipendente: foto, dati personali e incarico
const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const [error, setError] = useState("");
  // true dopo un salvataggio riuscito, per il messaggio "Dati salvati"
  const [isSaved, setIsSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  // aggancio all'input del file, che è nascosto: lo apre il bottone "Cambia foto"
  const fileInputRef = useRef(null);

  // isDirty: true se un campo è diverso dal valore di partenza (serve ad accendere "Salva")
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: { name: user.name, surname: user.surname, email: user.email },
  });

  // salvo i dati, rimetto l'utente nel contesto (la barra in alto si aggiorna)
  // e con reset i valori salvati diventano quelli di partenza
  const onSubmit = async (formData) => {
    setError("");
    setIsSaved(false);
    try {
      const updatedUser = await updateProfile(formData);
      setUser(updatedUser);
      reset({
        name: updatedUser.name,
        surname: updatedUser.surname,
        email: updatedUser.email,
      });
      setIsSaved(true);
    } catch (e) {
      setError(e.message);
    }
  };

  // scelta la foto: controllo il peso prima di mandarla, poi la carico
  const changeAvatar = async (event) => {
    const file = event.target.files[0];
    // svuoto l'input, così si può scegliere di nuovo lo stesso file
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_AVATAR_SIZE) {
      setError("La foto supera i 2 MB");
      return;
    }
    setError("");
    setIsUploading(true);
    try {
      const updatedUser = await uploadAvatar(file);
      setUser(updatedUser);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsUploading(false);
    }
  };

  // apre la finestra per scegliere il file (l'input vero è nascosto)
  const openFilePicker = () => fileInputRef.current.click();

  // tolgo la foto e rimetto l'utente nel contesto: anche in alto tornano le iniziali
  const removePhoto = async () => {
    setError("");
    setIsRemoving(true);
    try {
      const updatedUser = await removeAvatar();
      setUser(updatedUser);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Container fluid className="profile-page">
      <PageHeader
        title="Profilo"
        subtitle={`${formatFullName(user)} · ${ROLE_LABEL[user.role]}`}
        error={error}
      />

      <Row className="g-4">
        <Col lg={4}>
          <Panel title="Foto profilo">
            <div className="profile-photo">
              {/* il cerchio fa da riferimento per il bottone della fotocamera (position absolute) */}
              <div className="profile-avatar">
                <Avatar user={user} size={120} />
                {/* bottone tondo con la fotocamera in alto a destra del cerchio;
                    mentre carico al posto dell'icona gira lo spinner */}
                <button
                  type="button"
                  className="profile-avatar-camera"
                  aria-label={isUploading ? "Caricamento della foto" : "Cambia foto"}
                  onClick={openFilePicker}
                  disabled={isUploading || isRemoving}
                >
                  {isUploading ? (
                    <Spinner animation="border" size="sm" aria-hidden="true" />
                  ) : (
                    <Camera size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
              {/* input nascosto: accept mostra solo i formati che il backend accetta */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="d-none"
                onChange={changeAvatar}
              />
              {/* "Rimuovi foto" solo se c'è una foto: un link discreto sotto il cerchio */}
              {user.avatar && (
                <button
                  type="button"
                  className="profile-remove-photo"
                  onClick={removePhoto}
                  disabled={isUploading || isRemoving}
                >
                  {isRemoving ? "Rimozione..." : "Rimuovi foto"}
                </button>
              )}
              <p className="form-hint m-0">png, jpg o webp · massimo 2 MB</p>
            </div>
          </Panel>
        </Col>

        <Col lg={8} className="d-flex flex-column gap-4">
          <Panel title="I tuoi dati">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="form-stack"
            >
              <div className="form-row">
                <FormField
                  label="Nome"
                  htmlFor="profile-name"
                  error={errors.name?.message}
                >
                  <input
                    id="profile-name"
                    type="text"
                    className="form-input"
                    aria-invalid={errors.name ? "true" : "false"}
                    {...register("name", { required: "Scrivi il nome" })}
                  />
                </FormField>
                <FormField
                  label="Cognome"
                  htmlFor="profile-surname"
                  error={errors.surname?.message}
                >
                  <input
                    id="profile-surname"
                    type="text"
                    className="form-input"
                    aria-invalid={errors.surname ? "true" : "false"}
                    {...register("surname", { required: "Scrivi il cognome" })}
                  />
                </FormField>
              </div>

              {/* pattern: testo, una @, testo, un punto, testo */}
              <FormField
                label="Email"
                htmlFor="profile-email"
                error={errors.email?.message}
              >
                <input
                  id="profile-email"
                  type="email"
                  className="form-input"
                  aria-invalid={errors.email ? "true" : "false"}
                  {...register("email", {
                    required: "Scrivi l'email",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Email non valida",
                    },
                  })}
                />
              </FormField>

              {/* "Dati salvati" sparisce appena si modifica di nuovo un campo.
                  Salva è spento finché non cambia qualcosa */}
              <div className="form-actions align-items-center">
                {isSaved && !isDirty && (
                  <span className="profile-saved" role="status">
                    Dati salvati
                  </span>
                )}
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                  {isSubmitting ? "Salvataggio..." : "Salva"}
                </Button>
              </div>
            </form>
          </Panel>

          {/* la password demo è uguale per tutti: qui ognuno se la cambia */}
          <Panel title="Password">
            <PasswordForm />
          </Panel>

          {/* dati che decide il responsabile: qui si leggono e basta */}
          <Panel title="Il tuo incarico">
            <dl className="profile-info">
              <div className="profile-info-row">
                <dt>Ruolo</dt>
                <dd>{ROLE_LABEL[user.role]}</dd>
              </div>
              {user.store && (
                <div className="profile-info-row">
                  <dt>Negozio</dt>
                  <dd>
                    {user.store.name}
                    {user.store.city && ` · ${user.store.city}`}
                  </dd>
                </div>
              )}
              {user.weeklyHours != null && (
                <div className="profile-info-row">
                  <dt>Ore di contratto</dt>
                  <dd>{user.weeklyHours} h a settimana</dd>
                </div>
              )}
            </dl>
            {user.role === "employee" && (
              <p className="form-hint m-0">Solo il Responsabile può modificare questi dati.</p>
            )}
          </Panel>

          {/* su telefono "Esci" anche qui in fondo, come nel layout */}
          <Button variant="secondary" className="w-100 d-md-none" onClick={logout}>
            Esci
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
