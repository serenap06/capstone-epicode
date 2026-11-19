// voci del menu per ruolo: to = indirizzo, label, icon (lucide-react), end = solo l'indirizzo esatto,
// hideOnMobile = su telefono in "Altro", desktopOnly = su telefono non c'è (la Cassa)
// import
import {
  Home,
  Calendar,
  CheckSquare,
  Euro,
  BarChart3,
  PackagePlus,
  Boxes,
  ShoppingBag,
  Users,
  Store,
  CreditCard,
} from "lucide-react";

export const MENU = {
  // responsabile
  admin: [
    { to: "/admin", label: "Dashboard", icon: Home, end: true },
    { to: "/admin/shifts", label: "Turni", icon: Calendar },
    { to: "/admin/tasks", label: "Task", icon: CheckSquare },
    { to: "/admin/sales", label: "Vendite", icon: Euro },
    {
      to: "/admin/reports",
      label: "Report",
      icon: BarChart3,
      hideOnMobile: true,
    },
    { to: "/admin/supply-requests", label: "Forniture", icon: PackagePlus },
    { to: "/admin/stock", label: "Giacenze", icon: Boxes, hideOnMobile: true },
    {
      to: "/admin/products",
      label: "Catalogo",
      icon: ShoppingBag,
      hideOnMobile: true,
    },
    { to: "/admin/users", label: "Utenti", icon: Users, hideOnMobile: true },
    { to: "/admin/stores", label: "Negozi", icon: Store, hideOnMobile: true },
  ],
  // dipendente: su telefono niente Cassa, di proposito
  employee: [
    { to: "/employee", label: "Dashboard", icon: Home, end: true },
    {
      to: "/employee/checkout",
      label: "Cassa",
      icon: CreditCard,
      desktopOnly: true,
    },
    { to: "/employee/tasks", label: "Task", icon: CheckSquare },
    { to: "/employee/shifts", label: "Turni", icon: Calendar },
    { to: "/employee/sales", label: "Vendite", icon: Euro },
    {
      to: "/employee/stock",
      label: "Giacenze",
      icon: Boxes,
      hideOnMobile: true,
    },
    { to: "/employee/supply-requests", label: "Forniture", icon: PackagePlus },
    {
      to: "/employee/products",
      label: "Catalogo",
      icon: ShoppingBag,
      hideOnMobile: true,
    },
  ],
};
