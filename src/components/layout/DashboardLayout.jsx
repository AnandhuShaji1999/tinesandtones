import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Bell, ChevronDown } from "lucide-react";
import { NAV_GROUPS, NAV_ITEMS, SIGN_OUT } from "../../content/navContent";
import { ROUTES } from "../../constants/routes";
import { logout } from "../../controllers/authController";
import { getCachedProfile, loadProfile } from "../../controllers/profileController";

const matches = (pathname, path) =>
  pathname === path || pathname.startsWith(`${path}/`);

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(getCachedProfile());
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    loadProfile()
      .then(setProfile)
      .catch(() => {});
  }, []);

  // Open the group that contains the current page
  useEffect(() => {
    const g = NAV_GROUPS.find(
      (x) => x.type === "group" && x.children.some((c) => matches(pathname, c.path))
    );
    if (g) setExpanded((p) => (p[g.key] ? p : { ...p, [g.key]: true }));
  }, [pathname]);

  const toggle = (key) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const isAddProduct = pathname === ROUTES.ADD_PRODUCT;

  const title = isAddProduct
    ? "Add New Product"
    : NAV_ITEMS.find((i) => matches(pathname, i.path))?.title || "Dashboard";

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
          {NAV_GROUPS.map((item) => {
            if (item.type === "link") {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `sb-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={18} strokeWidth={1.6} />
                  <span>{item.label}</span>
                </NavLink>
              );
            }

            const GroupIcon = item.icon;
            const hasActive = item.children.some((c) => matches(pathname, c.path));
            const isOpen = Boolean(expanded[item.key]);

            return (
              <div className="sb-group" key={item.key}>
                <button
                  type="button"
                  className={`sb-item sb-parent ${hasActive ? "has-active" : ""}`}
                  onClick={() => toggle(item.key)}
                  aria-expanded={isOpen}
                >
                  <GroupIcon size={18} strokeWidth={1.6} />
                  <span>{item.label}</span>
                  <ChevronDown
                    size={16}
                    className={`sb-chev ${isOpen ? "open" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="sb-sub">
                    {item.children.map(({ label, path, icon: Icon }) => (
                      <NavLink
                        key={path}
                        to={path}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          `sb-subitem ${isActive ? "active" : ""}`
                        }
                      >
                        <Icon size={16} strokeWidth={1.6} />
                        <span>{label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

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

          <div className="topbar-right">
            {isAddProduct && (
              <button type="button" className="bell-btn" aria-label="Notifications">
                <Bell size={20} />
                <i className="bell-dot" />
              </button>
            )}

            <button
              type="button"
              className={`tb-profile ${pathname === ROUTES.PROFILE ? "on" : ""}`}
              onClick={() => navigate(ROUTES.PROFILE)}
              aria-label="Open profile"
            >
              <span className="tb-avatar">{profile?.initials || "?"}</span>
              <span className="tb-info">
                <b>{profile?.fullName || "Profile"}</b>
                <small>{profile?.roleText || ""}</small>
              </span>
            </button>
          </div>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;