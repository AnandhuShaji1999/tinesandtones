import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  ChevronDown,
  Ellipsis,
  ArrowUp,
} from "lucide-react";
import { SALES_CONTENT } from "../../content/salesContent";
import { getSalesData } from "../../services/salesService";

const EMPTY = { search: "", category: "", status: "", branch: "" };

const Sales = () => {
  const c = SALES_CONTENT;
  const [filters, setFilters] = useState(EMPTY);
  const [data, setData] = useState(null);

  useEffect(() => {
    getSalesData().then(setData);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setData(await getSalesData(filters));
  };

  const handleReset = async () => {
    setFilters(EMPTY);
    setData(await getSalesData());
  };

  const renderSub = (sub) => {
    if (sub.type === "trend") {
      return (
        <p className="sl-sub">
          <span className="sl-up">
            <ArrowUp size={10} /> {sub.text}
          </span>{" "}
          {sub.suffix}
        </p>
      );
    }
    if (sub.type === "warn") {
      return (
        <p className="sl-sub">
          <strong className="sl-warn">{sub.text}</strong> {sub.suffix}
        </p>
      );
    }
    return <p className="sl-sub">{sub.text}</p>;
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

  return (
    <div className="sl-page">
      <div className="sl-head">
        <div>
          <h2 className="sl-title">{c.title}</h2>
          <p className="sl-subtitle">{c.subtitle}</p>
        </div>
        <button type="button" className="sl-add">
          <Plus size={15} />
          {c.addProduct}
        </button>
      </div>

      {!data ? (
        <p className="dash-loading">Loading...</p>
      ) : (
        <>
          <div className="sl-stats">
            {data.stats.map((s) => (
              <div className="sl-stat" key={s.id}>
                <p className="sl-stat-label">{s.label}</p>
                <p className="sl-stat-value">{s.value}</p>
                {renderSub(s.sub)}
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
            <Select name="category" options={c.categoryOptions} />
            <Select name="status" options={c.statusOptions} />
            <Select name="branch" options={c.branchOptions} />
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
              Showing {data.rows.length ? 1 : 0}–{data.rows.length} of{" "}
              {(data.filtered ? data.rows.length : data.total).toLocaleString()}{" "}
              entries
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
                  {data.rows.length === 0 ? (
                    <tr>
                      <td colSpan={c.columns.length} className="sl-empty">
                        {c.empty}
                      </td>
                    </tr>
                  ) : (
                    data.rows.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div className="sl-prod">
                            <span className={`sl-avatar tone-${r.tone}`}>
                              {r.initials}
                            </span>
                            <div>
                              <div className="sl-prod-name">{r.name}</div>
                              <div className="sl-prod-sku">{r.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="sl-muted">{r.sku}</td>
                        <td className="sl-muted">{r.category}</td>
                        <td className="sl-muted">{r.branch}</td>
                        <td className="sl-bold">{r.available}</td>
                        <td className="sl-muted">{r.cost}</td>
                        <td>
                          <span className={`sl-pill st-${r.status}`}>
                            <i />
                            {c.statusLabels[r.status]}
                          </span>
                        </td>
                        <td>
                          <button type="button" className="sl-more" aria-label="Actions">
                            <Ellipsis size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Sales;