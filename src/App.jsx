import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./views/Login/Login";
import Dashboard from "./views/Dashboard/Dashboard";
import Profile from "./views/Profile/Profile";
import Reports from "./views/Reports/Reports";
import Billing from "./views/Billing/Billing";
import Exchanges from "./views/Exchanges/Exchanges";
import Products from "./views/Products/Products";
import AddProduct from "./views/AddProduct/AddProduct";
import Variants from "./views/Variants/Variants";
import Suppliers from "./views/Suppliers/Suppliers";
import Purchases from "./views/Purchases/Purchases";
import AddPurchase from "./views/Purchases/AddPurchase";
import Stock from "./views/Stock/Stock";
import StockAudits from "./views/StockAudits/StockAudits";
import Categories from "./views/Categories/Categories";
import Brands from "./views/Brands/Brands";
import Staff from "./views/Staff/Staff";
import Sales from "./views/Sales/Sales";
import Customers from "./views/Customers/Customers";
import System from "./views/System/System";
import DashboardLayout from "./components/layout/DashboardLayout";
import { ROUTES } from "./constants/routes";

const App = () => (
  <Routes>
    <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.LOGIN} replace />} />
    <Route path={ROUTES.LOGIN} element={<Login />} />

    <Route element={<DashboardLayout />}>
      <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
      <Route path={ROUTES.PROFILE} element={<Profile />} />
      <Route path={ROUTES.REPORTS} element={<Reports />} />
      <Route path={ROUTES.BILLING} element={<Billing />} />
      <Route path={ROUTES.EXCHANGES} element={<Exchanges />} />
      <Route path={ROUTES.PRODUCTS} element={<Products />} />
      <Route path={ROUTES.ADD_PRODUCT} element={<AddProduct />} />
      <Route path={ROUTES.VARIANTS} element={<Variants />} />
      <Route path={ROUTES.SUPPLIERS} element={<Suppliers />} />
      <Route path={ROUTES.PURCHASES} element={<Purchases />} />
      <Route path={ROUTES.ADD_PURCHASE} element={<AddPurchase />} />
      <Route path={ROUTES.EDIT_PURCHASE} element={<AddPurchase />} />
      <Route path={ROUTES.STOCK} element={<Stock />} />
      <Route path={ROUTES.STOCK_AUDITS} element={<StockAudits />} />
      <Route path={ROUTES.CATEGORIES} element={<Categories />} />
      <Route path={ROUTES.BRANDS} element={<Brands />} />
      <Route path={ROUTES.EMPLOYEES} element={<Staff />} />
      <Route path={ROUTES.SALES} element={<Sales />} />
      <Route path={ROUTES.CUSTOMERS} element={<Customers />} />
      <Route path={ROUTES.SYSTEM} element={<System />} />
    </Route>

    <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
  </Routes>
);

export default App;