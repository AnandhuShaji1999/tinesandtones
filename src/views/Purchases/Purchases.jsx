import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  History,
  Pencil,
  Plus,
  Printer,
  ReceiptText,
  RotateCcw,
  Search,
  Layers,
  Package,
  Wallet,
  X,
} from "lucide-react";
import { PURCHASES_CONTENT } from "../../content/purchaseApiContent";
import { formatINR } from "../../models/purchaseModel";
import { PAGE_SIZE } from "../../models/categoryModel";
import {
  listPurchases,
  getPurchase,
  listRevisions,
} from "../../controllers/purchaseController";
import { listSupplierOptions } from "../../controllers/supplierController";
import { listVariantOptions } from "../../controllers/variantController";
import { listBranches } from "../../controllers/staffController";
import { ROUTES, editPurchasePath } from "../../constants/routes";

const EMPTY = { supplier: "", branch: "", bill: "", from: "", to: "" };

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

const Purchases = () => {
  const c = PURCHASES_CONTENT;
  const navigate = useNavigate();

  const [draft, setDraft] = useState(EMPTY);
  const [applied, setApplied] = useState(EMPTY);
  const [page, setPage] = useState(1);
  const [list, setList] = useState(null);
  const [listError, setListError] = useState("");

  const [branches, setBranches] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [variants, setVariants] = useState([]);

  const [detail, setDetail] = useState(null);
  const [revisions, setRevisions] = useState(null);
  const [revLoading, setRevLoading] = useState(false);

  useEffect(() => {
    listBranches().then(setBranches);
    listSupplierOptions().then(setSuppliers);
    listVariantOptions().then(setVariants);
  }, []);

  const load = useCallback(async () => {
    try {
      setListError("");
      setList(await listPurchases({ branch: applied.branch, page }));
    } catch (err) {
      setListError(err.message);
      setList({ rows: [], total: 0, page: 1, pages: 1 });
    }
  }, [applied.branch, page]);

  useEffect(() => {
    load();
  }, [load]);

  const branchLabel = (p) =>
    p.branchName || branches.find((b) => b.value === p.branchId)?.label || p.branchId || "-";
  const supplierLabel = (p) =>
    p.supplierName || suppliers.find((s) => s.value === p.supplierId)?.label || "-";
  const variantLabel = (id, fallback) =>
    variants.find((o) => o.value === id)?.label || fallback || id || "-";

  // Branch is filtered by the server, the rest on the loaded page
  const rows = useMemo(() => {
    if (!list) return [];
    const s = applied.supplier.trim().toLowerCase();
    const b = applied.bill.trim().toLowerCase();
    return list.rows.filter(
      (p) =>
        (!s || supplierLabel(p).toLowerCase().includes(s)) &&
        (!b || p.billNumber.toLowerCase().includes(b)) &&
        (!applied.from || p.billDate >= applied.from) &&
        (!applied.to || p.billDate <= applied.to)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, applied, suppliers]);

  const sumPayable = rows.reduce((a, p) => a + (Number(p.total) || 0), 0);
  const sumUnits = rows.reduce(
    (a, p) => a + p.lines.reduce((x, l) => x + (Number(l.quantity) || 0), 0),
    0
  );

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
    setRevisions(null);
    try {
      setDetail(await getPurchase(row.id));
    } catch (err) {
      setListError(err.message);
    }
  };

  const loadRevisions = async () => {
    setRevLoading(true);
    try {
      setRevisions(await listRevisions(detail.id));
    } catch (err) {
      setListError(err.message);
    } finally {
      setRevLoading(false);
    }
  };

  const handleExport = () => {
    const head = ["Bill No", "Branch", "Supplier", "Date", "Products", "Items", "Total"];
    const body = rows.map((p) => [
      p.billNumber,
      branchLabel(p),
      supplierLabel(p),
      p.billDate,
      new Set(p.lines.map((l) => l.variant)).size,
      p.lines.reduce((x, l) => x + (Number(l.quantity) || 0), 0),
      p.total,
    ]);
    const csv = [head, ...body]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "purchases.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const from = list && rows.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = from ? from + rows.length - 1 : 0;

  return (
    <div className="pm-page">
      <div className="pm-head">
        <div>
          <p className="pm-crumb">
            {c.crumbs[0]} &gt; <b>{c.crumbs[1]}</b>
          </p>
          <h2 className="pm-title">{c.title}</h2>
        </div>
        <button
          type="button"
          className="pm-primary"
          onClick={() => navigate(ROUTES.ADD_PURCHASE)}
        >
          <Plus size={15} />
          {c.addNew}
        </button>
      </div>

      <div className="pm-tabs">
        <button type="button" className="pm-tab active">
          <ReceiptText size={16} />
          {c.tabs.history}
        </button>
        <button type="button" className="pm-tab" disabled title="No API yet">
          <History size={16} />
          {c.tabs.returns}
        </button>
      </div>

      {/* ============ Filters ============ */}
      <form className="pm-card pm-filters" onSubmit={handleSearch}>
        <div className="pm-filters-head">
          <span>
            <Filter size={14} />
            {c.filters.title}
          </span>
          <span className="pm-muted">
            {list ? list.total : 0} Total Records
          </span>
        </div>

        <div className="pm-fgrid">
          <div className="pm-f">
            <label>{c.filters.supplier}</label>
            <div className="pm-input">
              <Search size={15} />
              <input
                name="supplier"
                value={draft.supplier}
                onChange={handleDraft}
                placeholder={c.filters.supplierPh}
              />
            </div>
          </div>

          <div className="pm-f">
            <label>{c.filters.branch}</label>
            <div className="pm-input">
              <select name="branch" value={draft.branch} onChange={handleDraft}>
                <option value="">{c.filters.allBranches}</option>
                {branches.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} />
            </div>
          </div>

          <div className="pm-f">
            <label>{c.filters.billNo}</label>
            <div className="pm-input">
              <span className="pm-hash">#</span>
              <input
                name="bill"
                value={draft.bill}
                onChange={handleDraft}
                placeholder={c.filters.billPh}
              />
            </div>
          </div>

          <div className="pm-f">
            <label>{c.filters.from}</label>
            <div className="pm-input">
              <input type="date" name="from" value={draft.from} onChange={handleDraft} />
              <Calendar size={15} />
            </div>
          </div>

          <div className="pm-f">
            <label>{c.filters.to}</label>
            <div className="pm-input">
              <input type="date" name="to" value={draft.to} onChange={handleDraft} />
              <Calendar size={15} />
            </div>
          </div>
        </div>

        <div className="pm-factions">
          <button type="button" className="pm-link" onClick={handleReset}>
            <RotateCcw size={14} />
            {c.filters.reset}
          </button>
          <button type="submit" className="pm-primary">
            <Search size={15} />
            {c.filters.search}
          </button>
        </div>
      </form>

      {/* ============ Stats ============ */}
      <div className="pm-stats">
        <div className="pm-card pm-stat">
          <div className="pm-stat-top">
            <span>{c.stats.bills}</span>
            <i className="pm-ico blue">
              <ReceiptText size={16} />
            </i>
          </div>
          <p className="pm-stat-val">{list ? list.total : "-"}</p>
          <p className="pm-muted">{c.stats.billsNote}</p>
        </div>

        <div className="pm-card pm-stat">
          <div className="pm-stat-top">
            <span>{c.stats.payable}</span>
            <i className="pm-ico indigo">
              <Wallet size={16} />
            </i>
          </div>
          <p className="pm-stat-val">{formatINR(sumPayable)}</p>
          <p className="pm-muted">{c.stats.payableNote}</p>
        </div>

        <div className="pm-card pm-stat">
          <div className="pm-stat-top">
            <span>{c.stats.items}</span>
            <i className="pm-ico green">
              <Package size={16} />
            </i>
          </div>
          <p className="pm-stat-val">{sumUnits}</p>
          <p className="pm-muted">{c.stats.itemsNote}</p>
        </div>
      </div>

      {/* ============ Records ============ */}
      <div className="pm-card pm-records">
        <div className="pm-rec-head">
          <div className="pm-rec-title">
            <i />
            <div>
              <h3>{c.records.title}</h3>
              <p className="pm-muted">{c.records.subtitle}</p>
            </div>
          </div>
          <div className="pm-rec-btns">
            <button type="button" className="pm-soft" onClick={handleExport}>
              <Download size={14} />
              {c.records.export}
            </button>
            <button
              type="button"
              className="pm-soft"
              onClick={() => window.print()}
              aria-label="Print"
            >
              <Printer size={15} />
            </button>
          </div>
        </div>

        {listError && <p className="pm-error">{listError}</p>}

        {!list ? (
          <p className="dash-loading pm-pad">Loading...</p>
        ) : (
          <>
            <div className="pm-tbl-wrap">
              <table className="pm-tbl">
                <thead>
                  <tr>
                    {c.records.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={c.records.columns.length} className="pm-empty">
                        {c.records.empty}
                      </td>
                    </tr>
                  ) : (
                    rows.map((p, i) => (
                      <tr key={p.id}>
                        <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                        <td className="pm-bold">{p.billNumber}</td>
                        <td>
                          <span className="pm-dot" />
                          {branchLabel(p)}
                        </td>
                        <td>{supplierLabel(p)}</td>
                        <td className="pm-muted">{p.billDate}</td>
                        <td className="pm-num">
                          {p.lines.length
                            ? new Set(p.lines.map((l) => l.variant)).size
                            : "-"}
                        </td>
                        <td className="pm-num">
                          {p.lines.length
                            ? p.lines.reduce((x, l) => x + (Number(l.quantity) || 0), 0)
                            : "-"}
                        </td>
                        <td className="pm-num pm-bold">{formatINR(p.total)}</td>
                        <td>
                          <div className="pm-actions">
                            <button
                              type="button"
                              aria-label="View"
                              onClick={() => openDetail(p)}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              aria-label="Correct"
                              onClick={() => navigate(editPurchasePath(p.id))}
                            >
                              <Pencil size={16} />
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
                Showing <b>{from || 0}</b> to <b>{to || 0}</b> of{" "}
                <b>{list.total}</b> entries
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
                <button
                  type="button"
                  disabled={page >= list.pages}
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

      {/* ============ View popup ============ */}
      {detail && (
        <div className="pm-modal" onClick={() => setDetail(null)}>
          <div className="pm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="pm-modal-head">
              <h3>
                {c.detail.title}: {detail.billNumber}
              </h3>
              <button type="button" onClick={() => setDetail(null)} aria-label={c.detail.close}>
                <X size={18} />
              </button>
            </div>

            <p className="pm-muted pm-pad-s">
              {supplierLabel(detail)} | {branchLabel(detail)} | {detail.billDate} | v
              {detail.version}
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
                      <td className="pm-bold">{variantLabel(l.variant, l.variantLabel)}</td>
                      <td>{l.quantity}</td>
                      <td>{formatINR(l.unitPrice)}</td>
                      <td>{Number(l.gstRate)}%</td>
                      <td>{l.batchCode || "-"}</td>
                      <td>{l.expiry || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pm-modal-foot">
              <button
                type="button"
                className="pm-soft"
                onClick={loadRevisions}
                disabled={revLoading}
              >
                {revLoading ? c.detail.loadingRev : c.detail.revisions}
              </button>
              <button
                type="button"
                className="pm-primary"
                onClick={() => navigate(editPurchasePath(detail.id))}
              >
                <Pencil size={14} />
                Correct
              </button>
            </div>

            {revisions &&
              (revisions.length === 0 ? (
                <p className="pm-muted pm-pad-s">{c.detail.noRev}</p>
              ) : (
                <pre className="ut-pre">{JSON.stringify(revisions, null, 2)}</pre>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;