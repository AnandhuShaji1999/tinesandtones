import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Bell } from "lucide-react";
import { NAV_ITEMS, SIGN_OUT } from "../../content/navContent";
import { ROUTES } from "../../constants/routes";
import { logout } from "../../controllers/authController";

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isAddProduct = pathname === ROUTES.ADD_PRODUCT;

  const title = isAddProduct
    ? "Add New Product"
    : NAV_ITEMS.find(
        (i) => pathname === i.path || pathname.startsWith(`${i.path}/`)
      )?.title || "Dashboard";

  const handleSignOut = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const SignOutIcon = SIGN_OUT.icon;

  return (
    <div className={`layout ${isAddProduct ? "layout--plain" : ""}`}>
      <div
        className={`sb-overlay ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sb-brand">
          <img src="/logo.jpeg" alt="Tints & Tones" className="sb-logo" />
          <button
            type="button"
            className="sb-close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sb-nav">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `sb-item ${isActive ? "active" : ""}`}
            >
              <Icon size={18} strokeWidth={1.6} />
              <span>{label}</span>
            </NavLink>
          ))}

          <button type="button" className="sb-item" onClick={handleSignOut}>
            <SignOutIcon size={18} strokeWidth={1.6} />
            <span>{SIGN_OUT.label}</span>
          </button>
        </nav>
      </aside>

      <div className="main">
        <header className={`topbar ${isAddProduct ? "topbar--alt" : ""}`}>
          <button
            type="button"
            className="menu-btn"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <h1 className="topbar-title">{title}</h1>

          {isAddProduct && (
            <div className="topbar-right">
              <button type="button" className="bell-btn" aria-label="Notifications">
                <Bell size={20} />
                <i className="bell-dot" />
              </button>
              <img src="/logo.jpeg" alt="Profile" className="topbar-avatar" />
            </div>
          )}
        </header>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;