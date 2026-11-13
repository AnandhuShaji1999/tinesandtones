import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogOut } from "lucide-react";
import { PROFILE_CONTENT } from "../../content/profileContent";
import { formatJoined } from "../../models/profileModel";
import {
  changePassword,
  getCachedProfile,
  loadProfile,
} from "../../controllers/profileController";
import { logout } from "../../controllers/authController";
import { ROUTES } from "../../constants/routes";

const EMPTY_PW = { current: "", next: "", confirm: "" };

const Profile = () => {
  const c = PROFILE_CONTENT;
  const navigate = useNavigate();

  const [profile, setProfile] = useState(getCachedProfile());
  const [error, setError] = useState("");

  const [pw, setPw] = useState(EMPTY_PW);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState({ ok: false, text: "" });

  useEffect(() => {
    loadProfile()
      .then(setProfile)
      .catch((err) => setError(err.message));
  }, []);

  const handlePw = (e) => {
    const { name, value } = e.target;
    setPw((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPwMsg({ ok: false, text: "" });
    setSaving(true);
    try {
      await changePassword(pw);
      setPw(EMPTY_PW);
      setPwMsg({ ok: true, text: c.password.done });
    } catch (err) {
      setPwMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  if (!profile) {
    return error ? (
      <p className="bx-alert">{error}</p>
    ) : (
      <p className="dash-loading">Loading...</p>
    );
  }

  return (
    <div className="st-page pf-page">
      <h2 className="st-title">{c.title}</h2>
      <p className="st-subtitle">{c.subtitle}</p>

      {error && <p className="bx-alert">{error}</p>}

      <div className="pf-grid">
        {/* -------- left -------- */}
        <div className="pf-col">
          <section className="st-card pf-hero">
            <span className="pf-avatar">{profile.initials}</span>
            <div className="pf-hero-t">
              <h3>{profile.fullName}</h3>
              <p>{profile.email}</p>
              <span className={`sl-pill ${profile.isAdmin ? "st-in" : "st-low"}`}>
                <i />
                {profile.isAdmin ? c.account.admin : c.account.staff}
              </span>
            </div>
          </section>

          <section className="st-card">
            <h3 className="st-card-title">{c.account.title}</h3>
            <div className="pf-kv">
              <div>
                <span>{c.account.name}</span>
                <b>{profile.fullName || "-"}</b>
              </div>
              <div>
                <span>{c.account.email}</span>
                <b>{profile.email || "-"}</b>
              </div>
              <div>
                <span>{c.account.type}</span>
                <b>{profile.isAdmin ? c.account.admin : c.account.staff}</b>
              </div>
              <div>
                <span>{c.account.status}</span>
                <b className={profile.isActive ? "pf-ok" : "pf-bad"}>
                  {profile.isActive ? c.account.active : c.account.inactive}
                </b>
              </div>
              <div>
                <span>{c.account.joined}</span>
                <b>{formatJoined(profile.joined)}</b>
              </div>
            </div>
          </section>

          <section className="st-card">
            <h3 className="st-card-title">{c.branches.title}</h3>
            <div className="st-tbl-wrap">
              <table className="st-tbl pf-tbl">
                <thead>
                  <tr>
                    {c.branches.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {profile.memberships.length === 0 ? (
                    <tr>
                      <td colSpan={c.branches.columns.length} className="st-empty">
                        {profile.isAdmin ? "All branches (business admin)" : c.branches.empty}
                      </td>
                    </tr>
                  ) : (
                    profile.memberships.map((m) => (
                      <tr key={m.branchId}>
                        <td className="st-bold">{m.branchName}</td>
                        <td>
                          <span className="sl-pill st-in">
                            <i />
                            {m.roleLabel}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* -------- right -------- */}
        <div className="pf-col">
          <form className="st-card" onSubmit={handleSubmit}>
            <h3 className="st-card-title">{c.password.title}</h3>

            {["current", "next", "confirm"].map((k) => (
              <div className="f-field pf-f" key={k}>
                <label>{c.password[k]}</label>
                <div className="f-control">
                  <input
                    type={show ? "text" : "password"}
                    name={k}
                    value={pw[k]}
                    onChange={handlePw}
                    autoComplete={k === "current" ? "current-password" : "new-password"}
                    required
                  />
                  {k === "current" && (
                    <button
                      type="button"
                      className="st-eye"
                      onClick={() => setShow((s) => !s)}
                      aria-label="Toggle password"
                    >
                      {show ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <p className="st-msg cat-note">{c.password.hint}</p>
            {pwMsg.text && (
              <p className={`st-msg ${pwMsg.ok ? "st-success" : "st-error"}`}>
                {pwMsg.text}
              </p>
            )}

            <div className="st-actions">
              <button type="submit" className="st-submit" disabled={saving}>
                {saving ? c.password.saving : c.password.submit}
              </button>
            </div>
          </form>

          <button type="button" className="pf-signout" onClick={handleSignOut}>
            <LogOut size={16} />
            {c.signOut}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;