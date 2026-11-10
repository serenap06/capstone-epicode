export const MENU = {
  admin: [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/shifts", label: "Turni" },
    { to: "/admin/tasks", label: "Task" },
    { to: "/admin/sales", label: "Vendite" },
    { to: "/admin/reports", label: "Report" },
    { to: "/admin/supply-requests", label: "Forniture" },
    { to: "/admin/stock", label: "Giacenze" },
    { to: "/admin/products", label: "Catalogo" },
    { to: "/admin/users", label: "Utenti" },
    { to: "/admin/stores", label: "Negozi" },
  ],
  employee: [
    { to: "/employee", label: "Dashboard", end: true },
    { to: "/employee/checkout", label: "Cassa" },
    { to: "/employee/tasks", label: "Task" },
    { to: "/employee/shifts", label: "Turni" },
    { to: "/employee/stock", label: "Giacenze" },
    { to: "/employee/supply-requests", label: "Forniture" },
    { to: "/employee/products", label: "Catalogo" },
  ],
};
