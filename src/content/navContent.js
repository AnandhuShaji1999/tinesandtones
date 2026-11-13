import {
  ChartPie,
  FileText,
  Receipt,
  Repeat,
  ChartNoAxesColumn,
  Layers,
  Truck,
  ReceiptText,
  Boxes,
  ClipboardCheck,
  Tags,
  Award,
  Users,
  ShoppingBag,
  ChartLine,
  Settings,
  LogOut,
  Store,
  Package,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { ROUTES } from "../constants/routes";

// type "link" = single item, type "group" = parent with sub-items
export const NAV_GROUPS = [
  { type: "link", label: "Dashboard", title: "Dashboard", path: ROUTES.DASHBOARD, icon: ChartPie },
  { type: "link", label: "Reports", title: "Reports", path: ROUTES.REPORTS, icon: FileText },
  {
    type: "group",
    key: "sales",
    label: "Sales & Billing",
    icon: Store,
    children: [
      { label: "Billing", title: "POS Billing", path: ROUTES.BILLING, icon: Receipt },
      { label: "Exchanges", title: "Exchanges", path: ROUTES.EXCHANGES, icon: Repeat },
      { label: "Sales Management", title: "Sales Database", path: ROUTES.SALES, icon: ChartLine },
      { label: "Customers", title: "Customer Database", path: ROUTES.CUSTOMERS, icon: ShoppingBag },
    ],
  },
  {
    type: "group",
    key: "inventory",
    label: "Inventory",
    icon: Package,
    children: [
      { label: "Product Management", title: "Product Database", path: ROUTES.PRODUCTS, icon: ChartNoAxesColumn },
      { label: "Variants", title: "Variant Database", path: ROUTES.VARIANTS, icon: Layers },
      { label: "Categories", title: "Category Database", path: ROUTES.CATEGORIES, icon: Tags },
      { label: "Brands", title: "Brand Database", path: ROUTES.BRANDS, icon: Award },
      { label: "Stock", title: "Stock Audit List", path: ROUTES.STOCK, icon: Boxes },
      { label: "Stock Audits", title: "Stock Audits", path: ROUTES.STOCK_AUDITS, icon: ClipboardCheck },
    ],
  },
  {
    type: "group",
    key: "procurement",
    label: "Procurement",
    icon: Truck,
    children: [
      { label: "Suppliers", title: "Supplier Database", path: ROUTES.SUPPLIERS, icon: Truck },
      { label: "Purchases", title: "Purchase Database", path: ROUTES.PURCHASES, icon: ReceiptText },
    ],
  },
  {
    type: "group",
    key: "admin",
    label: "Administration",
    icon: ShieldCheck,
    children: [
      { label: "Employee Management", title: "Staff Database", path: ROUTES.EMPLOYEES, icon: Users },
      { label: "Settings", title: "Settings", path: ROUTES.SETTINGS, icon: Settings },
    ],
  },
  { type: "link", label: "Profile", title: "My Profile", path: ROUTES.PROFILE, icon: UserRound },
];

// Flat list (used for the topbar title)
export const NAV_ITEMS = NAV_GROUPS.flatMap((g) =>
  g.type === "group" ? g.children : [g]
);

export const SIGN_OUT = { label: "Sign Out", icon: LogOut };