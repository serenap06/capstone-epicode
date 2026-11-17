import "./profile.css";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Col, Container, Row } from "react-bootstrap";
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
  // la foto scelta e il suo indirizzo temporaneo per l'anteprima (null = nessuna scelta)
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // true dopo "Rimuovi foto": la foto salvata si toglie solo quando si preme Salva
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);
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

  // nel cerchio: la foto appena scelta, altrimenti quella salvata (se non l'ho rimossa)
  const shownAvatar = previewUrl ?? (isAvatarRemoved ? null : user.avatar);
  // true se la foto è cambiata e non è ancora salvata: anche questo accende "Salva"
  const isPhotoChanged =
    Boolean(avatarFile) || (isAvatarRemoved && Boolean(user.avatar));

  // con Salva mando solo quello che è cambiato: prima i dati, poi la foto.
  // Alla fine rimetto l'utente nel contesto (la barra in alto si aggiorna)
  // e con reset i valori salvati diventano quelli di partenza
  const onSubmit = async (formData) => {
    setError("");
    setIsSaved(false);
    try {
      let updatedUser = user;
      if (isDirty) {
        updatedUser = await updateProfile(formData);
      }
      // la foto nuova sostituisce la vecchia; se l'ho solo rimossa la tolgo
      if (avatarFile) {
        updatedUser = await uploadAvatar(avatarFile);
      } else if (isPhotoChanged) {
        updatedUser = await removeAvatar();
      }
      setUser(updatedUser);
      reset({
        name: updatedUser.name,
        surname: updatedUser.surname,
        email: updatedUser.email,
      });
      // la foto è salvata: tolgo l'anteprima e torno a mostrare quella dell'utente
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setAvatarFile(null);
      setPreviewUrl(null);
      setIsAvatarRemoved(false);
      setIsSaved(true);
    } catch (e) {
      setError(e.message);
    }
  };

  // scelta la foto: controllo il peso e preparo l'anteprima (si carica solo con Salva).
  // URL.createObjectURL crea un indirizzo temporaneo per vedere il file prima di caricarlo;
  // revokeObjectURL libera quello vecchio
  const chooseAvatar = (event) => {
    const file = event.target.files[0];
    // svuoto l'input, così si può scegliere di nuovo lo stesso file
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_AVATAR_SIZE) {
      setError("La foto supera i 2 MB");
      return;
    }
    setError("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // apre la finestra per scegliere il file (l'input vero è nascosto)
  const openFilePicker = () => fileInputRef.current.click();

  // "Rimuovi foto": tolgo l'anteprima e segno da togliere la foto salvata.
  // Sul server non cambia niente finché non si preme Salva
  const removePhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAvatarFile(null);
    setPreviewUrl(null);
    setIsAvatarRemoved(true);
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
                {/* copio l'utente con la foto da mostrare (anteprima o nessuna) */}
                <Avatar user={{ ...user, avatar: shownAvatar }} size={120} />
                {/* bottone tondo con la fotocamera in alto a destra del cerchio,
                    spento mentre salvo */}
                <button
                  type="button"
                  className="profile-avatar-camera"
                  aria-label="Cambia foto"
                  onClick={openFilePicker}
                  disabled={isSubmitting}
                >
                  <Camera size={18} aria-hidden="true" />
                </button>
              </div>
              {/* input nascosto: accept mostra solo i formati che il backend accetta */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="d-none"
                onChange={chooseAvatar}
              />
              {/* "Rimuovi foto" solo se nel cerchio c'è una foto: un link discreto sotto */}
              {shownAvatar && (
                <button
                  type="button"
                  className="profile-remove-photo"
                  onClick={removePhoto}
                  disabled={isSubmitting}
                >
                  Rimuovi foto
                </button>
              )}
              <p className="form-hint m-0">
                {avatarFile
                  ? `Foto scelta: ${avatarFile.name}`
                  : "png, jpg o webp · massimo 2 MB"}
              </p>
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

              {/* "Dati salvati" sparisce appena si modifica di nuovo un campo o la foto.
                  Salva è spento finché non cambia qualcosa (dati o foto) */}
              <div className="form-actions align-items-center">
                {isSaved && !isDirty && !isPhotoChanged && (
                  <span className="profile-saved" role="status">
                    Dati salvati
                  </span>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting || (!isDirty && !isPhotoChanged)}
                >
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
