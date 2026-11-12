import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AUDIT_CONTENT } from "../../content/stockAuditContent";
import { AUDIT_PAGE_SIZE, totalVariance, variance } from "../../models/stockAuditModel";
import { pageList } from "../../models/exchangeModel";
import { fmtDate } from "../../models/billingModel";
import {
  getAudit,
  listAudits,
  listBatchOptions,
  loadBatch,
  postAudit,
} from "../../controllers/stockAuditController";
import { listBranches } from "../../controllers/staffController";

const emptyLine = () => ({ batch: "", expected: "", version: "", physical: "", loading: false });

const StockAudits = () => {
  const c = AUDIT_CONTENT;
  const [tab, setTab] = useState("new");
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    listBranches().then(setBranches);
  }, []);
  const hasBranches = branches.length > 0;

  /* ---------- new audit ---------- */
  const [branch, setBranch] = useState("");
  const [reason, setReason] = useState("");
  const [lines, setLines] = useState([emptyLine()]);
  const [batches, setBatches] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    listBatchOptions(branch).then((o) => active && setBatches(o));
    return () => {
      active = false;
    };
  }, [branch]);

  const setLine = (idx, patch) =>
    setLines((p) => p.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const handleLoad = async (idx, id) => {
    if (!id) return;
    setLine(idx, { batch: id, loading: true });
    setError("");
    try {
      const b = await loadBatch(id);
      setLine(idx, { batch: id, expected: b.expected, version: b.version, loading: false });
    } catch (err) {
      setLine(idx, { loading: false });
      setError(err.message);
    }
  };

  const handleBranch = (v) => {
    setBranch(v);
    setLines([emptyLine()]);
  };

  const resetForm = () => {
    setReason("");
    setLines([emptyLine()]);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDone(false);
    if (!branch) return setError("Select a branch.");
    if (
      lines.some(
        (l) => !l.batch || l.expected === "" || l.version === "" || l.physical === ""
      )
    ) {
      return setError("Every row needs a batch, expected quantity, version and physical quantity.");
    }
    if (new Set(lines.map((l) => l.batch)).size !== lines.length) {
      return setError("The same batch is listed twice.");
    }
    setSaving(true);
    try {
      await postAudit({ branch, reason, lines });
      setDone(true);
      resetForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
      loadHistory();
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  /* ---------- history ---------- */
  const [hBranch, setHBranch] = useState("");
  const [page, setPage] = useState(1);
  const [list, setList] = useState(null);
  const [hError, setHError] = useState("");
  const [detail, setDetail] = useState(null);

  const loadHistory = useCallback(async () => {
    try {
      setHError("");
      setList(await listAudits({ branch: hBranch, page }));
    } catch (err) {
      setHError(err.message);
      setList({ rows: [], total: 0, page: 1, pages: 1 });
    }
  }, [hBranch, page]);

  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab, loadHistory]);

  const openDetail = async (row) => {
    try {
      setDetail(await getAudit(row.id));
    } catch (err) {
      setHError(err.message);
    }
  };

  const branchName = (id) => branches.find((b) => b.value === String(id))?.label || id || "-";
  const from = list && list.rows.length ? (page - 1) * AUDIT_PAGE_SIZE + 1 : 0;
  const to = from ? from + list.rows.length - 1 : 0;

  const varCls = (v) => (v > 0 ? "sa-pos" : v < 0 ? "sa-neg" : "");
  const varTxt = (v) => (v === null ? "-" : v > 0 ? `+${v}` : String(v));

  return (
    <div className="bx-page">
      <div className="bx-top">
        <div className="bx-top-l">
          <h2 className="bx-title">{c.title}</h2>
          <div className="bx-tabs">
            {["new", "history"].map((t) => (
              <button key={t} type="button" className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
                {c.tabs[t]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===================== NEW ===================== */}
      {tab === "new" && (
        <form className="bx-card" onSubmit={handleSubmit}>
          {done && (
            <div className="bx-receipt sa-done">
              <CheckCircle2 size={24} />
              <div className="bx-receipt-t">
                <h3>{c.form.done}</h3>
              </div>
            </div>
          )}
          {error && <p className="bx-alert">{error}</p>}
          <p className="ex-rule">{c.warn}</p>

          <div className="sa-head">
            <label className="sa-f">
              <span>{hasBranches ? c.form.branch : c.form.branchId}</span>
              {hasBranches ? (
                <div className="bx-field">
                  <select value={branch} onChange={(e) => handleBranch(e.target.value)} required>
                    <option value="">{c.form.branchPh}</option>
                    {branches.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} />
                </div>
              ) : (
                <div className="bx-field">
                  <input value={branch} onChange={(e) => handleBranch(e.target.value)} required />
                </div>
              )}
            </label>

            <label className="sa-f">
              <span>{c.form.reason}</span>
              <div className="bx-field">
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={c.form.reasonPh}
                  required
                />
              </div>
            </label>
          </div>

          <h3 className="ex-sub">{c.form.lines}</h3>

          {lines.map((l, i) => {
            const v = variance(l);
            return (
              <div className="sa-line" key={i}>
                <div className="sa-f sa-batch">
                  <span>{batches.length ? c.form.batch : c.form.batchId}</span>
                  <div className="sa-batch-row">
                    {batches.length ? (
                      <div className="bx-field">
                        <select
                          value={l.batch}
                          onChange={(e) => handleLoad(i, e.target.value)}
                        >
                          <option value="">{c.form.batchPh}</option>
                          {batches.map((b) => (
                            <option key={b.value} value={b.value}>
                              {b.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={15} />
                      </div>
                    ) : (
                      <>
                        <div className="bx-field">
                          <input
                            value={l.batch}
                            onChange={(e) => setLine(i, { batch: e.target.value })}
                          />
                        </div>
                        <button
                          type="button"
                          className="bx-btn ghost"
                          onClick={() => handleLoad(i, l.batch)}
                          disabled={l.loading || !l.batch}
                        >
                          {c.form.load}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <label className="sa-f">
                  <span>{c.form.expected}</span>
                  <div className="bx-field">
                    <input
                      type="number"
                      value={l.expected}
                      onChange={(e) => setLine(i, { expected: e.target.value })}
                    />
                  </div>
                </label>

                <label className="sa-f">
                  <span>{c.form.version}</span>
                  <div className="bx-field">
                    <input
                      type="number"
                      value={l.version}
                      onChange={(e) => setLine(i, { version: e.target.value })}
                    />
                  </div>
                </label>

                <label className="sa-f">
                  <span>{c.form.physical}</span>
                  <div className="bx-field">
                    <input
                      type="number"
                      min="0"
                      value={l.physical}
                      onChange={(e) => setLine(i, { physical: e.target.value })}
                    />
                  </div>
                </label>

                <div className="sa-f">
                  <span>{c.form.variance}</span>
                  <b className={`sa-var ${varCls(v)}`}>{varTxt(v)}</b>
                </div>

                <button
                  type="button"
                  className="bx-del"
                  onClick={() => setLines((p) => (p.length > 1 ? p.filter((_, k) => k !== i) : p))}
                  disabled={lines.length === 1}
                  aria-label="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          <button type="button" className="bx-link" onClick={() => setLines((p) => [...p, emptyLine()])}>
            <Plus size={14} />
            {c.form.add}
          </button>

          <div className="bx-actions sa-actions">
            <button type="button" className="bx-btn ghost" onClick={resetForm}>
              {c.form.clear}
            </button>
            <button type="submit" className="bx-btn lg" disabled={saving}>
              {saving ? c.form.submitting : c.form.submit}
            </button>
          </div>
        </form>
      )}

      {/* ===================== HISTORY ===================== */}
      {tab === "history" && (
        <section className="bx-card bx-hist">
          <div className="bx-card-h">
            <h3>{c.history.title}</h3>
          </div>
          <div className="bx-toolbar">
            <div className="bx-select">
              <select
                value={hBranch}
                onChange={(e) => {
                  setHBranch(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">{c.history.allBranches}</option>
                {branches.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} />
            </div>
            <button
              type="button"
              className="bx-link"
              onClick={() => {
                setHBranch("");
                setPage(1);
              }}
            >
              {c.history.reset}
            </button>
          </div>

          {hError && <p className="bx-alert">{hError}</p>}

          {!list ? (
            <p className="dash-loading">Loading...</p>
          ) : (
            <>
              <div className="pm-tbl-wrap">
                <table className="pm-tbl bx-htbl">
                  <thead>
                    <tr>
                      {c.history.columns.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {list.rows.length === 0 ? (
                      <tr>
                        <td colSpan={c.history.columns.length} className="pm-empty">
                          {c.history.empty}
                        </td>
                      </tr>
                    ) : (
                      list.rows.map((a) => {
                        const tv = totalVariance(a);
                        return (
                          <tr key={a.id}>
                            <td className="pm-bold">#{a.id}</td>
                            <td className="pm-muted">{fmtDate(a.createdAt)}</td>
                            <td>{branchName(a.branch)}</td>
                            <td>{a.reason || "-"}</td>
                            <td>{a.lines.length}</td>
                            <td className={`pm-bold ${varCls(tv)}`}>{varTxt(tv)}</td>
                            <td>
                              <div className="pm-actions">
                                <button type="button" aria-label="View" onClick={() => openDetail(a)}>
                                  <Eye size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pm-foot">
                <p className="pm-muted">
                  Showing <b>{from}</b> to <b>{to}</b> of <b>{list.total}</b> entries
                </p>
                <div className="pm-pager">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous">
                    <ChevronLeft size={15} />
                  </button>
                  {pageList(page, list.pages).map((n, i) =>
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
                  <button type="button" disabled={page >= list.pages} onClick={() => setPage((p) => p + 1)} aria-label="Next">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* ===================== DETAIL ===================== */}
      {detail && (
        <div className="pm-modal" onClick={() => setDetail(null)}>
          <div className="pm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="pm-modal-head">
              <h3>
                {c.detail.title}: #{detail.id}
              </h3>
              <button type="button" onClick={() => setDetail(null)} aria-label={c.detail.close}>
                <X size={18} />
              </button>
            </div>
            <p className="pm-muted pm-pad-s">
              {branchName(detail.branch)} | {fmtDate(detail.createdAt)} | {detail.reason || "-"}
            </p>

            <div className="pm-tbl-wrap">
              <table className="pm-tbl pm-tbl-sm">
                <thead>
                  <tr>
                    {c.detail.lineColumns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detail.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="pm-bold">#{l.batch}</td>
                      <td>{l.expected}</td>
                      <td>{l.version}</td>
                      <td>{l.physical}</td>
                      <td className={`pm-bold ${varCls(Number(l.variance))}`}>
                        {varTxt(Number(l.variance))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pm-modal-foot">
              <span />
              <button type="button" className="bx-btn ghost" onClick={() => setDetail(null)}>
                {c.detail.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAudits;