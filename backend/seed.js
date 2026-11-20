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

// data e ora rispetto a oggi: day 0 = oggi, 1 = domani, -1 = ieri
const at = (day, hour, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + day);
  date.setHours(hour, minute, 0, 0);
  return date;
};

// arrotondo ai centesimi
const round = (value) => Math.round(value * 100) / 100;

// una vendita con gli stessi calcoli del servizio; lines = [prodotto, quantità]
const buildSale = (employee, day, hour, paymentMethod, lines) => {
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
    createdAt: at(day, hour),
  };
};

// una vendita annullata: chi l'ha fatta la annulla due minuti dopo
const buildCancelledSale = (
  employee,
  day,
  hour,
  paymentMethod,
  lines,
  reason,
) => ({
  ...buildSale(employee, day, hour, paymentMethod, lines),
  cancelled: true,
  cancelReason: reason,
  cancelledBy: employee._id,
  cancelledAt: at(day, hour, 2),
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

    // 4. prodotti, senza foto (si caricano dal Catalogo): libri al 4%, gli altri al 22%.
    // Il taccuino non è attivo (lo vede solo il responsabile)
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
    ]);
    // prodotti per nome: productByName["Poster"]
    const productByName = Object.fromEntries(
      products.map((product) => [product.name, product]),
    );
    // solo gli attivi si vendono e si riordinano
    const activeProducts = products.filter((product) => product.active);

    // 5. giacenze: ogni prodotto attivo in tutti e due i negozi, qualcuna sotto soglia
    const lowStock = {
      [storeA._id]: ["Poster", "Catalogo della mostra", "Tazza"],
      [storeB._id]: ["Guida del museo", "Set cartoline", "Magnete", "T-shirt"],
    };
    const stockRows = [];
    [storeA, storeB].forEach((store) => {
      activeProducts.forEach((product, index) => {
        const isLow = lowStock[store._id].includes(product.name);
        const minThreshold = 5 + (index % 3) * 5; // 5, 10 o 15
        stockRows.push({
          product: product._id,
          store: store._id,
          // sotto soglia: meno della soglia (anche 0); le altre abbondanti
          amount: isLow ? index % minThreshold : minThreshold * 4 + index,
          minThreshold,
        });
      });
    });
    await Stock.create(stockRows);

    // 6. turni da 8 ore, settimana in corso e prossima: tanti giorni quanti ne servono
    // per il contratto; offset sfalsa i riposi, così i colleghi si incrociano
    const mondayOffset = -((new Date().getDay() + 6) % 7);
    const shiftPlan = [
      { employee: marta, workDays: 5, offset: 0, morning: true },
      { employee: giulia, workDays: 4, offset: 4, morning: false },
      { employee: luca, workDays: 5, offset: 0, morning: true },
      { employee: paolo, workDays: 3, offset: 3, morning: false },
    ];

    const shifts = [];
    shiftPlan.forEach(({ employee, workDays, offset, morning }) => {
      for (let dayIndex = 0; dayIndex < 14; dayIndex++) {
        if ((dayIndex + offset) % 7 >= workDays) continue; // giorno di riposo
        const day = mondayOffset + dayIndex;
        shifts.push({
          user: employee._id,
          store: employee.store,
          startAt: at(day, morning ? 9 : 13),
          endAt: at(day, morning ? 17 : 21),
        });
      }
    });
    await Shift.create(shifts);

    // 7. task: ognuna con il suo groupId e il suo negozio (base() crea un groupId nuovo ogni volta)
    const base = (employee) => ({
      createdBy: manager._id,
      assignedTo: employee._id,
      store: employee.store,
      groupId: new mongoose.Types.ObjectId(),
    });

    // i dipendenti di un negozio
    const getStoreEmployees = (store) =>
      employees.filter(
        (employee) => employee.store.toString() === store._id.toString(),
      );

    const tasks = [];

    // task di oggi: una per negozio, una copia per dipendente (stesso groupId)
    const dailyTasks = [
      {
        title: "Apertura cassa",
        description: "Controllo del fondo cassa e accensione del POS",
        dueDate: at(0, 10),
        priority: "high",
        category: "operations",
        doneBy: [marta, luca],
      },
      {
        title: "Riordino espositori",
        description: "Riallestimento degli espositori di cartoline e gadget",
        dueDate: at(0, 15),
        priority: "medium",
        category: "operations",
        doneBy: [marta],
      },
      {
        title: "Controllo corrispettivi giornalieri",
        description: "Verifica dei corrispettivi e chiusura della cassa",
        dueDate: at(0, 20),
        priority: "high",
        category: "administrative",
        doneBy: [],
      },
    ];

    [storeA, storeB].forEach((store) => {
      dailyTasks.forEach(({ doneBy, ...taskData }) => {
        const groupId = new mongoose.Types.ObjectId();
        getStoreEmployees(store).forEach((employee) => {
          tasks.push({
            ...taskData,
            createdBy: manager._id,
            assignedTo: employee._id,
            store: store._id,
            groupId,
            isGlobal: true,
            type: "daily",
            status: doneBy.includes(employee) ? "done" : "pending",
          });
        });
      });
    });

    // task mensili: scadono l'ultimo giorno del mese alle 18
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 18);
    tasks.push(
      {
        ...base(marta),
        title: "Inventario mensile",
        description: "Conteggio completo della merce in negozio",
        dueDate: endOfMonth,
        priority: "medium",
        category: "operations",
        type: "monthly",
      },
      {
        ...base(giulia),
        title: "Controllo documenti di trasporto",
        description: "Verifica dei documenti di trasporto del mese",
        dueDate: endOfMonth,
        priority: "medium",
        category: "administrative",
        type: "monthly",
      },
    );

    // task globale di domani: una per negozio, una copia per dipendente
    [storeA, storeB].forEach((store) => {
      const groupId = new mongoose.Types.ObjectId();
      getStoreEmployees(store).forEach((employee) => {
        tasks.push({
          createdBy: manager._id,
          assignedTo: employee._id,
          store: store._id,
          groupId,
          isGlobal: true,
          title: "Riunione generale",
          description: "Aggiornamento sul programma delle prossime mostre",
          dueDate: at(1, 9),
          priority: "medium",
          category: "administrative",
          type: "daily",
        });
      });
    });

    await Task.create(tasks);

    // 8. richieste di fornitura: in attesa, accolte e respinte, in tutti e due i negozi
    await SupplyRequest.create([
      {
        product: productByName["Poster"]._id,
        requestedBy: marta._id,
        store: storeA._id,
        requestedAmount: 20,
        createdAt: at(0, 9, 30),
      },
      {
        product: productByName["Catalogo della mostra"]._id,
        requestedBy: giulia._id,
        store: storeA._id,
        requestedAmount: 10,
        createdAt: at(-1, 16),
      },
      {
        product: productByName["Set cartoline"]._id,
        requestedBy: marta._id,
        store: storeA._id,
        requestedAmount: 50,
        state: "handled",
        handledBy: manager._id,
        handledAt: at(-5, 15),
        createdAt: at(-5, 11),
      },
      {
        product: productByName["Tazza"]._id,
        requestedBy: giulia._id,
        store: storeA._id,
        requestedAmount: 12,
        state: "rejected",
        handledBy: manager._id,
        handledAt: at(-2, 12),
        rejectReason:
          "Il fornitore ha aumentato il costo: per ora non la riordiniamo",
        createdAt: at(-3, 10),
      },
      {
        product: productByName["Magnete"]._id,
        requestedBy: luca._id,
        store: storeB._id,
        requestedAmount: 30,
        createdAt: at(0, 10),
      },
      {
        product: productByName["Set cartoline"]._id,
        requestedBy: paolo._id,
        store: storeB._id,
        requestedAmount: 50,
        createdAt: at(-2, 14),
      },
      {
        product: productByName["Guida del museo"]._id,
        requestedBy: luca._id,
        store: storeB._id,
        requestedAmount: 15,
        state: "handled",
        handledBy: manager._id,
        handledAt: at(-4, 17),
        createdAt: at(-4, 10),
      },
      {
        product: productByName["Matita con logo"]._id,
        requestedBy: paolo._id,
        store: storeB._id,
        requestedAmount: 40,
        state: "rejected",
        handledBy: manager._id,
        handledAt: at(-1, 11),
        rejectReason:
          "Non verrà più prodotta: la sostituiamo con un nuovo modello a gennaio",
        createdAt: at(-1, 9),
      },
    ]);

    // 9. vendite: oggi (Marta 24, Giulia 10, Luca 12, Paolo 8) e nei 60 giorni prima.
    // Circa una su quindici è annullata; non scalano le giacenze.
    // I numeri "a caso" vengono da una formula fissa: rilanciando il seed i dati sono uguali
    let randomSeed = 7;
    const random = (max) => {
      randomSeed = (randomSeed * 9301 + 49297) % 233280;
      return Math.floor((randomSeed / 233280) * max);
    };

    const cancelReasons = [
      "Errore nel metodo di pagamento: il cliente ha pagato con la carta",
      "Il cliente ha cambiato idea prima di uscire",
      "Prodotto battuto due volte",
      "Prezzo sbagliato, vendita rifatta",
    ];

    // una vendita a caso: da 1 a 3 prodotti diversi, da 1 a 3 pezzi l'uno
    const buildRandomSale = (employee, day, hour) => {
      const lineCount = 1 + random(3);
      const lines = [];
      while (lines.length < lineCount) {
        const product = activeProducts[random(activeProducts.length)];
        // stesso prodotto una volta sola, come nella Cassa
        if (!lines.some(([lineProduct]) => lineProduct === product)) {
          lines.push([product, 1 + random(3)]);
        }
      }
      const paymentMethod = random(2) === 0 ? "cash" : "card";
      return random(15) === 0
        ? buildCancelledSale(
            employee,
            day,
            hour,
            paymentMethod,
            lines,
            cancelReasons[random(cancelReasons.length)],
          )
        : buildSale(employee, day, hour, paymentMethod, lines);
    };

    // count vendite in un giorno, tra le 9 e le 19
    const addSales = (employee, day, count) => {
      for (let saleIndex = 0; saleIndex < count; saleIndex++) {
        const hour = 9 + Math.floor((saleIndex * 10) / count);
        sales.push(buildRandomSale(employee, day, hour));
      }
    };

    const sales = [];
    addSales(marta, 0, 24);
    addSales(giulia, 0, 10);
    addSales(luca, 0, 12);
    addSales(paolo, 0, 8);
    for (let day = 1; day <= 60; day++) {
      // ogni giorno i colleghi si dividono le vendite
      addSales(day % 2 === 0 ? marta : giulia, -day, 5);
      addSales(day % 2 === 0 ? giulia : marta, -day, 3);
      addSales(day % 2 === 0 ? luca : paolo, -day, 4);
      addSales(day % 2 === 0 ? paolo : luca, -day, 2);
    }
    await Sale.create(sales);
    console.log(`${products.length} prodotti, ${sales.length} vendite`);

    // 10. casse di ieri chiuse: fondo di 100 € e contanti nella busta (oggi la Cassa propone 100 €)
    const yesterday = at(-1, 0);
    const today = at(0, 0);
    const cashSessions = [
      [storeA, marta, giulia],
      [storeB, luca, paolo],
    ].map(([store, openedBy, closedBy]) => {
      // contanti delle vendite valide di ieri in quel negozio
      const cashSales = round(
        sales
          .filter(
            (sale) =>
              sale.store.equals(store._id) &&
              sale.paymentMethod === "cash" &&
              !sale.cancelled &&
              sale.createdAt >= yesterday &&
              sale.createdAt < today,
          )
          .reduce((sum, sale) => sum + sale.total, 0),
      );
      return {
        store: store._id,
        day: yesterday,
        openingFloat: 100,
        openedBy: openedBy._id,
        closingFloat: 100,
        envelopeAmount: cashSales,
        cashSales,
        expectedCash: round(100 + cashSales),
        difference: 0,
        closedBy: closedBy._id,
        closedAt: at(-1, 19, 30),
        createdAt: at(-1, 8, 55),
      };
    });
    await CashSession.create(cashSessions);

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
