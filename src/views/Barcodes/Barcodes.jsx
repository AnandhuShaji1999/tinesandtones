import { useCallback, useEffect, useRef, useState } from "react";
import { Printer, ScanLine, Search } from "lucide-react";
import BarcodeSvg from "../../components/BarcodeSvg";
import { BARCODE_CONTENT } from "../../content/barcodeContent";
import { formatINR } from "../../models/productModel";
import {
  listProducts,
  loadBarcodeLabels,
  lookupBarcode,
} from "../../controllers/productController";

// A3 print setup (297mm x 420mm). Only active while this page is mounted.
const A3_PRINT_CSS = `
@media screen {
  .bc-sheet {
    max-width: 297mm;
    margin-left: auto;
    margin-right: auto;
  }
}
@media print {
  @page {
    size: A3 portrait;
    margin: 10mm;
  }
  html, body {
    width: 297mm;
    margin: 0;
    padding: 0;
  }
  .bc-sheet {
    width: 100%;
    max-width: none;
    margin: 0;
    display: grid;
    gap: 4mm;
  }
  .bc-label {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
`;

const Barcodes = () => {
  const c = BARCODE_CONTENT;
  const panelRef = useRef(null);

  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const [page, setPage] = useState(1);
  const [list, setList] = useState(null);
  const [listError, setListError] = useState("");

  const [scan, setScan] = useState("");
  const [scanMsg, setScanMsg] = useState({ ok: false, text: "" });

  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState("1");
  const [perRow, setPerRow] = useState("2");
  const [labels, setLabels] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setListError("");
      setList(await listProducts({ search: applied, page }));
    } catch (err) {
      setListError(err.message);
      setList({ rows: [], total: 0, page: 1, pages: 1 });
    }
  }, [applied, page]);

  useEffect(() => {
    load();
  }, [load]);

  const choose = (p) => {
    setSelected(p);
    setLabels([]);
    setError("");
    setTimeout(
      () => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50
    );
  };

  const handleScanKey = async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault(); // scanners send Enter after the code
    const code = scan.trim();
    if (!code) return;
    try {
      const rows = await lookupBarcode(code);
      if (!rows.length) {
        setScanMsg({ ok: false, text: c.scan.notFound });
        return;
      }
      choose(rows[0]);
      setScanMsg({
        ok: true,
        text: rows.length > 1 ? c.scan.several : `${c.scan.found}: ${rows[0].name}`,
      });
      setScan("");
    } catch (err) {
      setScanMsg({ ok: false, text: err.message });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setApplied(search.trim());
  };

  const handleReset = () => {
    setSearch("");
    setApplied("");
    setPage(1);
  };

  // Loads the labels from the API, then optionally opens the print dialog
  const handleLabels = async (andPrint) => {
    setError("");
    if (!selected) return;
    if (!selected.barcode) return setError(c.print.noBarcode);
    setBusy(true);
    try {
      const res = await loadBarcodeLabels(selected.id, qty);
      setLabels(res.labels);
      if (andPrint) setTimeout(() => window.print(), 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="st-page">
      {/* A3 page size for printing */}
      <style>{A3_PRINT_CSS}</style>

      <div className="bc-noprint">
        <h2 className="st-title">{c.title}</h2>
        <p className="st-subtitle">{c.subtitle}</p>

        {/* ---------- scan ---------- */}
        <div className="st-card">
          <h3 className="st-card-title">
            <ScanLine size={18} />
            {c.scan.title}
          </h3>
          <div className="cat-search bc-scan">
            <ScanLine size={16} className="cat-search-icon" />
            <input
              type="text"
              value={scan}
              onChange={(e) => setScan(e.target.value)}
              onKeyDown={handleScanKey}
              placeholder={c.scan.placeholder}
              autoComplete="off"
              autoFocus
            />
          </div>
          {scanMsg.text && (
            <p className={`st-msg ${scanMsg.ok ? "st-success" : "st-error"}`}>
              {scanMsg.text}
            </p>
          )}
        </div>

        {/* ---------- selected product + print ---------- */}
        <div className="st-card bc-panel" ref={panelRef}>
          <h3 className="st-card-title">
            <Printer size={18} />
            {c.print.title}
          </h3>

          {!selected ? (
            <p className="st-msg cat-note">{c.print.none}</p>
          ) : (
            <>
              <div className="bc-selected">
                <div className="bc-selected-t">
                  <b>{selected.name}</b>
                  <span>
                    {selected.code}
                    {selected.categoryName ? ` · ${selected.categoryName}` : ""}
                  </span>
                </div>
                {selected.barcode ? (
                  <div className="bc-selected-bar">
                    <BarcodeSvg value={selected.barcode} height={50} />
                  </div>
                ) : (
                  <p className="st-msg st-error">{c.print.noBarcode}</p>
                )}
              </div>

              <div className="st-grid">
                <div className="f-field">
                  <label>{c.print.quantity}</label>
                  <div className="f-control">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      step="1"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                    />
                  </div>
                </div>

                <div className="f-field">
                  <label>{c.print.perRow}</label>
                  <div className="f-control">
                    <select value={perRow} onChange={(e) => setPerRow(e.target.value)}>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && <p className="st-msg st-error">{error}</p>}
              <p className="st-msg cat-note">{c.print.hint}</p>

              <div className="st-actions">
                <button
                  type="button"
                  className="st-reset"
                  disabled={busy}
                  onClick={() => handleLabels(false)}
                >
                  {busy ? c.print.loading : c.print.preview}
                </button>
                <button
                  type="button"
                  className="st-submit"
                  disabled={busy}
                  onClick={() => handleLabels(true)}
                >
                  {busy ? c.print.loading : c.print.print}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ---------- product list ---------- */}
        <div className="st-card st-list">
          <h3 className="st-card-title">{c.list.title}</h3>

          <form className="cat-toolbar pr-toolbar" onSubmit={handleSearch}>
            <div className="cat-search">
              <Search size={16} className="cat-search-icon" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={c.list.search}
              />
            </div>
            <button type="button" className="st-reset" onClick={handleReset}>
              {c.list.reset}
            </button>
            <button type="submit" className="st-submit cat-search-btn">
              {c.list.searchBtn}
            </button>
          </form>

          {listError && <p className="st-msg st-error">{listError}</p>}

          {!list ? (
            <p className="dash-loading">Loading...</p>
          ) : (
            <>
              <p className="st-showing">
                Showing {list.rows.length ? 1 : 0}–{list.rows.length} of {list.total}{" "}
                entries
              </p>

              <div className="st-tbl-wrap">
                <table className="st-tbl bc-tbl">
                  <thead>
                    <tr>
                      {c.list.columns.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {list.rows.length === 0 ? (
                      <tr>
                        <td colSpan={c.list.columns.length} className="st-empty">
                          {c.list.empty}
                        </td>
                      </tr>
                    ) : (
                      list.rows.map((p) => (
                        <tr key={p.id}>
                          <td className="st-muted">{p.code}</td>
                          <td className="st-bold">{p.name}</td>
                          <td className="st-muted bc-code">{p.barcode || "-"}</td>
                          <td className="st-bold">{formatINR(p.retailPrice)}</td>
                          <td>
                            <span className={`sl-pill ${p.isActive ? "st-in" : "st-out"}`}>
                              <i />
                              {p.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="cat-edit"
                              onClick={() => choose(p)}
                            >
                              {selected?.id === p.id ? c.list.selected : c.list.select}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {list.pages > 1 && (
                <div className="cat-pager">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of {list.pages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= list.pages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {labels.length > 0 && (
          <h3 className="bc-sheet-title">
            Label preview ({labels.length} label{labels.length === 1 ? "" : "s"})
          </h3>
        )}
      </div>

      {/* ---------- label sheet (this is what prints) ---------- */}
      {labels.length > 0 && (
        <div
          className="bc-sheet"
          style={{ gridTemplateColumns: `repeat(${perRow}, minmax(0, 1fr))` }}
        >
          {labels.map((l, i) => (
            <div className="bc-label" key={i}>
              <span className="bc-name">{l.name}</span>
              <BarcodeSvg value={l.barcode} height={55} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Barcodes;