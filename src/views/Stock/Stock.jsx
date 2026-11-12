import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Package,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { STOCK_CONTENT } from "../../content/stockContent";
import {
  columnsOf,
  formatCell,
  humanize,
  qtyKey,
  sumOf,
} from "../../models/stockModel";
import { PAGE_SIZE } from "../../models/categoryModel";
import { listStock, getBatchDetail } from "../../controllers/stockController";
import { listBranches } from "../../controllers/staffController";
import { listVariantOptions } from "../../controllers/variantController";

const EMPTY = { branch: "", variant: "", purchase: "", q: "" };
const TABS = ["balances", "batches", "ledger"];

const Stock = () => {
  const c = STOCK_CONTENT;
  const [tab, setTab] = useState("balances");
  const [draft, setDraft] = useState(EMPTY);
  const [applied, setApplied] = useState(EMPTY);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const [branches, setBranches] = useState([]);
  const [variants, setVariants] = useState([]);

  const [detail, setDetail] = useState(null);

  useEffect(() => {
    listBranches().then(setBranches);
    listVariantOptions().then(setVariants);
  }, []);

  const load = useCallback(async () => {
    setData(null);
    try {
      setError("");
      setData(
        await listStock(tab, {
          branch: applied.branch,
          variant: applied.variant,
          purchase: applied.purchase,
          page,
        })
      );
    } catch (err) {
      setError(err.message);
      setData({ rows: [], total: 0, page: 1, pages: 1 });
    }
  }, [tab, applied.branch, applied.variant, applied.purchase, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Show names instead of ids for branch / variant columns
  const lookup = useMemo(
    () => ({
      branch: Object.fromEntries(branches.map((b) => [b.value, b.label])),
      variant: Object.fromEntries(variants.map((v) => [v.value, v.label])),
    }),
    [branches, variants]
  );

  // Client-side text filter on the loaded page
  const rows = useMemo(() => {
    if (!data) return [];
    const q = applied.q.trim().toLowerCase();
    if (!q) return data.rows;
    return data.rows.filter((r) =>
      Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [data, applied.q]);

  const cols = useMemo(() => columnsOf(rows.length ? rows : data?.rows || []), [rows, data]);
  const qk = qtyKey(cols);
  const units = sumOf(rows, qk);
  const zeroCount = qk ? rows.filter((r) => Number(r[qk]) === 0).length : 0;

  const changeTab = (t) => {
    setTab(t);
    setPage(1);
    setDraft(EMPTY);
    setApplied(EMPTY);
  };

  const handleDraft = (e) => {
    const { name, value } = e.target;
    setDraft((p) => ({ ...p, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setApplied(draft);
  };

  const handleReset = () => {
    setDraft(EMPTY);
    setApplied(EMPTY);
    setPage(1);
  };

  const openDetail = async (row) => {
    if (tab === "batches" && row.id !== undefined && row.id !== "") {
      try {
        setDetail(await getBatchDetail(row.id));
        return;
      } catch (err) {
        setError(err.message);
      }
    }
    setDetail(row);
  };

  const handleExport = () => {
    const csv = [cols, ...rows.map((r) => cols.map((k) => r[k] ?? ""))]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-${tab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasBranches = branches.length > 0;
  const from = data && rows.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = from ? from + rows.length - 1 : 0;

  return (
    <div className="pm-page">
      <div className="pm-head">
        <h2 className="pm-title">{c.title}</h2>
      </div>

      <div className="pm-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`pm-tab ${tab === t ? "active" : ""}`}
            onClick={() => changeTab(t)}
          >
            {c.tabs[t]}
          </button>
        ))}
      </div>

      {/* ============ Filters ============ */}
      <form className="pm-card pm-filters" onSubmit={handleSearch}>
        <div className="pm-filters-head">
          <span>
            <Filter size={14} />
            {c.filters.title}
          </span>
          <span className="pm-muted">
            Showing {from} to {to} of {data ? data.total : 0}
          </span>
        </div>

        <div className="pm-fgrid sk-fgrid">
          <div className="pm-f">
            <label>{c.filters.branch}</label>
            <div className="pm-input">
              {hasBranches ? (
                <>
                  <select name="branch" value={draft.branch} onChange={handleDraft}>
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
                  onChange={handleDraft}
                  placeholder={c.filters.branchId}
                />
              )}
            </div>
          </div>

          {tab === "batches" && (
            <div className="pm-f">
              <label>{c.filters.variant}</label>
              <div className="pm-input">
                <select name="variant" value={draft.variant} onChange={handleDraft}>
                  <option value="">{c.filters.allVariants}</option>
                  {variants.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} />
              </div>
            </div>
          )}

          {tab === "ledger" && (
            <div className="pm-f">
              <label>{c.filters.purchase}</label>
              <div className="pm-input">
                <span className="pm-hash">#</span>
                <input
                  name="purchase"
                  value={draft.purchase}
                  onChange={handleDraft}
                  placeholder={c.filters.purchasePh}
                />
              </div>
            </div>
          )}

          <div className="pm-f">
            <label>{c.filters.search}</label>
            <div className="pm-input">
              <Search size={15} />
              <input
                name="q"
                value={draft.q}
                onChange={handleDraft}
                placeholder={c.filters.searchPh}
              />
            </div>
          </div>
        </div>

        <div className="pm-factions">
          <button type="button" className="pm-link" onClick={handleReset}>
            <RotateCcw size={14} />
            {c.filters.reset}
          </button>
          <button type="button" className="pm-soft" onClick={handleExport}>
            <Download size={14} />
            {c.filters.export}
          </button>
          <button type="submit" className="pm-primary">
            <Search size={15} />
            {c.filters.submit}
          </button>
        </div>
      </form>

      {/* ============ Summary ============ */}
      <div className="pm-stats">
        <div className="pm-card pm-stat">
          <div className="pm-stat-top">
            <span>{c.stats.records}</span>
            <i className="pm-ico blue">
              <Archive size={16} />
            </i>
          </div>
          <p className="pm-stat-val">{data ? data.total : "-"}</p>
        </div>

        <div className="pm-card pm-stat">
          <div className="pm-stat-top">
            <span>{c.stats.units}</span>
            <i className="pm-ico green">
              <Package size={16} />
            </i>
          </div>
          <p className="pm-stat-val">{qk ? units.toLocaleString("en-IN") : "-"}</p>
        </div>

        <div className="pm-card pm-stat sk-danger">
          <div className="pm-stat-top">
            <span>{c.stats.zero}</span>
            <i className="pm-ico red">
              <AlertCircle size={16} />
            </i>
          </div>
          <p className="pm-stat-val">{qk ? zeroCount : "-"}</p>
        </div>
      </div>

      {/* ============ Table ============ */}
      <div className="pm-card pm-records">
        {error && <p className="pm-error">{error}</p>}

        {!data ? (
          <p className="dash-loading pm-pad">Loading...</p>
        ) : (
          <>
            <div className="pm-tbl-wrap">
              <table className="pm-tbl sk-tbl">
                <thead>
                  <tr>
                    <th>SL. NO.</th>
                    {cols.map((k) => (
                      <th key={k}>{humanize(k)}</th>
                    ))}
                    <th>{c.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={cols.length + 2} className="pm-empty">
                        {c.empty}
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, i) => (
                      <tr key={r.id ?? i}>
                        <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                        {cols.map((k) => (
                          <td key={k} className={k === qk ? "pm-bold" : ""}>
                            {formatCell(k, r[k], lookup)}
                          </td>
                        ))}
                        <td>
                          <div className="pm-actions">
                            <button
                              type="button"
                              aria-label="View"
                              onClick={() => openDetail(r)}
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
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
                <span>
                  Page {page} of {data.pages}
                </span>
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

      {/* ============ Detail popup (all fields) ============ */}
      {detail && (
        <div className="pm-modal" onClick={() => setDetail(null)}>
          <div className="pm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="pm-modal-head">
              <h3>{c.detail.title}</h3>
              <button
                type="button"
                onClick={() => setDetail(null)}
                aria-label={c.detail.close}
              >
                <X size={18} />
              </button>
            </div>

            <div className="sk-kv">
              {Object.keys(detail).map((k) => (
                <div className="sk-kv-row" key={k}>
                  <span>{humanize(k)}</span>
                  <b>{formatCell(k, detail[k], lookup)}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;