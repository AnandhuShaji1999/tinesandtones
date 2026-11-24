import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Search, Calendar, X } from "lucide-react";
import { CUSTOMERS_CONTENT } from "../../content/customersContent";
import {
  getCustomers,
  createCustomer,
  getErrorMessage,
} from "../../services/customersService";

const EMPTY = { name: "", code: "", from: "", to: "" };
const EMPTY_FORM = { name: "", phone: "", email: "", gstin: "", address: "" };

const Customers = () => {
  const c = CUSTOMERS_CONTENT;
  const [filters, setFilters] = useState(EMPTY);
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const pageSizeRef = useRef(0);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async (f, p) => {
    setError("");
    try {
      const res = await getCustomers(f, p);
      if (p === 1 && res.pageSize > 0) pageSizeRef.current = res.pageSize;
      setData(res);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load customers"));
      setData({ rows: [], total: 0, pageSize: 0, hasNext: false, hasPrev: false });
    }
  }, []);

  useEffect(() => {
    load(EMPTY, 1);
  }, [load]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setData(null);
    load(filters, 1);
  };

  const goToPage = (p) => {
    setPage(p);
    setData(null);
    load(filters, p);
  };

  const openModal = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) setShowModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Customer name is required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await createCustomer(form);
      setShowModal(false);
      setFilters(EMPTY);
      setPage(1);
      setData(null);
      await load(EMPTY, 1);
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to create customer"));
    } finally {
      setSaving(false);
    }
  };

  const DateField = ({ name }) => (
    <div className="cu-date">
      <input
        type="date"
        name={name}
        value={filters[name]}
        onChange={handleChange}
        className={filters[name] ? "" : "is-empty"}
      />
      {!filters[name] && <span className="cu-date-ph">00 / 00 / 0000</span>}
      <Calendar size={15} className="cu-date-icon" />
    </div>
  );

  const pageSize = pageSizeRef.current || data?.rows.length || 0;
  const pages = pageSize ? Math.max(1, Math.ceil((data?.total || 0) / pageSize)) : 1;
  const start = data?.rows.length ? (page - 1) * pageSize + 1 : 0;
  const end = data?.rows.length ? start + data.rows.length - 1 : 0;

  return (
    <div className="cu-page">
      <div className="cu-head">
        <div>
          <h2 className="cu-title">{c.title}</h2>
          <p className="cu-subtitle">{c.subtitle}</p>
        </div>
        <button type="button" className="cu-add" onClick={openModal}>
          <Plus size={15} />
          {c.addCustomer}
        </button>
      </div>

      <form className="cu-filter" onSubmit={handleSearch}>
        <div className="cu-search">
          <Search size={16} className="cu-search-icon" />
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleChange}
            placeholder={c.search.name}
          />
        </div>

        <input
          type="text"
          name="code"
          value={filters.code}
          onChange={handleChange}
          placeholder={c.search.id}
          className="cu-input"
        />

        <DateField name="from" />
        <span className="cu-to">{c.search.to}</span>
        <DateField name="to" />

        <button type="submit" className="cu-submit">
          <Search size={15} />
          {c.search.submit}
        </button>
      </form>

      {error && <p className="cu-error">{error}</p>}

      {!data ? (
        <p className="dash-loading">Loading...</p>
      ) : (
        <div className="cu-table-card">
          <p className="cu-showing">
            Showing {start}–{end} of {data.total.toLocaleString()} entries
          </p>

          <div className="cu-tbl-wrap">
            <table className="cu-tbl">
              <thead>
                <tr>
                  {c.columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.length === 0 ? (
                  <tr>
                    <td colSpan={c.columns.length} className="cu-empty">
                      {c.empty}
                    </td>
                  </tr>
                ) : (
                  data.rows.map((r) => (
                    <tr key={r.id}>
                      <td className="cu-muted">{r.code}</td>
                      <td>
                        <div className="cu-cust">
                          <span className={`sl-avatar cu-avatar tone-${r.tone}`}>
                            {r.initials}
                          </span>
                          <span className="cu-name">{r.name}</span>
                        </div>
                      </td>
                      <td className="cu-muted">{r.mobile || "-"}</td>
                      <td className="cu-muted">{r.email || "-"}</td>
                      <td className="cu-muted">{r.gstin || "-"}</td>
                      <td className="cu-muted">{r.address || "-"}</td>
                      <td className="cu-bold">
                        {r.startDate
                          ? r.startDate.split("-").reverse().join("/")
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="cu-pager">
            <button
              type="button"
              disabled={!data.hasPrev}
              onClick={() => goToPage(page - 1)}
            >
              Previous
            </button>
            <p className="cu-page-count">
              Page {page} of {pages}
            </p>
            <button
              type="button"
              disabled={!data.hasNext}
              onClick={() => goToPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="cu-overlay" onClick={closeModal}>
          <form
            className="cu-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreate}
          >
            <div className="cu-modal-head">
              <h3>Add Customer</h3>
              <button type="button" onClick={closeModal} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <label>
              Name *
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Customer name"
                autoFocus
              />
            </label>
            <label>
              Phone
              <input
                name="phone"
                value={form.phone}
                onChange={handleFormChange}
                placeholder="Mobile number"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleFormChange}
                placeholder="Email (optional)"
              />
            </label>
            <label>
              GSTIN
              <input
                name="gstin"
                value={form.gstin}
                onChange={handleFormChange}
                placeholder="GSTIN (optional)"
              />
            </label>
            <label>
              Address
              <textarea
                name="address"
                rows={3}
                value={form.address}
                onChange={handleFormChange}
                placeholder="Address (optional)"
              />
            </label>

            {formError && <p className="cu-error">{formError}</p>}

            <div className="cu-modal-actions">
              <button type="button" className="cu-cancel" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="cu-add" disabled={saving}>
                {saving ? "Saving..." : "Save Customer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Customers;