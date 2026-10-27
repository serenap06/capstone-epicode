require("dotenv").config();
const mongoose = require("mongoose");

const Store = require("./modules/stores/schema");
const User = require("./modules/users/schema");
const Product = require("./modules/products/schema");
const Stock = require("./modules/stock/schema");
const Shift = require("./modules/shifts/schema");
const Task = require("./modules/tasks/schema");
const SupplyRequest = require("./modules/supply-requests/schema");

const DEMO_PASSWORD = "Password123";

// Data e ora relative a oggi: day = 0 è oggi, 1 è domani, -1 è ieri
const at = (day, hour) => {
  const d = new Date();
  d.setDate(d.getDate() + day);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("MongoDB connected, seeding...");

    // 1. Svuota le collezioni (prima quelle che dipendono dalle altre)
    await SupplyRequest.deleteMany();
    await Task.deleteMany();
    await Shift.deleteMany();
    await Stock.deleteMany();
    await User.deleteMany();
    await Product.deleteMany();
    await Store.deleteMany();

    // 2. Punti vendita
    const [storeA, storeB] = await Store.create([
      { name: "Bookshop Museo", address: "Via Roma 1" },
      { name: "Shop Castello", address: "Via Milano 2" },
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
        store: storeA._id,
      },
      {
        name: "Luca",
        surname: "Verdi",
        email: "luca@demo.it",
        password: DEMO_PASSWORD,
        role: "employee",
        store: storeB._id,
      },
      {
        name: "Giulia",
        surname: "Neri",
        email: "giulia@demo.it",
        password: DEMO_PASSWORD,
        role: "employee",
        store: storeA._id,
      },
      {
        name: "Paolo",
        surname: "Gialli",
        email: "paolo@demo.it",
        password: DEMO_PASSWORD,
        role: "employee",
        store: storeB._id,
      },
    ]);
    const employees = [marta, luca, giulia, paolo];

    // 4. Prodotti (il catalogo è unico per tutti i punti vendita)
    const [guida, cartoline, magnete, poster, borsa, catalogo] =
      await Product.create([
        {
          name: "Guida del museo",
          description: "Guida illustrata con le opere principali",
          price: 12,
          brand: "Edizioni Locali",
          category: "libri",
        },
        { name: "Set cartoline", price: 3, category: "cartoleria" },
        { name: "Magnete", price: 4.5, category: "gadget" },
        { name: "Poster", price: 8, category: "cartoleria" },
        {
          name: "Borsa in tela",
          description: "Borsa in cotone con stampa originale",
          price: 15,
          category: "gadget",
        },
        {
          name: "Catalogo della mostra",
          price: 25,
          brand: "Edizioni Locali",
          category: "libri",
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

    // 7. Task di oggi per ogni dipendente
    const tasks = [];
    employees.forEach((employee, i) => {
      const base = { createdBy: manager._id, assignedTo: employee._id };
      tasks.push(
        {
          ...base,
          title: "Apertura cassa",
          description: "Controllo del fondo cassa e accensione del POS",
          dueDate: at(0, 10),
          priority: "high",
          status: i % 2 === 0 ? "done" : "pending",
          category: "operations",
          type: "daily",
        },
        {
          ...base,
          title: "Riordino espositori",
          description: "Riallestimento degli espositori di cartoline e gadget",
          dueDate: at(0, 15),
          priority: "medium",
          status: i === 0 ? "done" : "pending",
          category: "operations",
          type: "daily",
        },
        {
          ...base,
          title: "Controllo corrispettivi giornalieri",
          description: "Verifica dei corrispettivi e chiusura della cassa",
          dueDate: at(0, 20),
          priority: "high",
          category: "administrative",
          type: "daily",
        },
      );
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
        createdBy: manager._id,
        assignedTo: marta._id,
        title: "Inventario mensile",
        description: "Conteggio completo della merce in negozio",
        dueDate: endOfMonth,
        priority: "medium",
        category: "operations",
        type: "monthly",
      },
      {
        createdBy: manager._id,
        assignedTo: giulia._id,
        title: "Controllo documenti di trasporto",
        description: "Verifica dei documenti di trasporto del mese",
        dueDate: endOfMonth,
        priority: "medium",
        category: "administrative",
        type: "monthly",
      },
    );

    // Task per tutti i dipendenti: una copia per ognuno, con lo stesso groupId
    const groupId = new mongoose.Types.ObjectId();
    employees.forEach((employee) => {
      tasks.push({
        createdBy: manager._id,
        assignedTo: employee._id,
        title: "Riunione generale",
        description: "Aggiornamento sul programma delle prossime mostre",
        dueDate: at(1, 9),
        priority: "medium",
        category: "administrative",
        type: "daily",
        groupId,
      });
    });
    await Task.create(tasks);

    // 8. Richieste di fornitura
    await SupplyRequest.create([
      {
        product: magnete._id,
        requestedBy: luca._id,
        store: storeB._id,
        amount: 30,
      },
      {
        product: cartoline._id,
        requestedBy: paolo._id,
        store: storeB._id,
        amount: 50,
      },
      {
        product: guida._id,
        requestedBy: luca._id,
        store: storeB._id,
        amount: 15,
        state: "handled",
      },
    ]);

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