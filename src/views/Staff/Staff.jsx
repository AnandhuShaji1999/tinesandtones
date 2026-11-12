import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Eye, EyeOff, UserPlus } from "lucide-react";
import { STAFF_CONTENT } from "../../content/staffContent";
import { STAFF_ROLES } from "../../models/staffModel";
import {
  createStaff,
  listStaff,
  listBranches,
  deactivateStaff,
} from "../../controllers/staffController";

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  branch: "",
  role: "",
};

const Staff = () => {
  const c = STAFF_CONTENT;
  const [form, setForm] = useState(EMPTY);
  const [branches, setBranches] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [list, setList] = useState(null);
  const [listError, setListError] = useState("");

  const loadList = useCallback(async () => {
    try {
      setListError("");
      setList(await listStaff());
    } catch (err) {
      setListError(err.message);
      setList({ rows: [], total: 0 });
    }
  }, []);

  useEffect(() => {
    loadList();
    listBranches().then(setBranches);
  }, [loadList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await createStaff(form);
      setSuccess(c.form.success);
      setForm(EMPTY);
      loadList();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this staff member?")) return;
    try {
      await deactivateStaff(id);
      loadList();
    } catch (err) {
      setListError(err.message);
    }
  };

  const hasBranches = branches && branches.length > 0;

  return (
    <div className="st-page">
      <h2 className="st-title">{c.title}</h2>
      <p className="st-subtitle">{c.subtitle}</p>

      <form className="st-card" onSubmit={handleSubmit}>
        <h3 className="st-card-title">
          <UserPlus size={18} />
          {c.form.title}
        </h3>

        <div className="st-grid">
          <div className="f-field">
            <label>{c.form.firstName.label}</label>
            <div className="f-control">
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder={c.form.firstName.placeholder}
                required
              />
            </div>
          </div>

          <div className="f-field">
            <label>{c.form.lastName.label}</label>
            <div className="f-control">
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder={c.form.lastName.placeholder}
              />
            </div>
          </div>

          <div className="f-field">
            <label>{c.form.email.label}</label>
            <div className="f-control">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={c.form.email.placeholder}
                required
              />
            </div>
          </div>

          <div className="f-field">
            <label>{c.form.password.label}</label>
            <div className="f-control">
              <input
                type={showPw ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={c.form.password.placeholder}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="st-eye"
                onClick={() => setShowPw((s) => !s)}
                aria-label="Toggle password"
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div className="f-field">
            <label>
              {hasBranches ? c.form.branch.label : c.form.branchId.label}
            </label>
            <div className="f-control">
              {hasBranches ? (
                <>
                  <select
                    name="branch"
                    value={form.branch}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{c.form.branch.placeholder}</option>
                    {branches.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="f-icon" />
                </>
              ) : (
                <input
                  type="text"
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  placeholder={c.form.branchId.placeholder}
                  required
                />
              )}
            </div>
          </div>

          <div className="f-field">
            <label>{c.form.role.label}</label>
            <div className="f-control">
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="">{c.form.role.placeholder}</option>
                {STAFF_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="f-icon" />
            </div>
          </div>
        </div>

        {error && <p className="st-msg st-error">{error}</p>}
        {success && <p className="st-msg st-success">{success}</p>}

        <div className="st-actions">
          <button
            type="button"
            className="st-reset"
            onClick={() => {
              setForm(EMPTY);
              setError("");
              setSuccess("");
            }}
          >
            {c.form.reset}
          </button>
          <button type="submit" className="st-submit" disabled={saving}>
            {saving ? c.form.submitting : c.form.submit}
          </button>
        </div>
      </form>

      <div className="st-card st-list">
        <h3 className="st-card-title">{c.list.title}</h3>
        {listError && <p className="st-msg st-error">{listError}</p>}

        {!list ? (
          <p className="dash-loading">Loading...</p>
        ) : (
          <>
            <p className="st-showing">
              Showing {list.rows.length ? 1 : 0}–{list.rows.length} of{" "}
              {list.total} entries
            </p>
            <div className="st-tbl-wrap">
              <table className="st-tbl">
                <thead>
                  <tr>
                    {c.list.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.rows.length === 0 ? (
                    <tr>
                      <td colSpan={c.list.columns.length} className="st-empty">
                        {c.list.empty}
                      </td>
                    </tr>
                  ) : (
                    list.rows.map((s) => (
                      <tr key={s.id}>
                        <td className="st-bold">{s.fullName}</td>
                        <td className="st-muted">{s.email}</td>
                        <td className="st-muted">{s.branch || "-"}</td>
                        <td className="st-muted st-cap">{s.role || "-"}</td>
                        <td>
                          <span
                            className={`sl-pill ${s.isActive ? "st-in" : "st-out"}`}
                          >
                            <i />
                            {s.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          {s.isActive && (
                            <button
                              type="button"
                              className="st-deact"
                              onClick={() => handleDeactivate(s.id)}
                            >
                              {c.list.deactivate}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Staff;