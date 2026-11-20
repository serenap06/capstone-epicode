# StoreSquad

English | [Italiano](README.it.md)

A management web app for small shops, such as a museum's bookshop and gift shop:
shifts, tasks, cash register, sales, inventory and supply requests, with one view for the
**Manager** and one for the **Employee**.

Final (capstone) project of the Epicode course. The interface is in Italian.

**Live demo:** https://store-squad-2e5c.vercel.app

## Demo accounts

The login page has buttons to sign in with one click.

| Role     | Email                | Store          |
| -------- | -------------------- | -------------- |
| Manager  | responsabile@demo.it | all stores     |
| Employee | marta@demo.it        | Bookshop Museo |
| Employee | giulia@demo.it       | Bookshop Museo |
| Employee | luca@demo.it         | Shop Castello  |
| Employee | paolo@demo.it        | Shop Castello  |

## Features

### Manager

- **Dashboard**: today's sales per store, employees on shift, today's tasks, low-stock products and open supply requests. Each card opens its page with the filters already set.
- **Shifts**: each employee's week with contract and scheduled hours; shifts cannot overlap.
- **Tasks**: daily and monthly, assigned to people or to a whole store, with priority and category. Browse by day, week or month with the calendar, past tasks included.
- **Sales**: revenue, payment methods and sales per VAT rate for a day, week or month; cancelled sales with their reason.
- **Cash closings**: for each day the opening float, takings, envelope and closing float, with cash, POS and float differences highlighted.
- **Reports**: revenue from a week to a year, chart, best-selling products and VAT summary.
- **Supply requests**: accept or reject the employees' requests.
- **Stock, product catalog** (with images), **users** and **stores**.

### Employee

- **Dashboard**: today's shifts and tasks.
- **Cash register**: open with the float, sell with a cart (cash or card) and close with envelope, closing float and POS total.
- **Sales** of their store; they can cancel their own sales of the day with a reason.
- **Tasks** to tick off, weekly **shifts** with colleagues, **stock**, **supply requests**, **catalog** and **profile** (avatar and password).

## Tech stack

- **Frontend**: React 19, Vite, React Router, React Bootstrap, React Hook Form, Recharts, lucide-react
- **Backend**: Node.js, Express 5, MongoDB with Mongoose, JWT and bcrypt, express-validator, Cloudinary and multer for images
- **Deploy**: Vercel (frontend) and Render (backend), database on MongoDB Atlas

## Structure

```
store-squad/
├── backend/        Express API: one module per resource (routes, controller, service, schema)
├── frontend/       React app (Vite)
└── capstone-api/   Bruno collection to try the API
```

## Run locally

You need Node.js 20.19 or newer, a MongoDB database (for example Atlas) and a Cloudinary account.

```bash
git clone https://github.com/serenap06/store-squad.git
cd store-squad
```

**Backend**

```bash
cd backend
npm install
cp .env.example .env    # then fill in the variables
npm run seed            # sample data
npm run dev             # http://localhost:<PORT>/api
```

**Frontend** (in another terminal)

```bash
cd frontend
npm install
cp .env.example .env    # then fill in the variables
npm run dev             # http://localhost:5173
```

## Environment variables

**backend/.env**

| Variable                | Purpose                                                       |
| ----------------------- | ------------------------------------------------------------- |
| `DB_URL`                | MongoDB connection string                                     |
| `PORT`                  | server port                                                   |
| `FRONTEND_URL`          | frontend address, the only one allowed to call the API (CORS) |
| `JWT_SECRET`            | key used to sign access tokens                                |
| `JWT_EXPIRES_IN`        | token lifetime (e.g. `1d`)                                    |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account for images                                 |
| `CLOUDINARY_API_KEY`    | Cloudinary key                                                |
| `CLOUDINARY_API_SECRET` | Cloudinary secret                                             |
| `DEMO_PASSWORD`         | password of the demo accounts created by the seed             |

**frontend/.env**

| Variable             | Purpose                                                             |
| -------------------- | ------------------------------------------------------------------- |
| `VITE_API_URL`       | backend address, ending with `/api`                                 |
| `VITE_DEMO_PASSWORD` | same password as the seed: shows the demo buttons on the login page |

## Scripts

| Folder   | Command           | What it does                            |
| -------- | ----------------- | --------------------------------------- |
| backend  | `npm run dev`     | server with automatic restart (nodemon) |
| backend  | `npm start`       | server (used on Render)                 |
| backend  | `npm run seed`    | deletes and recreates the sample data   |
| frontend | `npm run dev`     | development app                         |
| frontend | `npm run build`   | production build (`dist` folder)        |
| frontend | `npm run preview` | try the build locally                   |
| frontend | `npm run lint`    | code check with ESLint                  |

## Sample data

`npm run seed` **deletes everything** and recreates: 2 stores, 5 users, 18 products with stock, shifts from January to December, tasks, supply requests, sales and cash closings up to today. Dates start from the day you run it, so it's worth running it again before a demo.

## API

All routes start with `/api`: `auth`, `users`, `stores`, `products`, `stocks`, `shifts`, `tasks`, `sales`, `cash-sessions`, `supply-requests`, `reports`, `dashboard`. `GET /api/health` tells whether the server is up.

To try them there is a [Bruno](https://www.usebruno.com/) collection in the `capstone-api` folder:

1. create `capstone-api/.env` with `DEMO_PASSWORD=...` (it is not committed);
2. log in (`auth/login admin` or `auth/login employee`) and copy the token from the response;
3. in Bruno create an environment with a `token` variable (mark it "Secret") and paste it there.

## Author

Serena Napoletano
