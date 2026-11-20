# StoreSquad

[English](README.md) | Italiano

Web app gestionale per piccoli punti vendita, come il bookshop e lo shop di un museo:
turni, task, cassa, vendite, magazzino e forniture, con una vista per il **Responsabile**
e una per il **Dipendente**.

Progetto finale (capstone) del corso Epicode.

**Demo online:** https://store-squad-2e5c.vercel.app

## Account demo

Nella pagina di login ci sono i pulsanti per entrare con un clic.

| Ruolo        | Email                | Negozio        |
| ------------ | -------------------- | -------------- |
| Responsabile | responsabile@demo.it | tutti i negozi |
| Dipendente   | marta@demo.it        | Bookshop Museo |
| Dipendente   | giulia@demo.it       | Bookshop Museo |
| Dipendente   | luca@demo.it         | Shop Castello  |
| Dipendente   | paolo@demo.it        | Shop Castello  |

## Funzionalità

### Responsabile

- **Dashboard**: vendite di oggi per negozio, dipendenti in turno, task di oggi, prodotti sotto scorta e richieste di fornitura aperte. Ogni card apre la sua pagina con i filtri già impostati.
- **Turni**: la settimana di ogni dipendente con le ore di contratto e quelle pianificate; i turni non si sovrappongono.
- **Task**: giornaliere e mensili, assegnate a persone o a tutto il negozio, con priorità e categoria. Si sfogliano per giorno, settimana o mese con il calendario, anche quelle passate.
- **Vendite**: incasso, metodi di pagamento e venduto per aliquota IVA del giorno, della settimana o del mese; vendite annullate con il motivo.
- **Chiusure di cassa**: per ogni giorno fondo di apertura, incassi, imbustato e fondo di chiusura, con le differenze di contanti, POS e fondo in evidenza.
- **Report**: incasso da una settimana a un anno, grafico, prodotti più venduti e riepilogo IVA.
- **Forniture**: accoglie o respinge le richieste dei dipendenti.
- **Giacenze, catalogo prodotti** (con immagini), **utenti** e **negozi**.

### Dipendente

- **Dashboard**: i turni e le task di oggi.
- **Cassa**: apertura con il fondo cassa, vendita con il carrello (contanti o carta) e chiusura con imbustato, fondo di chiusura e totale del POS.
- **Vendite** del proprio negozio; può annullare le sue vendite di oggi indicando il motivo.
- **Task** da spuntare, **turni** della settimana con i colleghi, **giacenze**, **richieste di fornitura**, **catalogo** e **profilo** (avatar e password).

## Tecnologie

- **Frontend**: React 19, Vite, React Router, React Bootstrap, React Hook Form, Recharts, lucide-react
- **Backend**: Node.js, Express 5, MongoDB con Mongoose, JWT e bcrypt, express-validator, Cloudinary e multer per le immagini
- **Deploy**: Vercel (frontend) e Render (backend), database su MongoDB Atlas

## Struttura

```
store-squad/
├── backend/        API Express: un modulo per risorsa (routes, controller, service, schema)
├── frontend/       app React (Vite)
└── capstone-api/   collezione Bruno per provare le API
```

## Avvio in locale

Servono Node.js 20.19 o più recente, un database MongoDB (per esempio Atlas) e un account Cloudinary.

```bash
git clone https://github.com/serenap06/store-squad.git
cd store-squad
```

**Backend**

```bash
cd backend
npm install
cp .env.example .env    # poi compila le variabili
npm run seed            # dati di esempio
npm run dev             # http://localhost:<PORT>/api
```

**Frontend** (in un altro terminale)

```bash
cd frontend
npm install
cp .env.example .env    # poi compila le variabili
npm run dev             # http://localhost:5173
```

## Variabili d'ambiente

**backend/.env**

| Variabile               | A cosa serve                                                   |
| ----------------------- | -------------------------------------------------------------- |
| `DB_URL`                | indirizzo del database MongoDB                                 |
| `PORT`                  | porta del server                                               |
| `FRONTEND_URL`          | indirizzo del frontend, l'unico che può chiamare le API (CORS) |
| `JWT_SECRET`            | chiave per firmare i token di accesso                          |
| `JWT_EXPIRES_IN`        | durata del token (es. `1d`)                                    |
| `CLOUDINARY_CLOUD_NAME` | account Cloudinary per le immagini                             |
| `CLOUDINARY_API_KEY`    | chiave Cloudinary                                              |
| `CLOUDINARY_API_SECRET` | segreto Cloudinary                                             |
| `DEMO_PASSWORD`         | password degli account demo creati dal seed                    |

**frontend/.env**

| Variabile            | A cosa serve                                                  |
| -------------------- | ------------------------------------------------------------- |
| `VITE_API_URL`       | indirizzo del backend, con `/api` alla fine                   |
| `VITE_DEMO_PASSWORD` | la stessa password del seed: mostra i pulsanti demo nel login |

## Script

| Cartella | Comando           | Cosa fa                                  |
| -------- | ----------------- | ---------------------------------------- |
| backend  | `npm run dev`     | server con riavvio automatico (nodemon)  |
| backend  | `npm start`       | server (usato su Render)                 |
| backend  | `npm run seed`    | cancella e ricrea i dati di esempio      |
| frontend | `npm run dev`     | app in sviluppo                          |
| frontend | `npm run build`   | versione da pubblicare (cartella `dist`) |
| frontend | `npm run preview` | prova la build in locale                 |
| frontend | `npm run lint`    | controllo del codice con ESLint          |

## Dati di esempio

`npm run seed` **cancella tutto** e ricrea: 2 negozi, 5 utenti, 18 prodotti con giacenze, turni da gennaio a dicembre, task, richieste di fornitura, vendite e chiusure di cassa fino a oggi. Le date partono dal giorno in cui lo lanci, quindi conviene rilanciarlo prima di una demo.

## API

Tutte le rotte iniziano con `/api`: `auth`, `users`, `stores`, `products`, `stocks`, `shifts`, `tasks`, `sales`, `cash-sessions`, `supply-requests`, `reports`, `dashboard`. `GET /api/health` dice se il server è acceso.

Per provarle c'è la collezione [Bruno](https://www.usebruno.com/) nella cartella `capstone-api`:

1. crea `capstone-api/.env` con `DEMO_PASSWORD=...` (non va su git);
2. fai il login (`auth/login admin` o `auth/login employee`) e copia il token dalla risposta;
3. in Bruno crea un ambiente con la variabile `token` (segnala "Secret") e incollalo lì.

## Autrice

Serena Napoletano
