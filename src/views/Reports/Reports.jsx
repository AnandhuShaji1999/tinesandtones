import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCcw,
  Search,
} from "lucide-react";
import { REPORT_CONTENT } from "../../content/reportContent";
import {
  REPORTS,
  REPORT_PAGE_SIZE,
  columnsOf,
  formatCell,
  humanize,
} from "../../models/reportModel";
import { pageList } from "../../models/exchangeModel";
import { exportReport, loadReport } from "../../controllers/reportController";
import { listBranches } from "../../controllers/staffController";

const EMPTY = { branch: "", from: "", to: "" };

const Reports = () => {
  const c = REPORT_CONTENT;
  const [tab, setTab] = useState("sales");
  const [draft, setDraft] = useState(EMPTY);
  const [applied, setApplied] = useState(EMPTY);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    listBranches().then(setBranches);
  }, []);

  const load = useCallback(async () => {
    setData(null);
    try {
      setError("");
      setData(await loadReport(tab, applied, page));
    } catch (err) {
      setError(err.message);
      setData({ rows: [], total: 0, pages: 1 });
    }
  }, [tab, applied, page]);

  useEffect(() => {
    load();
  }, [load]);

  const branchMap = useMemo(
    () => Object.fromEntries(branches.map((b) => [b.value, b.label])),
    [branches]
  );

  const rows = useMemo(() => {
    if (!data) return [];
    const t = q.trim().toLowerCase();
    if (!t) return data.rows;
    return data.rows.filter((r) =>
      Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(t))
    );
  }, [data, q]);

  const cols = useMemo(() => columnsOf(data?.rows || []), [data]);

  const changeTab = (t) => {
    setTab(t);
    setPage(1);
    setQ("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft((p) => ({ ...p, [name]: value }));
  };

  const handleExport = async (format) => {
    setExporting(format);
    setError("");
    try {
      await exportReport(tab, applied, format);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting("");
    }
  };

  const hasBranches = branches.length > 0;
  const from = data && data.rows.length ? (page - 1) * REPORT_PAGE_SIZE + 1 : 0;
  const to = from ? from + data.rows.length - 1 : 0;

  return (
    <div className="pm-page">
      <div className="pm-head">
        <h2 className="pm-title">{c.title}</h2>
      </div>

      <div className="pm-tabs rp-tabs">
        {REPORTS.map((r) => (
          <button
            key={r.key}
            type="button"
            className={`pm-tab ${tab === r.key ? "active" : ""}`}
            onClick={() => changeTab(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <form
        className="pm-card pm-filters"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setApplied(draft);
        }}
      >
        <div className="pm-fgrid sk-fgrid rp-grid">
          <div className="pm-f">
            <label>{c.filters.branch}</label>
            <div className="pm-input">
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
                  <ChevronDown size={15} />
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

          <div className="pm-f">
            <label>{c.filters.from}</label>
            <div className="pm-input">
              <input type="date" name="from" value={draft.from} onChange={handleChange} />
              <Calendar size={15} />
            </div>
          </div>

          <div className="pm-f">
            <label>{c.filters.to}</label>
            <div className="pm-input">
              <input type="date" name="to" value={draft.to} onChange={handleChange} />
              <Calendar size={15} />
            </div>
          </div>

          <div className="pm-f">
            <label>{c.filters.search}</label>
            <div className="pm-input">
              <Search size={15} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={c.filters.searchPh}
              />
            </div>
          </div>
        </div>

        <div className="pm-factions rp-actions">
          <button
            type="button"
            className="pm-link"
            onClick={() => {
              setDraft(EMPTY);
              setApplied(EMPTY);
              setQ("");
              setPage(1);
            }}
          >
            <RotateCcw size={14} />
            {c.filters.reset}
          </button>
          <button
            type="button"
            className="pm-soft"
            onClick={() => handleExport("csv")}
            disabled={Boolean(exporting)}
          >
            <Download size={14} />
            {exporting === "csv" ? c.filters.exporting : c.filters.csv}
          </button>
          <button
            type="button"
            className="pm-soft"
            onClick={() => handleExport("xlsx")}
            disabled={Boolean(exporting)}
          >
            <Download size={14} />
            {exporting === "xlsx" ? c.filters.exporting : c.filters.xlsx}
          </button>
          <button type="submit" className="pm-primary">
            <Search size={15} />
            {c.filters.apply}
          </button>
        </div>
      </form>

      {tab === "stock" && <p className="ex-rule">{c.note}</p>}

      <div className="pm-card pm-records">
        {error && <p className="pm-error">{error}</p>}

        {!data ? (
          <p className="dash-loading pm-pad">Loading...</p>
        ) : (
          <>
            <div className="pm-tbl-wrap">
              <table className="pm-tbl sk-tbl rp-tbl">
                <thead>
                  <tr>
                    <th>SL. NO.</th>
                    {cols.map((k) => (
                      <th key={k}>{humanize(k)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={cols.length + 1} className="pm-empty">
                        {c.empty}
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, i) => (
                      <tr key={i}>
                        <td>{(page - 1) * REPORT_PAGE_SIZE + i + 1}</td>
                        {cols.map((k) => (
                          <td key={k}>{formatCell(k, r[k], branchMap)}</td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pm-foot">
              <p className="pm-muted">
                Showing <b>{from}</b> to <b>{to}</b> of <b>{data.total}</b> entries
              </p>
              <div className="pm-pager">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Previous"
                >
                  <ChevronLeft size={15} />
                </button>
                {pageList(page, data.pages).map((n, i) =>
                  n === "..." ? (
                    <span key={`d${i}`}>...</span>
                  ) : (
                    <button
                      type="button"
                      key={n}
                      className={n === page ? "on" : ""}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  )
                )}
                <button
                  type="button"
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Next"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;