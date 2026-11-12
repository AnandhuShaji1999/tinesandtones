import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Search } from "lucide-react";
import { SUPPLIER_CONTENT } from "../../content/supplierContent";
import {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deactivateSupplier,
} from "../../controllers/supplierController";

const EMPTY = {
  code: "",
  name: "",
  contactName: "",
  phone: "",
  email: "",
  stateCode: "",
  address: "",
};

const Suppliers = () => {
  const c = SUPPLIER_CONTENT;
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const [page, setPage] = useState(1);
  const [list, setList] = useState(null);
  const [listError, setListError] = useState("");

  const load = useCallback(async () => {
    try {
      setListError("");
      setList(await listSuppliers({ search: applied, page }));
    } catch (err) {
      setListError(err.message);
      setList({ rows: [], total: 0, page: 1, pages: 1 });
    }
  }, [applied, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      if (editingId) {
        await updateSupplier(editingId, form);
        setSuccess(c.form.updatedMsg);
      } else {
        await createSupplier(form);
        setSuccess(c.form.createdMsg);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s) => {
    setEditingId(s.id);
    setForm({
      code: s.code,
      name: s.name,
      contactName: s.contactName,
      phone: s.phone,
      email: s.email,
      stateCode: s.stateCode,
      address: s.address,
    });
    setSuccess("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm(c.list.confirm)) return;
    try {
      await deactivateSupplier(id);
      if (editingId === id) resetForm();
      load();
    } catch (err) {
      setListError(err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setApplied(search.trim());
  };

  const handleReset = () => {
    setSearch("");
    setApplied("");
    setPage(1);
  };

  const field = (name, type = "text", required = false) => (
    <div className="f-field">
      <label>{c.form[name].label}</label>
      <div className="f-control">
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={c.form[name].placeholder}
          required={required}
        />
      </div>
    </div>
  );

  return (
    <div className="st-page">
      <h2 className="st-title">{c.title}</h2>
      <p className="st-subtitle">{c.subtitle}</p>

      <form className="st-card" onSubmit={handleSubmit}>
        <h3 className="st-card-title">
          {editingId ? <Pencil size={18} /> : <Plus size={18} />}
          {editingId ? c.form.editTitle : c.form.createTitle}
        </h3>

        <div className="st-grid">
          {field("code", "text", true)}
          {field("name", "text", true)}
          {field("contactName")}
          {field("phone", "tel")}
          {field("email", "email")}
          {field("stateCode")}
          {field("address")}
        </div>

        {error && <p className="st-msg st-error">{error}</p>}
        {success && <p className="st-msg st-success">{success}</p>}

        <div className="st-actions">
          {editingId && (
            <button type="button" className="st-reset" onClick={resetForm}>
              {c.form.cancel}
            </button>
          )}
          <button type="submit" className="st-submit" disabled={saving}>
            {saving
              ? c.form.saving
              : editingId
              ? c.form.update
              : c.form.create}
          </button>
        </div>
      </form>

      <div className="st-card st-list">
        <h3 className="st-card-title">{c.list.title}</h3>

        <form className="cat-toolbar" onSubmit={handleSearch}>
          <div className="cat-search">
            <Search size={16} className="cat-search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={c.list.searchPlaceholder}
            />
          </div>
          <button type="button" className="st-reset" onClick={handleReset}>
            {c.list.reset}
          </button>
          <button type="submit" className="st-submit cat-search-btn">
            {c.list.search}
          </button>
        </form>

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
              <table className="st-tbl va-tbl">
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
                        <td className="st-muted">{s.code}</td>
                        <td className="st-bold">{s.name}</td>
                        <td className="st-muted">{s.contactName || "-"}</td>
                        <td className="st-muted">{s.phone || "-"}</td>
                        <td className="st-muted">{s.email || "-"}</td>
                        <td className="st-muted">{s.stateCode || "-"}</td>
                        <td>
                          <span
                            className={`sl-pill ${s.isActive ? "st-in" : "st-out"}`}
                          >
                            <i />
                            {s.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="cat-actions">
                            <button
                              type="button"
                              className="cat-edit"
                              onClick={() => handleEdit(s)}
                            >
                              {c.list.edit}
                            </button>
                            {s.isActive && (
                              <button
                                type="button"
                                className="st-deact"
                                onClick={() => handleDeactivate(s.id)}
                              >
                                {c.list.deactivate}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {list.pages > 1 && (
              <div className="cat-pager">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {list.pages}
                </span>
                <button
                  type="button"
                  disabled={page >= list.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Suppliers;