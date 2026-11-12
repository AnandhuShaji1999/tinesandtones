import { useEffect, useState } from "react";
import { Plus, Search, Calendar, Ellipsis } from "lucide-react";
import { CUSTOMERS_CONTENT } from "../../content/customersContent";
import { getCustomers } from "../../services/customersService";

const EMPTY = { name: "", code: "", from: "", to: "" };

const Customers = () => {
  const c = CUSTOMERS_CONTENT;
  const [filters, setFilters] = useState(EMPTY);
  const [data, setData] = useState(null);

  useEffect(() => {
    getCustomers().then(setData);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setData(await getCustomers(filters));
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

  return (
    <div className="cu-page">
      <div className="cu-head">
        <div>
          <h2 className="cu-title">{c.title}</h2>
          <p className="cu-subtitle">{c.subtitle}</p>
        </div>
        <button type="button" className="cu-add">
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

      {!data ? (
        <p className="dash-loading">Loading...</p>
      ) : (
        <div className="cu-table-card">
          <p className="cu-showing">
            Showing {data.rows.length ? 1 : 0}–{data.rows.length} of{" "}
            {(data.filtered ? data.rows.length : data.total).toLocaleString()}{" "}
            entries
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
                          <span className="cu-name">{r.first}</span>
                          <span className="cu-dash">-</span>
                          <span className="cu-name">{r.last}</span>
                        </div>
                      </td>
                      <td className="cu-muted">{r.mobile}</td>
                      <td className="cu-muted">{r.branch}</td>
                      <td className="cu-bold">
                        {r.startDate.split("-").reverse().join("/")}
                      </td>
                      <td className="cu-muted">{r.total}</td>
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

          <p className="cu-page-count">Page 1 of {data.pages}</p>
        </div>
      )}
    </div>
  );
};

export default Customers;