import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Minus,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { EXCHANGE_CONTENT } from "../../content/exchangeContent";
import {
  EX_METHODS,
  EX_PAGE_SIZE,
  estimateExchange,
  pageList,
  returnLinesFromSale,
} from "../../models/exchangeModel";
import { fmtDate, inr, lineNet } from "../../models/billingModel";
import {
  downloadExchangePdf,
  getExchange,
  listExchanges,
  submitExchange,
} from "../../controllers/exchangeController";
import { findInvoice, searchSellable } from "../../controllers/billingController";
import { listBranches } from "../../controllers/staffController";

const emptyPayment = () => ({ method: "cash", amount: "", reference: "" });

const makeKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const Exchanges = () => {
  const c = EXCHANGE_CONTENT;
  const [tab, setTab] = useState("new");
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    listBranches().then(setBranches);
  }, []);

  /* ---------- original bill ---------- */
  const [invoice, setInvoice] = useState("");
  const [finding, setFinding] = useState(false);
  const [original, setOriginal] = useState(null);
  const [returned, setReturned] = useState([]);

  const handleFind = async (e) => {
    e.preventDefault();
    if (!invoice.trim()) return;
    setError("");
    setFinding(true);
    try {
      const sale = await findInvoice(invoice);
      setOriginal(sale);
      setReturned(returnLinesFromSale(sale));
    } catch (err) {
      setOriginal(null);
      setReturned([]);
      setError(err.message);
    } finally {
      setFinding(false);
    }
  };

  const setReturnQty = (idx, value) =>
    setReturned((p) =>
      p.map((r, i) =>
        i === idx ? { ...r, qty: value === "" ? "" : String(Math.min(r.max, Math.max(0, Number(value)))) } : r
      )
    );

  /* ---------- replacement items ---------- */
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => searchSellable(q.trim()).then(setResults), 250);
    return () => clearTimeout(t);
  }, [q]);

  const addItem = (it) =>
    setCart((p) => {
      const i = p.findIndex((l) => l.variant === it.id);
      if (i >= 0) return p.map((l, k) => (k === i ? { ...l, qty: Number(l.qty) + 1 } : l));
      return [
        ...p,
        { variant: it.id, sku: it.sku, name: it.name, price: it.price, qty: 1, discount: "" },
      ];
    });

  const handleSearchKey = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const term = q.trim().toLowerCase();
    const pick =
      results.find(
        (r) => r.sku.toLowerCase() === term || (r.barcode || "").toLowerCase() === term
      ) || results[0];
    if (pick) {
      addItem(pick);
      setQ("");
    }
  };

  const setLine = (idx, patch) =>
    setCart((p) => p.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  /* ---------- payments ---------- */
  const [payments, setPayments] = useState([emptyPayment()]);
  const setPayment = (idx, patch) =>
    setPayments((p) => p.map((x, i) => (i === idx ? { ...x, ...patch } : x)));

  const est = useMemo(() => estimateExchange(returned, cart), [returned, cart]);

  /* ---------- submit ---------- */
  const keyRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    keyRef.current = null;
  }, [original, returned, cart, payments]);

  const resetForm = () => {
    setInvoice("");
    setOriginal(null);
    setReturned([]);
    setCart([]);
    setPayments([emptyPayment()]);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    if (!original) return setError("Find the original bill first.");
    if (!returned.some((r) => Number(r.qty) > 0)) return setError("Enter a return quantity for at least one item.");
    if (!cart.length) return setError("Add at least one replacement item.");
    if (
      payments.some(
        (p) => Number(p.amount) > 0 && p.method !== "cash" && !p.reference.trim()
      )
    ) {
      return setError("Enter the reference (or store credit code) for non-cash payments.");
    }

    if (!keyRef.current) keyRef.current = makeKey();
    setSaving(true);
    try {
      const ex = await submitExchange(
        { originalSale: original.id, returned, replacements: cart, payments },
        keyRef.current
      );
      setReceipt(ex);
      resetForm();
      keyRef.current = null;
      window.scrollTo({ top: 0, behavior: "smooth" });
      loadHistory();
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const handlePdf = async (ex) => {
    try {
      await downloadExchangePdf(ex.id, ex.documentNumber);
    } catch (err) {
      setError(err.message);
      setHError(err.message);
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
      setList(await listExchanges({ branch: hBranch, page }));
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
      setDetail(await getExchange(row.id));
    } catch (err) {
      setHError(err.message);
    }
  };

  const from = list && list.rows.length ? (page - 1) * EX_PAGE_SIZE + 1 : 0;
  const to = from ? from + list.rows.length - 1 : 0;

  const estLabel =
    est.diff > 0 ? c.summary.topUp : est.diff < 0 ? c.summary.storeCredit : c.summary.even;

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
        <>
          {receipt && (
            <div className="bx-receipt">
              <CheckCircle2 size={28} />
              <div className="bx-receipt-t">
                <h3>{c.receipt.title}</h3>
                <p>
                  {c.receipt.document} <b>{receipt.documentNumber || "-"}</b>
                  {Number(receipt.topUp) > 0 && (
                    <>
                      {" "}
                      &middot; {c.receipt.topUp} <b>{inr(receipt.topUp)}</b>
                    </>
                  )}
                  {receipt.creditCode && (
                    <>
                      {" "}
                      &middot; {c.receipt.credit} <b>{inr(receipt.creditRemaining)}</b> &middot;{" "}
                      {c.receipt.code} <b>{receipt.creditCode}</b>
                    </>
                  )}
                </p>
              </div>
              <div className="bx-receipt-b">
                <button type="button" className="bx-btn ghost" onClick={() => handlePdf(receipt)}>
                  <Download size={14} />
                  {c.receipt.pdf}
                </button>
                <button type="button" className="bx-btn" onClick={() => setReceipt(null)}>
                  {c.receipt.again}
                </button>
              </div>
            </div>
          )}

          <p className="ex-rule">{c.rule}</p>
          {error && <p className="bx-alert">{error}</p>}

          <div className="bx-grid">
            <div className="bx-left">
              {/* original bill */}
              <section className="bx-card">
                <div className="bx-card-h">
                  <h3>{c.original.title}</h3>
                </div>
                <form className="bx-find ex-find" onSubmit={handleFind}>
                  <div className="bx-field">
                    <Search size={15} />
                    <input
                      value={invoice}
                      onChange={(e) => setInvoice(e.target.value)}
                      placeholder={c.original.placeholder}
                    />
                  </div>
                  <button type="submit" className="bx-btn" disabled={finding}>
                    {finding ? c.original.finding : c.original.find}
                  </button>
                </form>

                {original ? (
                  <>
                    <p className="bx-hint ex-meta">
                      {original.invoiceNumber} &middot; {original.customerName} &middot;{" "}
                      {fmtDate(original.date)} &middot; {inr(original.total)}
                    </p>
                    <div className="pm-tbl-wrap">
                      <table className="pm-tbl ex-tbl">
                        <thead>
                          <tr>
                            {c.original.columns.map((col) => (
                              <th key={col}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {returned.map((r, i) => (
                            <tr key={r.saleLine}>
                              <td>
                                <div className="pm-bold">{r.name}</div>
                                <small className="pm-muted">{r.sku}</small>
                              </td>
                              <td>{r.max}</td>
                              <td>{inr(r.unit)}</td>
                              <td>
                                <input
                                  className="bl-mini"
                                  type="number"
                                  min="0"
                                  max={r.max}
                                  value={r.qty}
                                  onChange={(e) => setReturnQty(i, e.target.value)}
                                  placeholder="0"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="bx-empty">
                    <p>{c.original.empty}</p>
                  </div>
                )}
              </section>

              {/* replacement */}
              <section className="bx-card">
                <div className="bx-card-h">
                  <h3>{c.replacement.title}</h3>
                </div>
                <div className="bx-search">
                  <Search size={18} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={handleSearchKey}
                    placeholder={c.replacement.search}
                  />
                </div>

                {results.length === 0 ? (
                  <div className="bx-empty">
                    <p>{c.replacement.empty}</p>
                  </div>
                ) : (
                  <div className="bx-tiles">
                    {results.map((r) => (
                      <button type="button" key={r.id} className="bx-tile" onClick={() => addItem(r)}>
                        <span className="bx-tile-t">
                          <b>{r.name}</b>
                          <small>
                            {r.sku}
                            {r.detail ? ` · ${r.detail}` : ""}
                          </small>
                        </span>
                        <span className="bx-tile-p">
                          {inr(r.price)}
                          <i>
                            <Plus size={14} />
                          </i>
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <h4 className="ex-sub">{c.replacement.cart}</h4>
                {cart.length === 0 ? (
                  <div className="bx-empty">
                    <p>{c.replacement.cartEmpty}</p>
                  </div>
                ) : (
                  <ul className="bx-cart">
                    {cart.map((l, i) => (
                      <li key={l.variant} className="bx-line ex-line">
                        <div className="bx-line-info">
                          <b>{l.name}</b>
                          <small>
                            {l.sku} &middot; {inr(l.price)}
                          </small>
                        </div>
                        <div className="bx-stepper">
                          <button
                            type="button"
                            onClick={() => setLine(i, { qty: Math.max(1, Number(l.qty) - 1) })}
                            aria-label="Decrease"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={l.qty}
                            onChange={(e) => setLine(i, { qty: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setLine(i, { qty: Number(l.qty) + 1 })}
                            aria-label="Increase"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <label className="bx-disc">
                          <span>{c.replacement.discount}</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={l.discount}
                            onChange={(e) => setLine(i, { discount: e.target.value })}
                            placeholder="0"
                          />
                        </label>
                        <b className="bx-line-total">{inr(lineNet(l))}</b>
                        <button
                          type="button"
                          className="bx-del"
                          onClick={() => setCart((p) => p.filter((_, k) => k !== i))}
                          aria-label="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {/* right */}
            <aside className="bx-right">
              <section className="bx-card bx-sum">
                <div className="bx-card-h">
                  <h3>{c.summary.title}</h3>
                </div>
                <div className="bx-row">
                  <span>{c.summary.credit}</span>
                  <b>{inr(est.credit)}</b>
                </div>
                <div className="bx-row">
                  <span>{c.summary.replacement}</span>
                  <b>{inr(est.replacement)}</b>
                </div>
                <div className="bx-total">
                  <span>{estLabel}</span>
                  <strong>{inr(Math.abs(est.diff))}</strong>
                  <small>{c.summary.note}</small>
                </div>
              </section>

              <section className="bx-card">
                <div className="bx-card-h">
                  <h3>{c.payments.title}</h3>
                </div>
                <p className="bx-hint">{c.payments.hint}</p>

                {payments.map((p, i) => (
                  <div className="bx-pay" key={i}>
                    <div className="bx-methods ex-m4">
                      {EX_METHODS.map((m) => (
                        <button
                          type="button"
                          key={m.value}
                          className={p.method === m.value ? "on" : ""}
                          onClick={() => setPayment(i, { method: m.value })}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                    <div className="bx-pay-row">
                      <div className="bx-money">
                        <span>₹</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={p.amount}
                          onChange={(e) => setPayment(i, { amount: e.target.value })}
                          placeholder={c.payments.amount}
                        />
                      </div>
                      {payments.length > 1 && (
                        <button
                          type="button"
                          className="bx-del"
                          onClick={() => setPayments((x) => x.filter((_, k) => k !== i))}
                          aria-label="Remove payment"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    {p.method !== "cash" && (
                      <div className="bx-field">
                        <input
                          value={p.reference}
                          onChange={(e) => setPayment(i, { reference: e.target.value })}
                          placeholder={c.payments.reference}
                        />
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className="bx-link"
                  onClick={() => setPayments((p) => [...p, emptyPayment()])}
                >
                  <Plus size={14} />
                  {c.payments.add}
                </button>

                <div className="bx-actions">
                  <button type="button" className="bx-btn ghost" onClick={resetForm}>
                    {c.clear}
                  </button>
                  <button
                    type="button"
                    className="bx-btn lg"
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? c.submitting : c.submit}
                  </button>
                </div>
              </section>
            </aside>
          </div>
        </>
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
                      list.rows.map((x) => (
                        <tr key={x.id}>
                          <td className="pm-bold">{x.documentNumber}</td>
                          <td className="pm-muted">{fmtDate(x.createdAt)}</td>
                          <td>#{x.originalSale}</td>
                          <td>{inr(x.creditTotal)}</td>
                          <td>{inr(x.creditUsed)}</td>
                          <td className="pm-bold">{inr(x.topUp)}</td>
                          <td>
                            <div className="pm-actions">
                              <button type="button" aria-label="View" onClick={() => openDetail(x)}>
                                <Eye size={16} />
                              </button>
                              <button type="button" aria-label="PDF" onClick={() => handlePdf(x)}>
                                <Download size={16} />
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
                {c.detail.title}: {detail.documentNumber}
              </h3>
              <button type="button" onClick={() => setDetail(null)} aria-label={c.detail.close}>
                <X size={18} />
              </button>
            </div>
            <p className="pm-muted pm-pad-s">
              Original sale #{detail.originalSale} | Replacement sale #{detail.replacementSale} |{" "}
              {fmtDate(detail.createdAt)}
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
                  {detail.returnedLines.map((l) => (
                    <tr key={l.id}>
                      <td>#{l.originalLine}</td>
                      <td>{l.quantity}</td>
                      <td>{inr(l.creditAmount)}</td>
                      <td>{inr(l.taxable)}</td>
                      <td>{inr(l.cgst)}</td>
                      <td>{inr(l.sgst)}</td>
                      <td>{inr(l.igst)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bx-row">
              <span>Credit total</span>
              <b>{inr(detail.creditTotal)}</b>
            </div>
            <div className="bx-row">
              <span>Credit used</span>
              <b>{inr(detail.creditUsed)}</b>
            </div>
            <div className="bx-row">
              <span>Top-up</span>
              <b>{inr(detail.topUp)}</b>
            </div>
            {detail.creditCode && (
              <div className="bx-total">
                <span>STORE CREDIT CODE</span>
                <strong className="ex-code">{detail.creditCode}</strong>
                <small>Remaining {inr(detail.creditRemaining)}</small>
              </div>
            )}

            <div className="pm-modal-foot">
              <button type="button" className="bx-btn ghost" onClick={() => setDetail(null)}>
                {c.detail.close}
              </button>
              <button type="button" className="bx-btn" onClick={() => handlePdf(detail)}>
                <Download size={14} />
                PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exchanges;