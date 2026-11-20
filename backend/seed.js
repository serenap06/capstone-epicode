// variabili del file .env
require("dotenv").config();
// ora italiana anche per le date del seed
process.env.TZ = "Europe/Rome";
// import
const mongoose = require("mongoose");

const Store = require("./modules/stores/schema");
const User = require("./modules/users/schema");
const Product = require("./modules/products/schema");
const Stock = require("./modules/stock/schema");
const Shift = require("./modules/shifts/schema");
const Task = require("./modules/tasks/schema");
const SupplyRequest = require("./modules/supply-requests/schema");
const Sale = require("./modules/sales/schema");
const CashSession = require("./modules/cash-sessions/schema");

// password degli account demo dal .env (la stessa di VITE_DEMO_PASSWORD nel frontend)
const DEMO_PASSWORD = process.env.DEMO_PASSWORD;

// date: tutto l'anno in corso; vendite, casse e report arrivano fino a ora
const now = new Date();
const YEAR = now.getFullYear();

// giorno spostato di "days" giorni (negativo = indietro)
const addDays = (day, days) => {
  const date = new Date(day);
  date.setDate(date.getDate() + days);
  return date;
};

// quel giorno all'ora indicata
const atTime = (day, hour, minute = 0) => {
  const date = new Date(day);
  date.setHours(hour, minute, 0, 0);
  return date;
};

// mezzanotte di oggi
const today = atTime(now, 0);

// data rispetto a oggi: at(-1, 16) = ieri alle 16
const at = (days, hour, minute = 0) =>
  atTime(addDays(today, days), hour, minute);

// un giorno dell'anno (mese da 0: 0 = gennaio)
const dateOf = (month, day) => new Date(YEAR, month, day);

// tutti i giorni da "from" a "to" compresi
const eachDay = (from, to) => {
  const days = [];
  for (let day = atTime(from, 0); day <= to; day = addDays(day, 1)) {
    days.push(day);
  }
  return days;
};

// chiave di un giorno per le Map: "Fri Nov 20 2026"
const dayKey = (day) => day.toDateString();

// giorno della settimana: 0 = lunedì, 6 = domenica
const weekdayOf = (day) => (day.getDay() + 6) % 7;

// giorni di chiusura: 1 gennaio, 1 maggio e Natale
const CLOSED_DAYS = [dateOf(0, 1), dateOf(4, 1), dateOf(11, 25)].map(dayKey);

// gente in negozio mese per mese (1 = normale): poca d'inverno, tanta d'estate e a dicembre
const MONTH_TRAFFIC = [
  0.6, 0.6, 0.8, 1.1, 1, 1.1, 1.3, 1.4, 1.1, 0.9, 0.7, 1.2,
];

// vendite in un giorno normale, per negozio
const DAILY_SALES = { "Bookshop Museo": 18, "Shop Castello": 10 };

// quanto si vende ogni prodotto (più alto = più vendite)
const PRODUCT_POPULARITY = {
  "Guida del museo": 6,
  "Catalogo della mostra": 3,
  "Guida per bambini": 3,
  "Libro fotografico": 1,
  "Set cartoline": 10,
  Poster: 5,
  Segnalibro: 8,
  Quaderno: 4,
  "Matita con logo": 6,
  Magnete: 9,
  "Borsa in tela": 3,
  Tazza: 3,
  Portachiavi: 6,
  "T-shirt": 2,
  Ombrello: 1,
  "Biscotti artigianali": 4,
  Cioccolatini: 3,
};

// prodotti che un negozio non vende
const NOT_IN_STORE = {
  "Bookshop Museo": ["Ombrello"],
  "Shop Castello": ["Libro fotografico", "Guida per bambini"],
};

// giacenze attuali sotto soglia (anche finite), per negozio
const LOW_STOCK = {
  "Bookshop Museo": {
    Poster: 3,
    "Catalogo della mostra": 2,
    Tazza: 0,
    Cioccolatini: 4,
  },
  "Shop Castello": {
    "Guida del museo": 4,
    "Set cartoline": 8,
    Magnete: 0,
    "T-shirt": 3,
  },
};

// soglia minima per categoria
const MIN_THRESHOLDS = { libri: 5, cartoleria: 15, gadget: 10, alimentari: 10 };

// motivi degli annullamenti e delle richieste respinte
const CANCEL_REASONS = [
  "Errore nel metodo di pagamento: il cliente ha pagato con la carta",
  "Il cliente ha cambiato idea prima di uscire",
  "Prodotto battuto due volte",
  "Prezzo sbagliato, vendita rifatta",
];
const REJECT_REASONS = [
  "Quantità troppo alta per questo periodo: riordiniamo il mese prossimo",
  "Prodotto in uscita dal catalogo: non lo riordiniamo",
  "Ne arrivano già con l'ordine della settimana scorsa",
];

// numeri "a caso" da una formula fissa: rilanciando il seed i dati sono uguali
let randomSeed = 7;
const random = (max) => {
  randomSeed = (randomSeed * 9301 + 49297) % 233280;
  return Math.floor((randomSeed / 233280) * max);
};

// un elemento a caso: chi ha il peso più alto esce più spesso
const pickWeighted = (items, getWeight) => {
  const totalWeight = items.reduce((sum, item) => sum + getWeight(item), 0);
  let target = (random(1000) / 1000) * totalWeight;
  for (const item of items) {
    target -= getWeight(item);
    if (target < 0) return item;
  }
  return items[items.length - 1];
};

// arrotondo ai centesimi
const round = (value) => Math.round(value * 100) / 100;

// quanto si vende un prodotto in quel mese: ombrelli d'inverno, t-shirt d'estate, cioccolatini a dicembre
const getPopularity = (product, month) => {
  let popularity = PRODUCT_POPULARITY[product.name];
  if (product.name === "Ombrello" && (month <= 2 || month >= 9)) {
    popularity *= 3;
  }
  if (product.name === "T-shirt" && month >= 5 && month <= 7) popularity *= 2;
  if (product.name === "Cioccolatini" && month === 11) popularity *= 3;
  return popularity;
};

// una vendita con gli stessi calcoli del servizio; lines = [prodotto, quantità]
const buildSale = (employee, time, paymentMethod, lines) => {
  const items = lines.map(([product, quantity]) => {
    const lineTotal = product.price * quantity;
    return {
      product: product._id,
      name: product.name,
      unitPrice: product.price,
      vatRate: product.vatRate,
      quantity,
      // il prezzo comprende l'IVA
      vatAmount: round(lineTotal - lineTotal / (1 + product.vatRate / 100)),
    };
  });
  const total = round(
    items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  );
  const vatTotal = round(items.reduce((sum, item) => sum + item.vatAmount, 0));
  return {
    store: employee.store,
    soldBy: employee._id,
    items,
    total,
    netTotal: round(total - vatTotal),
    vatTotal,
    paymentMethod,
    createdAt: time,
  };
};

// una vendita annullata: chi l'ha fatta la annulla due minuti dopo
const buildCancelledSale = (employee, time, paymentMethod, lines, reason) => ({
  ...buildSale(employee, time, paymentMethod, lines),
  cancelled: true,
  cancelReason: reason,
  cancelledBy: employee._id,
  cancelledAt: new Date(time.getTime() + 2 * 60000),
});

// riempio il database con i dati della demo
const seed = async () => {
  // senza password demo mi fermo con un messaggio
  if (!DEMO_PASSWORD) {
    console.error("Seed error: scrivi DEMO_PASSWORD nel file .env");
    process.exitCode = 1;
    return;
  }

  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("MongoDB connected, seeding...");

    // 1. svuoto le collezioni
    await CashSession.deleteMany();
    await Sale.deleteMany();
    await SupplyRequest.deleteMany();
    await Task.deleteMany();
    await Shift.deleteMany();
    await Stock.deleteMany();
    await User.deleteMany();
    await Product.deleteMany();
    await Store.deleteMany();

    // 2. negozi
    const [storeA, storeB] = await Store.create([
      { name: "Bookshop Museo", address: "Via Roma 1", city: "Napoli" },
      { name: "Shop Castello", address: "Via Milano 2", city: "Napoli" },
    ]);
    const stores = [storeA, storeB];

    // 3. utenti (create e non insertMany: così lo schema cripta le password)
    const [manager, marta, luca, giulia, paolo] = await User.create([
      {
        name: "Laura",
        surname: "Rossi",
        email: "responsabile@demo.it",
        password: DEMO_PASSWORD,
        role: "admin",
      },
      {
        name: "Marta",
        surname: "Bianchi",
        email: "marta@demo.it",
        password: DEMO_PASSWORD,
        role: "employee",
        weeklyHours: 40,
        store: storeA._id,
      },
      {
        name: "Luca",
        surname: "Verdi",
        email: "luca@demo.it",
        password: DEMO_PASSWORD,
        role: "employee",
        weeklyHours: 40,
        store: storeB._id,
      },
      {
        name: "Giulia",
        surname: "Neri",
        email: "giulia@demo.it",
        password: DEMO_PASSWORD,
        role: "employee",
        weeklyHours: 30,
        store: storeA._id,
      },
      {
        name: "Paolo",
        surname: "Gialli",
        email: "paolo@demo.it",
        password: DEMO_PASSWORD,
        role: "employee",
        weeklyHours: 20,
        store: storeB._id,
      },
    ]);
    const employees = [marta, luca, giulia, paolo];
    // dipendente dal suo id
    const employeeById = new Map(
      employees.map((employee) => [String(employee._id), employee]),
    );
    // i dipendenti di un negozio
    const getStoreEmployees = (store) =>
      employees.filter((employee) => employee.store.equals(store._id));

    // 4. prodotti, senza foto (si caricano dal Catalogo): libri al 4%, dolci al 10%,
    // gli altri al 22%. Il taccuino non è attivo (lo vede solo il responsabile)
    const products = await Product.create([
      {
        name: "Guida del museo",
        description: "Guida illustrata con le opere principali",
        price: 12,
        brand: "Edizioni Locali",
        category: "libri",
        vatRate: 4,
      },
      {
        name: "Catalogo della mostra",
        price: 25,
        brand: "Edizioni Locali",
        category: "libri",
        vatRate: 4,
      },
      {
        name: "Guida per bambini",
        description: "Il museo raccontato ai più piccoli",
        price: 9,
        brand: "Edizioni Locali",
        category: "libri",
        vatRate: 4,
      },
      {
        name: "Libro fotografico",
        price: 35,
        brand: "Edizioni Locali",
        category: "libri",
        vatRate: 4,
      },
      { name: "Set cartoline", price: 3, category: "cartoleria" },
      { name: "Poster", price: 8, category: "cartoleria" },
      { name: "Segnalibro", price: 2, category: "cartoleria" },
      { name: "Quaderno", price: 5, category: "cartoleria" },
      { name: "Matita con logo", price: 1.5, category: "cartoleria" },
      {
        name: "Taccuino",
        description: "Fuori produzione: non più in vendita",
        price: 6,
        category: "cartoleria",
        active: false,
      },
      { name: "Magnete", price: 4.5, category: "gadget" },
      {
        name: "Borsa in tela",
        description: "Borsa in cotone con stampa originale",
        price: 15,
        category: "gadget",
      },
      { name: "Tazza", price: 10, category: "gadget" },
      { name: "Portachiavi", price: 4, category: "gadget" },
      { name: "T-shirt", price: 18, category: "gadget" },
      { name: "Ombrello", price: 14, category: "gadget" },
      {
        name: "Biscotti artigianali",
        description: "Biscotti al burro in scatola di latta",
        price: 6.5,
        brand: "Forno del Borgo",
        category: "alimentari",
        vatRate: 10,
      },
      {
        name: "Cioccolatini",
        price: 8,
        brand: "Forno del Borgo",
        category: "alimentari",
        vatRate: 10,
      },
    ]);
    // prodotti per nome: productByName["Poster"]
    const productByName = Object.fromEntries(
      products.map((product) => [product.name, product]),
    );
    // i prodotti attivi che un negozio vende
    const getStoreProducts = (store) =>
      products.filter(
        (product) =>
          product.active && !NOT_IN_STORE[store.name].includes(product.name),
      );

    // 5. giacenze attuali: qualcuna sotto soglia o finita (le altre abbondanti)
    const stockRows = [];
    stores.forEach((store) => {
      getStoreProducts(store).forEach((product) => {
        const minThreshold = MIN_THRESHOLDS[product.category];
        const lowAmount = LOW_STOCK[store.name][product.name];
        stockRows.push({
          product: product._id,
          store: store._id,
          amount: lowAmount ?? minThreshold * 3 + random(20),
          minThreshold,
        });
      });
    });
    await Stock.create(stockRows);

    // 6. turni da gennaio a dicembre: ogni dipendente ha la sua settimana tipo
    // (0 = lunedì: [inizio, fine]); il negozio è coperto tutti i giorni
    const WEEK_PLANS = new Map([
      [marta, { 0: [9, 17], 1: [9, 17], 4: [9, 17], 5: [9, 17], 6: [9, 17] }],
      [giulia, { 2: [9, 17], 3: [9, 17], 5: [13, 19], 6: [13, 21] }],
      [luca, { 0: [9, 17], 1: [9, 17], 2: [9, 17], 5: [9, 17], 6: [9, 17] }],
      [paolo, { 3: [9, 17], 4: [9, 17], 6: [13, 17] }],
    ]);
    // ferie: il collega fa i suoi turni nei giorni in cui è libero (ore in più)
    const HOLIDAYS = [
      {
        employee: giulia,
        from: dateOf(1, 16),
        to: dateOf(1, 22),
        substitute: marta,
      },
      {
        employee: paolo,
        from: dateOf(2, 23),
        to: dateOf(2, 29),
        substitute: luca,
      },
      {
        employee: luca,
        from: dateOf(6, 6),
        to: dateOf(6, 12),
        substitute: paolo,
      },
      {
        employee: marta,
        from: dateOf(7, 10),
        to: dateOf(7, 23),
        substitute: giulia,
      },
    ];
    // malattia: Giulia sabato scorso (quella settimana fa meno ore del contratto)
    const mondayOfThisWeek = addDays(today, -weekdayOf(today));
    const sickDay = dayKey(addDays(mondayOfThisWeek, -2));

    const shifts = [];
    eachDay(dateOf(0, 1), dateOf(11, 31)).forEach((day) => {
      if (CLOSED_DAYS.includes(dayKey(day))) return;
      const weekday = weekdayOf(day);
      employees.forEach((employee) => {
        const hours = WEEK_PLANS.get(employee)[weekday];
        // giorno di riposo, o Giulia in malattia
        if (!hours) return;
        if (employee === giulia && dayKey(day) === sickDay) return;
        // in ferie: il turno lo fa il collega, solo se quel giorno è libero
        const holiday = HOLIDAYS.find(
          (item) =>
            item.employee === employee && day >= item.from && day <= item.to,
        );
        const worker = holiday ? holiday.substitute : employee;
        if (holiday && WEEK_PLANS.get(worker)[weekday]) return;
        shifts.push({
          user: worker._id,
          store: employee.store,
          startAt: atTime(day, hours[0]),
          endAt: atTime(day, hours[1]),
        });
      });
    });
    // insertMany: con centinaia di documenti è molto più veloce di create
    await Shift.insertMany(shifts);

    // turni di un negozio in un giorno: chi vende, chi apre e chi chiude la cassa
    const shiftsByDay = new Map();
    shifts.forEach((shift) => {
      const key = `${shift.store}|${dayKey(shift.startAt)}`;
      if (!shiftsByDay.has(key)) shiftsByDay.set(key, []);
      shiftsByDay.get(key).push(shift);
    });
    const getDayShifts = (store, day) =>
      shiftsByDay.get(`${store._id}|${dayKey(day)}`) ?? [];
    // il primo turno che inizia e l'ultimo che finisce
    const getFirstShift = (dayShifts) =>
      dayShifts.reduce((first, shift) =>
        shift.startAt < first.startAt ? shift : first,
      );
    const getLastShift = (dayShifts) =>
      dayShifts.reduce((last, shift) =>
        shift.endAt > last.endAt ? shift : last,
      );

    // 7. task: le giornaliere da una settimana fa alla prossima (a chi è in turno),
    // le mensili da gennaio a questo mese, qualche task singola e la riunione generale
    const tasks = [];
    // un gruppo di task: una copia per dipendente, stesso groupId (completedAt null = da fare)
    const addTask = (taskData, assignees, completedAt) => {
      const groupId = new mongoose.Types.ObjectId();
      assignees.forEach((employee) => {
        tasks.push({
          ...taskData,
          createdBy: manager._id,
          assignedTo: employee._id,
          store: employee.store,
          groupId,
          status: completedAt ? "done" : "pending",
          completedAt: completedAt ?? undefined,
        });
      });
    };

    // giornaliere: apertura a chi apre, riordino a tutti, corrispettivi a chi chiude
    eachDay(at(-7, 0), at(7, 0)).forEach((day) => {
      stores.forEach((store) => {
        const dayShifts = getDayShifts(store, day);
        if (dayShifts.length === 0) return;
        const firstShift = getFirstShift(dayShifts);
        const lastShift = getLastShift(dayShifts);
        const onShift = [
          ...new Set(dayShifts.map((shift) => String(shift.user))),
        ].map((employeeId) => employeeById.get(employeeId));

        const dailyTasks = [
          {
            title: "Apertura cassa",
            description: "Conta del fondo cassa e accensione del POS",
            dueDate: new Date(firstShift.startAt.getTime() + 30 * 60000),
            priority: "high",
            category: "operations",
            assignees: [employeeById.get(String(firstShift.user))],
          },
          {
            title: "Riordino espositori",
            description:
              "Riallestimento degli espositori di cartoline e gadget",
            dueDate: atTime(day, 15),
            priority: "medium",
            category: "operations",
            assignees: onShift,
          },
          {
            title: "Controllo corrispettivi giornalieri",
            description: "Verifica dei corrispettivi e chiusura della cassa",
            dueDate: lastShift.endAt,
            priority: "high",
            category: "administrative",
            assignees: [employeeById.get(String(lastShift.user))],
          },
        ];

        dailyTasks.forEach(({ assignees, ...taskData }) => {
          // fatta se è passata; tre giorni fa al Bookshop il riordino è saltato;
          // oggi il Bookshop deve ancora aprire la cassa (si fa nella demo)
          const isMissed =
            store === storeA &&
            taskData.title === "Riordino espositori" &&
            dayKey(day) === dayKey(at(-3, 0));
          const isDemo = store === storeA && dayKey(day) === dayKey(today);
          const isDone = taskData.dueDate < now && !isMissed && !isDemo;
          addTask(
            { ...taskData, type: "daily" },
            assignees,
            isDone ? new Date(taskData.dueDate.getTime() - 10 * 60000) : null,
          );
        });
      });
    });

    // mensili: inventario a chi è a tempo pieno, documenti a chi è part-time.
    // A settembre Paolo ha dimenticato i documenti di trasporto
    for (let month = 0; month <= today.getMonth(); month++) {
      const dueDate = new Date(YEAR, month + 1, 0, 18);
      const isPast = dueDate < now;
      [
        [marta, giulia],
        [luca, paolo],
      ].forEach(([fullTime, partTime]) => {
        addTask(
          {
            title: "Inventario mensile",
            description: "Conteggio completo della merce in negozio",
            dueDate,
            priority: "medium",
            category: "operations",
            type: "monthly",
          },
          [fullTime],
          isPast ? atTime(dueDate, 17) : null,
        );
        const isForgotten = partTime === paolo && month === 8;
        addTask(
          {
            title: "Controllo documenti di trasporto",
            description: "Verifica dei documenti di trasporto del mese",
            dueDate,
            priority: "medium",
            category: "administrative",
            type: "monthly",
          },
          [partTime],
          isPast && !isForgotten ? atTime(dueDate, 16, 30) : null,
        );
      });
    }

    // inizio del prossimo turno di un dipendente da domani (a fine anno: domani alle 9)
    const getNextShiftStart = (employee) =>
      shifts.find(
        (shift) => shift.user.equals(employee._id) && shift.startAt >= at(1, 0),
      )?.startAt ?? at(1, 9);

    // task singole: una persona, oppure due insieme (stesso gruppo)
    addTask(
      {
        title: "Etichette prezzi nuovi arrivi",
        description: "Prezzi sui libri arrivati con l'ultimo ordine",
        dueDate: new Date(getNextShiftStart(giulia).getTime() + 3 * 3600000),
        priority: "low",
        category: "operations",
        type: "daily",
      },
      [giulia],
      null,
    );
    addTask(
      {
        title: "Pulizia vetrine",
        dueDate: new Date(getNextShiftStart(paolo).getTime() + 2 * 3600000),
        priority: "low",
        category: "operations",
        type: "daily",
      },
      [paolo],
      null,
    );
    const christmasWindow = atTime(dateOf(11, 1), 12);
    addTask(
      {
        title: "Allestimento vetrina di Natale",
        description: "Vetrina a tema con cioccolatini, tazze e libri",
        dueDate: christmasWindow,
        priority: "medium",
        category: "operations",
        type: "daily",
      },
      [marta, giulia],
      christmasWindow < now ? atTime(christmasWindow, 11) : null,
    );

    // riunione generale lunedì prossimo: isGlobal, tutti i dipendenti, un gruppo per negozio
    stores.forEach((store) => {
      addTask(
        {
          title: "Riunione generale",
          description: "Aggiornamento sul programma delle prossime mostre",
          dueDate: atTime(addDays(mondayOfThisWeek, 7), 9),
          priority: "medium",
          category: "administrative",
          type: "daily",
          isGlobal: true,
        },
        getStoreEmployees(store),
        null,
      );
    });

    await Task.insertMany(tasks);

    // 8. richieste di fornitura da gennaio: due o tre al mese per negozio, accolte o respinte.
    // Le ultime due settimane le scrivo a mano: quelle in attesa sono sui prodotti sotto scorta
    const supplyRequests = [];
    stores.forEach((store) => {
      const storeProducts = getStoreProducts(store);
      const storeEmployees = getStoreEmployees(store);
      for (
        let day = dateOf(0, 10);
        day < at(-14, 0);
        day = addDays(day, 10 + random(10))
      ) {
        const product = pickWeighted(storeProducts, (item) =>
          getPopularity(item, day.getMonth()),
        );
        const isRejected = random(6) === 0;
        supplyRequests.push({
          product: product._id,
          requestedBy: storeEmployees[random(storeEmployees.length)]._id,
          store: store._id,
          requestedAmount:
            product.category === "libri" ? 10 : 10 * (2 + random(4)),
          state: isRejected ? "rejected" : "handled",
          handledBy: manager._id,
          handledAt: atTime(addDays(day, 1 + random(3)), 15),
          rejectReason: isRejected
            ? REJECT_REASONS[random(REJECT_REASONS.length)]
            : undefined,
          createdAt: atTime(day, 10, random(60)),
        });
      }
    });

    // una richiesta delle ultime due settimane (handled: stato, chi e quando l'ha gestita)
    const recentRequest = (
      productName,
      employee,
      amount,
      createdAt,
      handled,
    ) => ({
      product: productByName[productName]._id,
      requestedBy: employee._id,
      store: employee.store,
      requestedAmount: amount,
      createdAt,
      ...handled,
    });
    supplyRequests.push(
      recentRequest("Set cartoline", marta, 50, at(-9, 11), {
        state: "handled",
        handledBy: manager._id,
        handledAt: at(-8, 15),
      }),
      recentRequest("Tazza", giulia, 12, at(-6, 10), {
        state: "rejected",
        handledBy: manager._id,
        handledAt: at(-5, 12),
        rejectReason:
          "Il fornitore ha aumentato il costo: per ora non la riordiniamo",
      }),
      recentRequest("Catalogo della mostra", giulia, 10, at(-2, 11), {}),
      recentRequest("Poster", marta, 20, at(-1, 16), {}),
      recentRequest("Guida del museo", luca, 15, at(-10, 10), {
        state: "handled",
        handledBy: manager._id,
        handledAt: at(-9, 17),
      }),
      recentRequest("Matita con logo", paolo, 40, at(-12, 9), {
        state: "rejected",
        handledBy: manager._id,
        handledAt: at(-11, 12),
        rejectReason: "Ne arrivano già con l'ordine della settimana scorsa",
      }),
      recentRequest("Set cartoline", paolo, 50, at(-3, 14), {}),
      recentRequest("Magnete", luca, 30, at(-1, 10), {}),
    );
    await SupplyRequest.insertMany(supplyRequests);

    // 9. vendite dal 1 gennaio a ora: più gente d'estate e nel fine settimana,
    // le vende chi è in turno, circa una su trenta è annullata.
    // Il Bookshop oggi non ha vendite: la cassa si apre nella demo
    const sales = [];
    // contanti e carta delle vendite valide per negozio e giorno, per le casse
    const cashByDay = new Map();
    const cardByDay = new Map();
    stores.forEach((store) => {
      const storeProducts = getStoreProducts(store);
      eachDay(dateOf(0, 1), today).forEach((day) => {
        if (store === storeA && dayKey(day) === dayKey(today)) return;
        const dayShifts = getDayShifts(store, day);
        if (dayShifts.length === 0) return;
        const opening = getFirstShift(dayShifts).startAt.getTime();
        const closing = getLastShift(dayShifts).endAt.getTime();
        const weekendTraffic = weekdayOf(day) >= 5 ? 1.5 : 1;
        const saleCount = Math.round(
          DAILY_SALES[store.name] *
            MONTH_TRAFFIC[day.getMonth()] *
            weekendTraffic *
            (0.8 + random(40) / 100),
        );

        for (let saleIndex = 0; saleIndex < saleCount; saleIndex++) {
          // un minuto a caso tra l'apertura e un quarto d'ora prima della chiusura
          const openMinutes = (closing - opening) / 60000 - 15;
          const time = new Date(opening + random(openMinutes) * 60000);
          // oggi solo fino a ora
          if (time > now) continue;
          // vende chi è in turno in quel momento
          const sellers = dayShifts.filter(
            (shift) => shift.startAt <= time && shift.endAt > time,
          );
          if (sellers.length === 0) continue;
          const seller = employeeById.get(
            String(sellers[random(sellers.length)].user),
          );

          // da 1 a 3 prodotti diversi: i libri uno alla volta, il resto da 1 a 3 pezzi
          const lineCount = [1, 1, 2, 3][random(4)];
          const lines = [];
          while (lines.length < lineCount) {
            const product = pickWeighted(storeProducts, (item) =>
              getPopularity(item, day.getMonth()),
            );
            if (lines.some(([lineProduct]) => lineProduct === product))
              continue;
            lines.push([
              product,
              product.category === "libri" ? 1 : 1 + random(3),
            ]);
          }
          // contanti più spesso per le spese piccole
          const total = lines.reduce(
            (sum, [product, quantity]) => sum + product.price * quantity,
            0,
          );
          const paymentMethod =
            random(100) < (total < 15 ? 60 : 30) ? "cash" : "card";

          const sale =
            random(30) === 0
              ? buildCancelledSale(
                  seller,
                  time,
                  paymentMethod,
                  lines,
                  CANCEL_REASONS[random(CANCEL_REASONS.length)],
                )
              : buildSale(seller, time, paymentMethod, lines);
          sales.push(sale);

          if (!sale.cancelled) {
            const byDay = paymentMethod === "cash" ? cashByDay : cardByDay;
            const key = `${store._id}|${dayKey(day)}`;
            byDay.set(key, (byDay.get(key) ?? 0) + sale.total);
          }
        }
      });
    });
    await Sale.insertMany(sales);

    // 10. casse dal 1 gennaio a oggi, una per negozio al giorno: apre chi inizia per primo,
    // chiude chi finisce per ultimo; il fondo resta nel cassetto, il resto va nella busta
    const CASH_EVENTS = [
      // differenze di chiusura durante l'anno
      { store: storeB, day: dateOf(1, 7), difference: 0.5 },
      { store: storeA, day: dateOf(2, 14), difference: -10 },
      { store: storeB, day: dateOf(3, 25), difference: -5 },
      { store: storeA, day: dateOf(6, 22), difference: -2.5 },
      { store: storeB, day: dateOf(7, 16), difference: -7.5 },
      { store: storeA, day: dateOf(8, 5), difference: 1 },
      { store: storeB, day: dateOf(9, 3), difference: 2 },
      { store: storeA, day: dateOf(9, 18), difference: -20 },
      // fondo di apertura diverso dall'ultima chiusura
      { store: storeA, day: dateOf(2, 21), openingFloat: 90 },
      // POS diverso dalle vendite con carta
      { store: storeB, day: dateOf(4, 12), posDifference: -15 },
      { store: storeA, day: dateOf(10, 9), posDifference: 6.5 },
      // gli ultimi giorni: in più, fondo diverso, mancano soldi, cassa non chiusa
      { store: storeA, day: at(-1, 0), difference: 2.5 },
      { store: storeA, day: at(-2, 0), openingFloat: 80 },
      { store: storeB, day: at(-3, 0), difference: -5 },
      { store: storeB, day: at(-4, 0), notClosed: true },
      // pagata con carta ma registrata in contanti: mancano contanti, sul POS ce n'è di più
      { store: storeA, day: at(-5, 0), difference: -18, posDifference: 18 },
      // un pagamento con carta non passato sul POS
      { store: storeB, day: at(-6, 0), posDifference: -12 },
    ];
    // fondo di chiusura: 100 €, lo Shop Castello passa a 150 € dal 31 maggio (estate, più resto)
    const getStandardFloat = (store, day) =>
      store === storeB && day >= dateOf(4, 31) ? 150 : 100;

    const cashSessions = [];
    stores.forEach((store) => {
      // l'ultimo fondo di chiusura: il fondo di partenza del giorno dopo
      let lastClosingFloat = 100;
      eachDay(dateOf(0, 1), today).forEach((day) => {
        const isToday = dayKey(day) === dayKey(today);
        if (store === storeA && isToday) return;
        const dayShifts = getDayShifts(store, day);
        if (dayShifts.length === 0) return;
        const firstShift = getFirstShift(dayShifts);
        const lastShift = getLastShift(dayShifts);
        // si apre cinque minuti prima del primo turno (oggi solo se è già ora)
        const openedAt = new Date(firstShift.startAt.getTime() - 5 * 60000);
        if (openedAt > now) return;

        const event =
          CASH_EVENTS.find(
            (item) => item.store === store && dayKey(item.day) === dayKey(day),
          ) ?? {};
        const cashSession = {
          store: store._id,
          day,
          openingFloat: event.openingFloat ?? lastClosingFloat,
          openedBy: firstShift.user,
          createdAt: openedAt,
        };
        // oggi resta aperta; quel giorno qualcuno ha dimenticato di chiuderla
        if (isToday || event.notClosed) {
          cashSessions.push(cashSession);
          return;
        }

        // attesi = fondo + contanti incassati; contati = attesi + differenza
        const cashSales = round(
          cashByDay.get(`${store._id}|${dayKey(day)}`) ?? 0,
        );
        const expectedCash = round(cashSession.openingFloat + cashSales);
        const difference = event.difference ?? 0;
        const countedCash = round(expectedCash + difference);
        // POS: lo scontrino del terminale = vendite con carta + differenza
        const cardSales = round(
          cardByDay.get(`${store._id}|${dayKey(day)}`) ?? 0,
        );
        const posDifference = event.posDifference ?? 0;
        // il fondo per domani, mai più dei contanti contati
        const closingFloat = Math.min(
          getStandardFloat(store, day),
          countedCash,
        );
        cashSessions.push({
          ...cashSession,
          closingFloat,
          envelopeAmount: round(countedCash - closingFloat),
          cashSales,
          expectedCash,
          difference,
          cardSales,
          posAmount: round(cardSales + posDifference),
          posDifference,
          closedBy: lastShift.user,
          closedAt: new Date(lastShift.endAt.getTime() - 10 * 60000),
        });
        lastClosingFloat = closingFloat;
      });
    });
    await CashSession.insertMany(cashSessions);

    console.log(
      `${products.length} prodotti, ${shifts.length} turni, ${tasks.length} task, ` +
        `${supplyRequests.length} richieste, ${sales.length} vendite, ${cashSessions.length} casse`,
    );
    // la password non la stampo
    console.log("Seed completed");
    console.log("Login Responsabile: responsabile@demo.it");
    console.log("Login Dipendente:   marta@demo.it");
  } catch (e) {
    console.error("Seed error:", e.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
