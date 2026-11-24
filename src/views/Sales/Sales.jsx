import { useEffect, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { SALES_CONTENT } from "../../content/salesContent";
import { loadSales } from "../../controllers/salesController";
import { filterSales, formatDate, PAGE_SIZE } from "../../models/salesModel";

const EMPTY = { search: "", kind: "", method: "", branch: "" };

const Sales = () => {
  const c = SALES_CONTENT;
  const [filters, setFilters] = useState(EMPTY);
  const [applied, setApplied] = useState(EMPTY);
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSales()
      .then(setData)
      .catch((err) => {
        setError(err.message);
        setData({ rows: [], stats: [], branchOptions: [{ value: "", label: "All Branches" }] });
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setApplied(filters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(EMPTY);
    setApplied(EMPTY);
    setPage(1);
  };

  const Select = ({ name, options }) => (
    <div className="sl-select">
      <select name={name} value={filters[name]} onChange={handleChange}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="sl-select-icon" />
    </div>
  );

  const filtered = data ? filterSales(data.rows, applied) : [];
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const pageRows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const start = pageRows.length ? (current - 1) * PAGE_SIZE + 1 : 0;
  const end = pageRows.length ? start + pageRows.length - 1 : 0;

  return (
    <div className="sl-page">
      <div className="sl-head">
        <div>
          <h2 className="sl-title">{c.title}</h2>
          <p className="sl-subtitle">{c.subtitle}</p>
        </div>
      </div>

      {error && <p className="cu-error">{error}</p>}

      {!data ? (
        <p className="dash-loading">Loading...</p>
      ) : (
        <>
          <div className="sl-stats">
            {data.stats.map((s) => (
              <div className="sl-stat" key={s.id}>
                <p className="sl-stat-label">{s.label}</p>
                <p className="sl-stat-value">{s.value}</p>
                <p className="sl-sub">{s.sub.text}</p>
              </div>
            ))}
          </div>

          <form className="sl-filter" onSubmit={handleSearch}>
            <div className="sl-search">
              <Search size={16} className="sl-search-icon" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder={c.search.placeholder}
              />
            </div>
            <Select name="kind" options={c.kindOptions} />
            <Select name="method" options={c.methodOptions} />
            <Select name="branch" options={data.branchOptions} />
            <button type="button" className="sl-reset" onClick={handleReset}>
              {c.search.reset}
            </button>
            <button type="submit" className="sl-submit">
              <Search size={15} />
              {c.search.submit}
            </button>
          </form>

          <div className="sl-table-card">
            <p className="sl-showing">
              Showing {start}–{end} of {filtered.length.toLocaleString()} entries
            </p>

            <div className="sl-tbl-wrap">
              <table className="sl-tbl">
                <thead>
                  <tr>
                    {c.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={c.columns.length} className="sl-empty">
                        {c.empty}
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((r) => (
                      <tr key={r.id}>
                        <td className="sl-bold">{r.invoice}</td>
                        <td>
                          <div className="sl-prod">
                            <span className={`sl-avatar tone-${r.tone}`}>
                              {r.initials}
                            </span>
                            <div className="sl-prod-name">{r.customer}</div>
                          </div>
                        </td>
                        <td className="sl-muted">{r.branch}</td>
                        <td className="sl-muted">{r.items}</td>
                        <td className="sl-muted">{r.paymentLabel}</td>
                        <td className="sl-bold">{r.total}</td>
                        <td className="sl-muted">{formatDate(r.date)}</td>
                        <td>
                          <span
                            className={`sl-pill ${
                              r.kind === "tax_invoice" ? "st-in" : "st-low"
                            }`}
                          >
                            <i />
                            {c.kindLabels[r.kind] || r.kind}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="sl-pager">
              <button
                type="button"
                disabled={current <= 1}
                onClick={() => setPage(current - 1)}
              >
                Previous
              </button>
              <p>
                Page {current} of {pages}
              </p>
              <button
                type="button"
                disabled={current >= pages}
                onClick={() => setPage(current + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Sales;