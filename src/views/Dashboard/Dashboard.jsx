import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  ChevronDown,
  CircleAlert,
  Package,
  Percent,
  ReceiptText,
  TriangleAlert,
  Undo2,
  Wallet,
  Boxes,
  ChartColumn,
} from "lucide-react";
import { DASHBOARD_CONTENT } from "../../content/dashboardContent";
import { loadDashboard } from "../../controllers/dashboardController";
import { listBranches } from "../../controllers/staffController";
import { fmtDate, inr } from "../../models/billingModel";

const EMPTY = { from: "", to: "", branch: "" };

const Dashboard = () => {
  const c = DASHBOARD_CONTENT;
  const [draft, setDraft] = useState(EMPTY);
  const [applied, setApplied] = useState(EMPTY);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    listBranches().then(setBranches);
  }, []);

  const load = useCallback(async () => {
    try {
      setError("");
      setData(await loadDashboard(applied));
    } catch (err) {
      setError(err.message);
      setData(null);
    }
  }, [applied]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft((p) => ({ ...p, [name]: value }));
  };

  const branchName = (id, fallback) =>
    fallback || branches.find((b) => b.value === id)?.label || id || "-";

  const hasBranches = branches.length > 0;
  const maxSales = data ? Math.max(1, ...data.stores.map((s) => s.netSales)) : 1;

  const money = data
    ? [
        { id: 1, icon: Wallet, label: "Net Sales", value: inr(data.netSales) },
        { id: 2, icon: ChartColumn, label: "Gross Sales", value: inr(data.grossSales) },
        { id: 3, icon: Undo2, label: "Exchange Returns", value: inr(data.exchangeReturns) },
        { id: 4, icon: Percent, label: "Discounts", value: inr(data.discounts) },
      ]
    : [];

  const counts = data
    ? [
        { id: 1, icon: ReceiptText, label: "Sales Count", value: data.salesCount },
        { id: 2, icon: Package, label: "Items Sold", value: data.itemsSold },
        { id: 3, icon: TriangleAlert, label: "Low Stock", value: data.lowStock },
        { id: 4, icon: CircleAlert, label: "Out of Stock", value: data.outOfStock },
        { id: 5, icon: Boxes, label: "Stock Loss Units", value: data.stockLossUnits },
      ]
    : [];

  const StatCard = ({ s }) => {
    const Icon = s.icon;
    return (
      <div className="stat">
        <div className="stat-top">
          <div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
          <span className="stat-icon">
            <Icon size={18} strokeWidth={1.8} />
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <form
        className="filter-card"
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(draft);
        }}
      >
        <div className="f-field">
          <label>{c.filters.from}</label>
          <div className="f-control">
            <input
              type="date"
              name="from"
              value={draft.from}
              onChange={handleChange}
              className={draft.from ? "" : "is-empty"}
            />
            <Calendar size={18} className="f-icon" />
          </div>
        </div>

        <div className="f-field">
          <label>{c.filters.to}</label>
          <div className="f-control">
            <input
              type="date"
              name="to"
              value={draft.to}
              onChange={handleChange}
              className={draft.to ? "" : "is-empty"}
            />
            <Calendar size={18} className="f-icon" />
          </div>
        </div>

        <div className="f-field">
          <label>{c.filters.branch}</label>
          <div className="f-control">
            {hasBranches ? (
              <>
                <select name="branch" value={draft.branch} onChange={handleChange}>
                  <option value="">{c.filters.allBranches}</option>
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
                name="branch"
                value={draft.branch}
                onChange={handleChange}
                placeholder={c.filters.branchId}
              />
            )}
          </div>
        </div>

        <button type="submit" className="apply-btn">
          {c.filters.apply}
        </button>
      </form>

      {error && <p className="bx-alert dash-err">{error}</p>}

      {!data ? (
        !error && <p className="dash-loading">Loading...</p>
      ) : (
        <>
          <h2 className="section-title">{c.salesTitle}</h2>
          <div className="stats-card">
            {money.map((s) => (
              <StatCard key={s.id} s={s} />
            ))}
          </div>

          <h2 className="section-title">{c.stockTitle}</h2>
          <div className="stats-card five">
            {counts.map((s) => (
              <StatCard key={s.id} s={s} />
            ))}
          </div>

          <div className="bottom">
            <div>
              <h2 className="section-title">{c.storeTitle}</h2>
              <div className="store-card">
                <p className="stores-label">{c.storesLabel}</p>
                {data.stores.length === 0 ? (
                  <p className="stores-label">{c.storesEmpty}</p>
                ) : (
                  data.stores.map((s) => (
                    <div className="store-item" key={s.branch}>
                      <span className="store-name">
                        {s.name} &middot; {inr(s.netSales)}
                      </span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{ width: `${(s.netSales / maxSales) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h2 className="section-title">{c.billsTitle}</h2>
              <div className="orders-card">
                <div className="orders-head">
                  <span>{c.billsSub}</span>
                </div>
                <div className="tbl-wrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        {c.billCols.map((col) => (
                          <th key={col}>
                            <div className="th">{col}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.bills.length === 0 ? (
                        <tr>
                          <td colSpan={c.billCols.length} className="st-empty">
                            {c.billsEmpty}
                          </td>
                        </tr>
                      ) : (
                        data.bills.map((b) => (
                          <tr key={b.id}>
                            <td className="cell-bold">{b.invoice}</td>
                            <td className="cell-bold">{branchName(b.branch)}</td>
                            <td className="cell-bold">{fmtDate(b.date)}</td>
                            <td className="cell-bold">{inr(b.total)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;