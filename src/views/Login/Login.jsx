import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  LockKeyhole,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Headset,
} from "lucide-react";
import { LOGIN_CONTENT, BRANCHES } from "../../content/loginContent";
import { login } from "../../controllers/authController";
import { ROUTES } from "../../constants/routes";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    branch: BRANCHES[0].value,
    remember: true,
    quickPin: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const c = LOGIN_CONTENT;

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="brand">
          <img src="/logo.jpeg" alt={c.brand.name} className="brand-logo" />
          <div>
            <h1 className="brand-name">{c.brand.name}</h1>
            <p className="brand-tagline">{c.brand.tagline}</p>
          </div>
        </div>
        <div className="header-right">
          <span className="server-status">
            <i className="status-dot" />
            {c.header.serverStatus}
          </span>
          <span className="header-divider" />
          <span className="header-support">
            <Headset size={15} />
            {c.header.support}
          </span>
        </div>
      </header>

      <main className="login-main">
        <div className="login-card">
          <div className="login-icon">
            <LockKeyhole size={26} />
          </div>
          <h2 className="login-title">{c.title}</h2>
          <p className="login-subtitle">{c.subtitle}</p>

          <form onSubmit={handleSubmit}>
            <label className="field-label">
              {c.fields.username.label} <span className="req">*</span>
            </label>
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder={c.fields.username.placeholder}
                required
              />
            </div>

            <div className="label-row">
              <label className="field-label">
                {c.fields.password.label} <span className="req">*</span>
              </label>
              <a href="#" className="forgot">
                {c.forgotPassword}
              </a>
            </div>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={c.fields.password.placeholder}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <label className="field-label">{c.fields.branch.label}</label>
            <div className="input-wrap">
              <Building2 size={16} className="input-icon" />
              <select name="branch" value={form.branch} onChange={handleChange}>
                {BRANCHES.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="select-arrow" />
            </div>

            <div className="options-row">
              <label className="remember">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                />
                <span>{c.rememberStation}</span>
              </label>
              <label className="quick-pin">
                <input
                  type="checkbox"
                  name="quickPin"
                  checked={form.quickPin}
                  onChange={handleChange}
                />
                <span className="radio-dot" />
                {c.quickPin}
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Signing in..." : c.submit}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>
        </div>

        <p className="secure-note">
          <ShieldCheck size={14} />
          {c.secure}
        </p>
      </main>

      <footer className="login-footer">
        <span>{c.footer.copyright}</span>
        <div className="footer-links">
          {c.footer.links.map((l) => (
            <a href="#" key={l}>
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Login;