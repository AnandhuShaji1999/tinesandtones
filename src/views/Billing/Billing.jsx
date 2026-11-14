import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Eye,
  Minus,
  Plus,
  ScanLine,
  Search,
  ShoppingBag,
  Smartphone,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { BILLING_CONTENT } from "../../content/billingContent";
import {
  BILL_PAGE_SIZE,
  computeBill,
  fmtDate,
  inr,
  lineNet,
  round2,
} from "../../models/billingModel";
import {
  checkout,
  createCustomer,
  downloadSalePdf,
  enableGst,
  findInvoice,
  getSale,
  listCustomers,
  listSales,
  searchSellable,
} from "../../controllers/billingController";
import { listBranches } from "../../controllers/staffController";

const EMPTY_CUSTOMER = { name: "", phone: "", gstin: "", address: "" };
const emptyPayment = (amount = "") => ({ method: "cash", amount, reference: "" });

const METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "card", label: "Card", icon: CreditCard },
];

const makeKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const pageList = (page, pages) => {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push("...");
    out.push(n);
  });
  return out;
};

const tileColor = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) % 360;
  return { background: `hsl(${h} 70% 93%)`, color: `hsl(${h} 55% 32%)` };
};

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

const Billing = () => {
  const c = BILLING_CONTENT;
  const [tab, setTab] = useState("new");

  /* ---------- shared ---------- */
  const [branches, setBranches] = useState([]);
  const [branch, setBranch] = useState("");

  useEffect(() => {
    listBranches().then(setBranches);
  }, []);

  const hasBranches = branches.length > 0;

  /* ---------- items ---------- */
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [billDiscount, setBillDiscount] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Re-runs on every search change and whenever refreshKey changes (after a sale)
  useEffect(() => {
    const t = setTimeout(() => {
      searchSellable(q.trim()).then(setResults);
    }, 250);
    return () => clearTimeout(t);
  }, [q, refreshKey]);

  const addItem = (it) => {
    setCart((p) => {
      const i = p.findIndex((l) => l.variant === it.id);
      if (i >= 0) {
        return p.map((l, k) => (k === i ? { ...l, qty: Number(l.qty) + 1 } : l));
      }
      return [
        ...p,
        {
          variant: it.id,
          sku: it.sku,
          name: it.name,
          detail: it.detail,
          price: it.price,
          qty: 1,
          discount: "",
        },
      ];
    });
  };

  const handleSearchKey = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const term = q.trim().toLowerCase();
    const exact = results.find(
      (r) => r.sku.toLowerCase() === term || (r.barcode || "").toLowerCase() === term
    );
    const pick = exact || results[0];
    if (pick) {
      addItem(pick);
      setQ("");
    }
  };

  const setLine = (idx, patch) =>
    setCart((p) => p.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const removeLine = (idx) => setCart((p) => p.filter((_, i) => i !== idx));

  /* ---------- customer ---------- */
  const [mode, setMode] = useState("walkin");
  const [custSearch, setCustSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newCust, setNewCust] = useState(EMPTY_CUSTOMER);
  const [custSaving, setCustSaving] = useState(false);
  const [custError, setCustError] = useState("");

  useEffect(() => {
    if (mode !== "saved") return undefined;
    const t = setTimeout(() => {
      listCustomers(custSearch.trim())
        .then(setCustomers)
        .catch((err) => setCustError(err.message));
    }, 250);
    return () => clearTimeout(t);
  }, [mode, custSearch]);

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    setCustError("");
    setCustSaving(true);
    try {
      const created = await createCustomer(newCust);
      setCustomers((p) => [created, ...p]);
      setCustomer(created.id);
      setNewCust(EMPTY_CUSTOMER);
      setShowNew(false);
    } catch (err) {
      setCustError(err.message);
    } finally {
      setCustSaving(false);
    }
  };

  /* ---------- payments ---------- */
  const [payments, setPayments] = useState([emptyPayment()]);
  const bill = useMemo(() => computeBill(cart, billDiscount), [cart, billDiscount]);
  const paid = round2(payments.reduce((a, p) => a + (Number(p.amount) || 0), 0));
  const balance = round2(bill.total - paid);
  const settled = bill.total > 0 && Math.abs(balance) < 0.005;

  const setPayment = (idx, patch) =>
    setPayments((p) => p.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  const addPayment = () =>
    setPayments((p) => [...p, emptyPayment(balance > 0 ? String(balance) : "")]);
  const removePayment = (idx) =>
    setPayments((p) => (p.length > 1 ? p.filter((_, i) => i !== idx) : p));
  const fillBalance = (idx) => {
    const others = payments.reduce(
      (a, p, i) => (i === idx ? a : a + (Number(p.amount) || 0)),
      0
    );
    setPayment(idx, { amount: String(Math.max(0, round2(bill.total - others))) });
  };

  /* ---------- checkout ---------- */
  const keyRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  // Any change to the bill means a new request key
  useEffect(() => {
    keyRef.current = null;
  }, [branch, cart, billDiscount, payments, mode, customer]);

  const resetBill = () => {
    setCart([]);
    setBillDiscount("");
    setPayments([emptyPayment()]);
    setCustomer("");
    setCustSearch("");
    setMode("walkin");
    setShowNew(false);
    setNewCust(EMPTY_CUSTOMER);
    setQ("");
    setError("");
  };

  const handleCheckout = async () => {
    setError("");
    if (!branch) return setError("Select a branch.");
    if (!cart.length) return setError("Add at least one item.");
    if (mode === "saved" && !customer) return setError("Select a saved customer or use Walk-in.");
    if (!settled) return setError("Payments must equal the bill total exactly.");
    if (payments.some((p) => Number(p.amount) > 0 && p.method !== "cash" && !p.reference.trim())) {
      return setError("Enter the UPI / card reference for non-cash payments.");
    }

    if (!keyRef.current) keyRef.current = makeKey();
    setSaving(true);
    try {
      const sale = await checkout(
        {
          branch,
          customer: mode === "saved" ? customer : "",
          lines: cart,
          billDiscount,
          payments,
        },
        keyRef.current
      );
      // Refresh the page state, then show the big "Bill Completed" popup
      resetBill();
      keyRef.current = null;
      setRefreshKey((k) => k + 1);
      setReceipt(sale);
      loadSales();
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const closeReceipt = () => {
    setReceipt(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePdf = async (sale) => {
    try {
      await downloadSalePdf(sale.id, sale.invoiceNumber);
    } catch (err) {
      setError(err.message);
      setHError(err.message);
    }
  };

  /* ---------- history ---------- */
  const [hBranch, setHBranch] = useState("");
  const [page, setPage] = useState(1);
  const [sales, setSales] = useState(null);
  const [hError, setHError] = useState("");
  const [invoice, setInvoice] = useState("");
  const [detail, setDetail] = useState(null);

  const loadSales = useCallback(async () => {
    try {
      setHError("");
      setSales(await listSales({ branch: hBranch, page }));
    } catch (err) {
      setHError(err.message);
      setSales({ rows: [], total: 0, page: 1, pages: 1 });
    }
  }, [hBranch, page]);

  useEffect(() => {
    if (tab === "history") loadSales();
  }, [tab, loadSales]);

  const openDetail = async (row) => {
    try {
      setDetail(await getSale(row.id));
    } catch (err) {
      setHError(err.message);
    }
  };

  const handleFind = async (e) => {
    e.preventDefault();
    if (!invoice.trim()) return;
    try {
      setHError("");
      setDetail(await findInvoice(invoice));
    } catch (err) {
      setHError(err.message);
    }
  };

  const branchName = (s) =>
    s.branchName || branches.find((b) => b.value === s.branchId)?.label || s.branchId || "-";

  const from = sales && sales.rows.length ? (page - 1) * BILL_PAGE_SIZE + 1 : 0;
  const to = from ? from + sales.rows.length - 1 : 0;

  /* ---------- GST ---------- */
  const [gst, setGst] = useState({ gstin: "" });
  const [gstSaving, setGstSaving] = useState(false);
  const [gstMsg, setGstMsg] = useState({ ok: false, text: "" });

  const handleGst = async (e) => {
    e.preventDefault();
    if (!branch) return setGstMsg({ ok: false, text: "Select a branch first." });
    setGstSaving(true);
    setGstMsg({ ok: false, text: "" });
    try {
      await enableGst(branch, gst);
      setGstMsg({ ok: true, text: c.gst.done });
    } catch (err) {
      setGstMsg({ ok: false, text: err.message });
    } finally {
      setGstSaving(false);
    }
  };

  const canPay = !saving && settled && cart.length > 0;

  return (
    <div className="bx-page">
      {/* ============ Header ============ */}
      <div className="bx-top">
        <div className="bx-top-l">
          <h2 className="bx-title">{c.title}</h2>
          <div className="bx-tabs">
            {["new", "history"].map((t) => (
              <button
                key={t}
                type="button"
                className={tab === t ? "on" : ""}
                onClick={() => setTab(t)}
              >
                {c.tabs[t]}
              </button>
            ))}
          </div>
        </div>

        {tab === "new" && (
          <div className="bx-branch">
            <span>{hasBranches ? c.branch.label : c.branch.id}</span>
            {hasBranches ? (
              <div className="bx-select">
                <select value={branch} onChange={(e) => setBranch(e.target.value)}>
                  <option value="">{c.branch.placeholder}</option>
                  {branches.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} />
              </div>
            ) : (
              <input
                className="bx-branch-input"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. 1"
              />
            )}
          </div>
        )}
      </div>

      {/* ===================== NEW BILL ===================== */}
      {tab === "new" && (
        <>
          {error && <p className="bx-alert">{error}</p>}

          <div className="bx-grid">
            {/* -------- left -------- */}
            <div className="bx-left">
              <section className="bx-card">
                <div className="bx-search">
                  <Search size={18} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={handleSearchKey}
                    placeholder={c.items.search}
                    disabled={!branch}
                  />
                  <ScanLine size={18} className="bx-scan" />
                </div>

                {!branch ? (
                  <div className="bx-empty">
                    <ShoppingBag size={30} />
                    <p>{c.items.noBranch}</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="bx-empty">
                    <ShoppingBag size={30} />
                    <p>{c.items.empty}</p>
                  </div>
                ) : (
                  <div className="bx-tiles">
                    {results.map((r) => (
                      <button
                        type="button"
                        key={r.id}
                        className="bx-tile"
                        onClick={() => addItem(r)}
                      >
                        <span className="bx-av" style={tileColor(r.name)}>
                          {initials(r.name)}
                        </span>
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
              </section>

              <section className="bx-card">
                <div className="bx-card-h">
                  <h3>{c.cart.title}</h3>
                  <span className="bx-count">
                    {bill.units} item{bill.units === 1 ? "" : "s"}
                  </span>
                </div>

                {cart.length === 0 ? (
                  <div className="bx-empty">
                    <ShoppingBag size={30} />
                    <p>{c.cart.empty}</p>
                  </div>
                ) : (
                  <ul className="bx-cart">
                    {cart.map((l, i) => (
                      <li key={l.variant} className="bx-line">
                        <span className="bx-av sm" style={tileColor(l.name)}>
                          {initials(l.name)}
                        </span>

                        <div className="bx-line-info">
                          <b>{l.name}</b>
                          <small>
                            {l.sku}
                            {l.detail ? ` · ${l.detail}` : ""} &middot; {inr(l.price)}
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
                          <span>Disc ₹</span>
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
                          onClick={() => removeLine(i)}
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

            {/* -------- right -------- */}
            <aside className="bx-right">
              <section className="bx-card">
                <div className="bx-card-h">
                  <h3>{c.customer.title}</h3>
                </div>
                <div className="bx-seg">
                  {["walkin", "saved"].map((m) => (
                    <button
                      type="button"
                      key={m}
                      className={mode === m ? "on" : ""}
                      onClick={() => setMode(m)}
                    >
                      {c.customer[m]}
                    </button>
                  ))}
                </div>

                {mode === "walkin" ? (
                  <p className="bx-hint">{c.customer.note}</p>
                ) : (
                  <>
                    <div className="bx-field">
                      <Search size={15} />
                      <input
                        value={custSearch}
                        onChange={(e) => setCustSearch(e.target.value)}
                        placeholder={c.customer.search}
                      />
                    </div>
                    <div className="bx-field">
                      <select value={customer} onChange={(e) => setCustomer(e.target.value)}>
                        <option value="">{c.customer.select}</option>
                        {customers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                            {u.phone ? ` - ${u.phone}` : ""}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={15} />
                    </div>

                    <button
                      type="button"
                      className="bx-link"
                      onClick={() => setShowNew((s) => !s)}
                    >
                      <UserPlus size={14} />
                      {c.customer.add}
                    </button>

                    {showNew && (
                      <form className="bx-newcust" onSubmit={handleSaveCustomer}>
                        {["name", "phone", "gstin", "address"].map((k) => (
                          <label key={k}>
                            <span>{c.customer[k]}</span>
                            <input
                              value={newCust[k]}
                              onChange={(e) =>
                                setNewCust((p) => ({ ...p, [k]: e.target.value }))
                              }
                              required={k === "name"}
                            />
                          </label>
                        ))}
                        <div className="bx-newcust-b">
                          <button
                            type="button"
                            className="bx-btn ghost"
                            onClick={() => setShowNew(false)}
                          >
                            {c.customer.cancel}
                          </button>
                          <button type="submit" className="bx-btn" disabled={custSaving}>
                            {custSaving ? c.customer.saving : c.customer.save}
                          </button>
                        </div>
                      </form>
                    )}
                    {custError && <p className="bx-alert sm">{custError}</p>}
                  </>
                )}
              </section>

              <section className="bx-card bx-sum">
                <div className="bx-row">
                  <span>{c.summary.subtotal}</span>
                  <b>{inr(bill.subtotal)}</b>
                </div>
                <div className="bx-row">
                  <span>{c.summary.lineDiscounts}</span>
                  <b className="neg">- {inr(bill.lineDiscounts)}</b>
                </div>
                <label className="bx-row bx-bd">
                  <span>{c.summary.billDiscount}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={billDiscount}
                    onChange={(e) => setBillDiscount(e.target.value)}
                    placeholder="0.00"
                  />
                </label>

                <div className="bx-total">
                  <span>{c.summary.total}</span>
                  <strong>{inr(bill.total)}</strong>
                  <small>{c.summary.gstNote}</small>
                </div>
              </section>

              <section className="bx-card">
                <div className="bx-card-h">
                  <h3>{c.payments.title}</h3>
                  <span className={`bx-chip ${settled ? "ok" : balance < 0 ? "bad" : "due"}`}>
                    {settled
                      ? c.payments.settled
                      : balance < 0
                      ? `${c.payments.over} ${inr(Math.abs(balance))}`
                      : `${c.payments.due} ${inr(Math.abs(balance))}`}
                  </span>
                </div>

                {payments.map((p, i) => (
                  <div className="bx-pay" key={i}>
                    <div className="bx-methods">
                      {METHODS.map(({ value, label, icon: Icon }) => (
                        <button
                          type="button"
                          key={value}
                          className={p.method === value ? "on" : ""}
                          onClick={() => setPayment(i, { method: value })}
                        >
                          <Icon size={15} />
                          {label}
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
                          placeholder="0.00"
                        />
                      </div>
                      <button type="button" className="bx-btn ghost" onClick={() => fillBalance(i)}>
                        {c.payments.fill}
                      </button>
                      {payments.length > 1 && (
                        <button
                          type="button"
                          className="bx-del"
                          onClick={() => removePayment(i)}
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

                <button type="button" className="bx-link" onClick={addPayment}>
                  <Plus size={14} />
                  {c.payments.add}
                </button>

                <div className="bx-row bx-paid">
                  <span>{c.payments.paid}</span>
                  <b>{inr(paid)}</b>
                </div>

                <div className="bx-actions">
                  <button type="button" className="bx-btn ghost" onClick={resetBill}>
                    {c.clear}
                  </button>
                  <button
                    type="button"
                    className="bx-btn lg"
                    onClick={handleCheckout}
                    disabled={!canPay}
                  >
                    {saving ? c.paying : `${c.pay} · ${inr(bill.total)}`}
                  </button>
                </div>
              </section>

              <details className="bx-card bx-gst">
                <summary>{c.gst.title}</summary>
                <form onSubmit={handleGst}>
                  <p className="bx-hint">{c.gst.note}</p>
                  <label className="bx-gst-f">
                    <span>{c.gst.gstin}</span>
                    <input
                      value={gst.gstin}
                      onChange={(e) => setGst({ gstin: e.target.value })}
                      required
                    />
                  </label>
                  <button type="submit" className="bx-btn ghost" disabled={gstSaving}>
                    {gstSaving ? c.gst.saving : c.gst.enable}
                  </button>
                  {gstMsg.text && (
                    <p className={gstMsg.ok ? "bx-okmsg" : "bx-alert sm"}>{gstMsg.text}</p>
                  )}
                </form>
              </details>
            </aside>
          </div>

          {/* Mobile pay bar */}
          <div className="bx-mbar">
            <div>
              <small>{c.summary.total}</small>
              <b>{inr(bill.total)}</b>
            </div>
            <button type="button" className="bx-btn lg" onClick={handleCheckout} disabled={!canPay}>
              {saving ? c.paying : c.pay}
            </button>
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

            <form className="bx-find" onSubmit={handleFind}>
              <div className="bx-field">
                <Search size={15} />
                <input
                  value={invoice}
                  onChange={(e) => setInvoice(e.target.value)}
                  placeholder={c.history.lookup}
                />
              </div>
              <button type="submit" className="bx-btn">
                {c.history.find}
              </button>
            </form>

            <button
              type="button"
              className="bx-link"
              onClick={() => {
                setHBranch("");
                setInvoice("");
                setPage(1);
              }}
            >
              {c.history.reset}
            </button>
          </div>

          {hError && <p className="bx-alert">{hError}</p>}

          {!sales ? (
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
                    {sales.rows.length === 0 ? (
                      <tr>
                        <td colSpan={c.history.columns.length} className="pm-empty">
                          {c.history.empty}
                        </td>
                      </tr>
                    ) : (
                      sales.rows.map((s) => (
                        <tr key={s.id}>
                          <td className="pm-bold">{s.invoiceNumber}</td>
                          <td className="pm-muted">{fmtDate(s.date)}</td>
                          <td>{s.customerName}</td>
                          <td>{branchName(s)}</td>
                          <td className="pm-bold">{inr(s.total)}</td>
                          <td>
                            <div className="pm-actions">
                              <button type="button" aria-label="View" onClick={() => openDetail(s)}>
                                <Eye size={16} />
                              </button>
                              <button type="button" aria-label="PDF" onClick={() => handlePdf(s)}>
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
                  Showing <b>{from}</b> to <b>{to}</b> of <b>{sales.total}</b> entries
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
                  {pageList(page, sales.pages).map((n, i) =>
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
                    disabled={page >= sales.pages}
                    onClick={() => setPage((p) => p + 1)}
                    aria-label="Next"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* ===================== DETAIL POPUP ===================== */}
      {detail && (
        <div className="pm-modal" onClick={() => setDetail(null)}>
          <div className="pm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="pm-modal-head">
              <h3>
                {c.detail.title}: {detail.invoiceNumber}
              </h3>
              <button type="button" onClick={() => setDetail(null)} aria-label={c.detail.close}>
                <X size={18} />
              </button>
            </div>

            <p className="pm-muted pm-pad-s">
              {detail.customerName} | {branchName(detail)} | {fmtDate(detail.date)}
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
                  {detail.lines.map((l, i) => (
                    <tr key={l.id || i}>
                      <td className="pm-bold">
                        {l.name || l.sku}
                        {l.name && l.sku ? <small className="pm-muted"> {l.sku}</small> : null}
                      </td>
                      <td>{l.quantity}</td>
                      <td>{inr(l.unitPrice)}</td>
                      <td>{l.discount === "" ? "-" : inr(l.discount)}</td>
                      <td>{inr(l.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {detail.payments.length > 0 && (
              <div className="bx-dpay">
                <b>{c.detail.payments}</b>
                {detail.payments.map((p, i) => (
                  <div className="bx-row" key={i}>
                    <span>
                      {p.method.toUpperCase()}
                      {p.reference ? ` (${p.reference})` : ""}
                    </span>
                    <b>{inr(p.amount)}</b>
                  </div>
                ))}
              </div>
            )}

            <div className="bx-row">
              <span>{c.detail.discount}</span>
              <b>{detail.billDiscount === "" ? "-" : inr(detail.billDiscount)}</b>
            </div>
            <div className="bx-total">
              <span>TOTAL</span>
              <strong>{inr(detail.total)}</strong>
            </div>

            <div className="pm-modal-foot">
              <button type="button" className="bx-btn ghost" onClick={() => setDetail(null)}>
                {c.detail.close}
              </button>
              <button type="button" className="bx-btn" onClick={() => handlePdf(detail)}>
                <Download size={14} />
                {c.history.pdf}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== BILL COMPLETED POPUP ===================== */}
      {receipt && (
        <div className="bx-done-wrap" onClick={closeReceipt}>
          <div className="bx-done" onClick={(e) => e.stopPropagation()}>
            <span className="bx-done-ic">
              <CheckCircle2 size={72} />
            </span>
            <h2>{c.receipt.title}</h2>
            <p className="bx-done-l">Bill Number</p>
            <div className="bx-done-no">{receipt.invoiceNumber || "-"}</div>
            <p className="bx-done-t">
              {c.receipt.total} <b>{inr(receipt.total)}</b>
            </p>
            <div className="bx-done-b">
              <button type="button" className="bx-btn ghost" onClick={() => handlePdf(receipt)}>
                <Download size={15} />
                {c.receipt.pdf}
              </button>
              <button type="button" className="bx-btn lg" onClick={closeReceipt} autoFocus>
                {c.receipt.newBill}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;