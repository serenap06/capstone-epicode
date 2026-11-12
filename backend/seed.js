require("dotenv").config();
const mongoose = require("mongoose");

const Store = require("./modules/stores/schema");
const User = require("./modules/users/schema");
const Product = require("./modules/products/schema");
const Stock = require("./modules/stock/schema");
const Shift = require("./modules/shifts/schema");
const Task = require("./modules/tasks/schema");
const SupplyRequest = require("./modules/supply-requests/schema");
const Sale = require("./modules/sales/schema");

const DEMO_PASSWORD = "Password123";

// URL Cloudinary delle foto dei prodotti (caricate con PATCH /api/products/:id/image).
// Lascia "" finché non hai l'URL: il prodotto resta senza foto.
const IMAGES = {
  guida: "",
  cartoline: "",
  magnete: "",
  poster: "",
  borsa: "",
  catalogo: "",
};

// Data e ora relative a oggi: day = 0 è oggi, 1 è domani, -1 è ieri
const at = (day, hour) => {
  const d = new Date();
  d.setDate(d.getDate() + day);
  d.setHours(hour, 0, 0, 0);
  return d;
};

// Arrotonda ai centesimi
const round = (value) => Math.round(value * 100) / 100;

// Costruisce una vendita con gli stessi calcoli del service:
// lines è un elenco di [prodotto, quantità]
const buildSale = (employee, day, hour, paymentMethod, lines) => {
  const items = lines.map(([product, quantity]) => {
    const lineTotal = product.price * quantity;
    return {
      product: product._id,
      name: product.name,
      unitPrice: product.price,
      vatRate: product.vatRate,
      quantity,
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

const seed = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("MongoDB connected, seeding...");

    // 1. Svuota le collezioni (prima quelle che dipendono dalle altre)
    await Sale.deleteMany();
    await SupplyRequest.deleteMany();
    await Task.deleteMany();
    await Shift.deleteMany();
    await Stock.deleteMany();
    await User.deleteMany();
    await Product.deleteMany();
    await Store.deleteMany();

    // 2. Punti vendita
    const [storeA, storeB] = await Store.create([
      { name: "Bookshop Museo", address: "Via Roma 1", city: "Napoli" },
      { name: "Shop Castello", address: "Via Milano 2", city: "Napoli" },
    ]);

    // 3. Utenti (create, non insertMany: così l'hook cifra le password)
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

    // 4. Prodotti (il catalogo è unico per tutti i punti vendita).
    // I libri hanno l'IVA al 4%, gli altri prendono il 22% predefinito
    const [guida, cartoline, magnete, poster, borsa, catalogo] =
      await Product.create([
        {
          name: "Guida del museo",
          description: "Guida illustrata con le opere principali",
          price: 12,
          brand: "Edizioni Locali",
          category: "libri",
          vatRate: 4,
          image: IMAGES.guida,
        },
        {
          name: "Set cartoline",
          price: 3,
          category: "cartoleria",
          image: IMAGES.cartoline,
        },
        { name: "Magnete", price: 4.5, category: "gadget", image: IMAGES.magnete },
        { name: "Poster", price: 8, category: "cartoleria", image: IMAGES.poster },
        {
          name: "Borsa in tela",
          description: "Borsa in cotone con stampa originale",
          price: 15,
          category: "gadget",
          image: IMAGES.borsa,
        },
        {
          name: "Catalogo della mostra",
          price: 25,
          brand: "Edizioni Locali",
          category: "libri",
          vatRate: 4,
          image: IMAGES.catalogo,
        },
      ]);

    // 5. Giacenze: [prodotto, punto vendita, quantità, soglia minima]
    // Alcune righe sono sotto soglia, per vedere il badge e gli avvisi
    const stockRows = [
      [guida, storeA, 12, 5],
      [guida, storeB, 3, 5],
      [cartoline, storeA, 40, 10],
      [cartoline, storeB, 6, 10],
      [magnete, storeA, 25, 8],
      [magnete, storeB, 0, 8],
      [poster, storeA, 9, 4],
      [poster, storeB, 14, 4],
      [borsa, storeA, 7, 3],
      [borsa, storeB, 11, 3],
      [catalogo, storeA, 5, 2],
      [catalogo, storeB, 8, 2],
    ];
    await Stock.create(
      stockRows.map(([product, store, amount, minThreshold]) => ({
        product: product._id,
        store: store._id,
        amount,
        minThreshold,
      })),
    );

    // 6. Turni: da oggi a 6 giorni, ognuno riposa un giorno diverso
    const shifts = [];
    employees.forEach((employee, i) => {
      for (let day = 0; day <= 6; day++) {
        if ((day + i) % 4 === 3) continue; // giorno di riposo
        const morning = i % 2 === 0;
        shifts.push({
          user: employee._id,
          store: employee.store,
          startAt: at(day, morning ? 9 : 13),
          endAt: at(day, morning ? 17 : 21),
        });
      }
    });
    await Shift.create(shifts);

    // 7. Task
    // Ogni task ha il suo groupId e il suo store. Per i task di un solo
    // dipendente il groupId è nuovo ogni volta (base() lo genera a ogni chiamata)
    const base = (employee) => ({
      createdBy: manager._id,
      assignedTo: employee._id,
      store: employee.store,
      groupId: new mongoose.Types.ObjectId(),
    });

    const tasks = [];

    // Task di oggi: una per negozio, con una copia per ogni dipendente
    // di quel negozio, tutte con lo stesso groupId
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
      const storeEmployees = employees.filter(
        (e) => e.store.toString() === store._id.toString(),
      );

      dailyTasks.forEach(({ doneBy, ...taskData }) => {
        const groupId = new mongoose.Types.ObjectId();

        storeEmployees.forEach((employee) => {
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

    // Task mensili
    const now = new Date();
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      18,
      0,
      0,
    );
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

    // Task globali: una per punto vendita, una copia per ogni dipendente
    // di quel negozio, tutte con lo stesso groupId
    [storeA, storeB].forEach((store) => {
      const groupId = new mongoose.Types.ObjectId();
      employees
        .filter((e) => e.store.toString() === store._id.toString())
        .forEach((employee) => {
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

    // 8. Richieste di fornitura
    await SupplyRequest.create([
      {
        product: magnete._id,
        requestedBy: luca._id,
        store: storeB._id,
        requestedAmount: 30,
      },
      {
        product: cartoline._id,
        requestedBy: paolo._id,
        store: storeB._id,
        requestedAmount: 50,
      },
      {
        product: guida._id,
        requestedBy: luca._id,
        store: storeB._id,
        requestedAmount: 15,
        state: "handled",
      },
    ]);

    // 9. Vendite: cinque di oggi e due al giorno per i 20 giorni precedenti,
    // così i report per giorno, settimana e mese hanno dati da mostrare.
    // Le vendite del seed non scalano le giacenze.
    const sales = [
      buildSale(marta, 0, 9, "cash", [
        [guida, 2],
        [cartoline, 3],
      ]),
      buildSale(luca, 0, 9, "card", [[cartoline, 3]]),
      buildSale(giulia, 0, 10, "card", [[catalogo, 1]]),
      buildSale(paolo, 0, 11, "cash", [
        [poster, 1],
        [cartoline, 2],
      ]),
      buildSale(marta, 0, 11, "card", [[guida, 1]]),
    ];

    for (let day = 1; day <= 20; day++) {
      sales.push(
        buildSale(employees[day % 4], -day, 11, day % 2 === 0 ? "cash" : "card", [
          [cartoline, 2],
          [magnete, 1],
        ]),
        buildSale(
          employees[(day + 1) % 4],
          -day,
          16,
          day % 3 === 0 ? "cash" : "card",
          day % 2 === 0
            ? [[guida, 1]]
            : [
                [poster, 1],
                [catalogo, 1],
              ],
        ),
      );
    }
    await Sale.create(sales);

    console.log("Seed completed");
    console.log("Login Responsabile: responsabile@demo.it /", DEMO_PASSWORD);
    console.log("Login Dipendente:   marta@demo.it /", DEMO_PASSWORD);
  } catch (e) {
    console.error("Seed error:", e.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();