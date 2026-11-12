import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { PURCHASES_CONTENT } from "../../content/purchaseApiContent";
import {
  EMPTY_LINE,
  GST_OPTIONS,
  PRICE_MODES,
  TAX_TREATMENTS,
  computeTotals,
  lineAmounts,
  formatINR,
} from "../../models/purchaseModel";
import {
  getPurchase,
  createPurchase,
  correctPurchase,
} from "../../controllers/purchaseController";
import { listSupplierOptions } from "../../controllers/supplierController";
import { listVariantOptions } from "../../controllers/variantController";
import { listBranches } from "../../controllers/staffController";
import { ROUTES } from "../../constants/routes";

const today = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);

const emptyForm = () => ({
  branch: "",
  supplier: "",
  billNumber: "",
  billDate: today(),
  priceMode: "exclusive",
  taxTreatment: "intra_state",
});

const AddPurchase = () => {
  const c = PURCHASES_CONTENT.form;
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm());
  const [version, setVersion] = useState(null);
  const [lines, setLines] = useState([]);
  const [entry, setEntry] = useState({ ...EMPTY_LINE });
  const [entryIdx, setEntryIdx] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [branches, setBranches] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    listBranches().then(setBranches);
    listSupplierOptions().then(setSuppliers);
    listVariantOptions().then(setVariants);
  }, []);

  useEffect(() => {
    if (!id) return;
    getPurchase(id)
      .then((p) => {
        setVersion(p.version);
        setForm({
          branch: p.branchId,
          supplier: p.supplierId,
          billNumber: p.billNumber,
          billDate: p.billDate,
          priceMode: p.priceMode,
          taxTreatment: p.taxTreatment,
        });
        setLines(p.lines);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const noGst = form.taxTreatment === "none";
  const hasBranches = branches.length > 0;

  const totals = useMemo(
    () => computeTotals(lines, form.priceMode, form.taxTreatment),
    [lines, form.priceMode, form.taxTreatment]
  );
  const entryAmt = lineAmounts(entry, form.priceMode, form.taxTreatment);

  const variantLabel = (vid, fallback) =>
    variants.find((o) => o.value === vid)?.label || fallback || vid || "-";

  const handleForm = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleEntry = (e) => {
    const { name, value } = e.target;
    setEntry((p) => ({ ...p, [name]: value }));
  };

  const commitEntry = () => {
    if (!entry.variant || !Number(entry.quantity) || entry.unitPrice === "") {
      setError(c.needFields);
      return;
    }
    setError("");
    const line = { ...entry, gstRate: noGst ? "0.00" : entry.gstRate };
    setLines((p) =>
      entryIdx === null ? [...p, line] : p.map((l, i) => (i === entryIdx ? line : l))
    );
    setEntry({ ...EMPTY_LINE });
    setEntryIdx(null);
  };

  const editLine = (idx) => {
    setEntry({ ...lines[idx] });
    setEntryIdx(idx);
  };

  const removeLine = (idx) => {
    setLines((p) => p.filter((_, i) => i !== idx));
    if (entryIdx === idx) {
      setEntry({ ...EMPTY_LINE });
      setEntryIdx(null);
    }
  };

  const handleSave = async () => {
    setError("");
    if (!lines.length) {
      setError(c.needItem);
      return;
    }
    if (!isEdit && (!form.branch || !form.supplier || !form.billNumber.trim())) {
      setError("Branch, supplier and bill number are required.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await correctPurchase(id, version, form.taxTreatment, lines);
      } else {
        await createPurchase(form, lines);
      }
      navigate(ROUTES.PURCHASES);
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const half = totals.gst / 2;

  return (
    <div className="pm-page">
      <div className="ap2-top">
        <button
          type="button"
          className="pm-back"
          onClick={() => navigate(ROUTES.PURCHASES)}
        >
          <ChevronLeft size={16} />
          {c.back}
        </button>
        <h2 className="pm-title">{isEdit ? c.editTitle : c.addTitle}</h2>
        <span className="ap2-mode">{isEdit ? c.modeEdit : c.modeAdd}</span>
      </div>

      {error && <p className="pm-error pm-error-top">{error}</p>}

      <div className="ap2-grid">
        {/* ============ Purchase Details ============ */}
        <div className="pm-card ap2-details">
          <h3 className="ap2-h">{c.detailsTitle}</h3>

          <div className="ap2-fields">
            <div className="f-field">
              <label>{hasBranches ? c.branch : c.branchId}</label>
              <div className="f-control">
                {hasBranches ? (
                  <>
                    <select
                      name="branch"
                      value={form.branch}
                      onChange={handleForm}
                      disabled={isEdit}
                    >
                      <option value="">{c.branchPh}</option>
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
                    value={form.branch}
                    onChange={handleForm}
                    disabled={isEdit}
                  />
                )}
              </div>
            </div>

            <div className="f-field">
              <label>{c.supplier}</label>
              <div className="f-control">
                <select
                  name="supplier"
                  value={form.supplier}
                  onChange={handleForm}
                  disabled={isEdit}
                >
                  <option value="">{c.supplierPh}</option>
                  {suppliers.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="f-icon" />
              </div>
            </div>

            <div className="f-field">
              <label>{c.billNumber}</label>
              <div className="f-control">
                <input
                  name="billNumber"
                  value={form.billNumber}
                  onChange={handleForm}
                  placeholder={c.billPh}
                  disabled={isEdit}
                />
              </div>
            </div>

            <div className="f-field">
              <label>{c.billDate}</label>
              <div className="f-control">
                <input
                  type="date"
                  name="billDate"
                  value={form.billDate}
                  onChange={handleForm}
                  disabled={isEdit}
                />
              </div>
            </div>

            <div className="f-field">
              <label>{c.priceMode}</label>
              <div className="f-control">
                <select
                  name="priceMode"
                  value={form.priceMode}
                  onChange={handleForm}
                  disabled={isEdit}
                >
                  {PRICE_MODES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="f-icon" />
              </div>
            </div>

            <div className="f-field">
              <label>{c.taxTreatment}</label>
              <div className="f-control">
                <select
                  name="taxTreatment"
                  value={form.taxTreatment}
                  onChange={handleForm}
                  disabled={isEdit}
                >
                  {TAX_TREATMENTS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="f-icon" />
              </div>
            </div>
          </div>

          {isEdit && <p className="pm-muted ap2-note">{c.editNote}</p>}
        </div>

        {/* ============ Summary ============ */}
        <div className="pm-card ap2-summary">
          <h3 className="ap2-h">{c.summary}</h3>
          <div className="ap2-row">
            <span>{c.taxable}</span>
            <b>{formatINR(totals.taxable)}</b>
          </div>
          {form.taxTreatment === "intra_state" && (
            <>
              <div className="ap2-row">
                <span>{c.cgst}</span>
                <b>{formatINR(half)}</b>
              </div>
              <div className="ap2-row">
                <span>{c.sgst}</span>
                <b>{formatINR(half)}</b>
              </div>
            </>
          )}
          {form.taxTreatment === "inter_state" && (
            <div className="ap2-row">
              <span>{c.igst}</span>
              <b>{formatINR(totals.gst)}</b>
            </div>
          )}
          <div className="ap2-row">
            <span>{c.totalGst}</span>
            <b>{formatINR(totals.gst)}</b>
          </div>
          <div className="ap2-final">
            <span>{c.final}</span>
            <p>{formatINR(totals.total)}</p>
            <small>{c.finalNote}</small>
          </div>
        </div>
      </div>

      {/* ============ Products ============ */}
      <div className="pm-card ap2-products">
        <h3 className="ap2-h">{c.productsTitle}</h3>

        <div className="ap2-quick">
          <p className="ap2-quick-title">
            {entryIdx === null ? c.quick : `${c.quick} - EDITING ITEM ${entryIdx + 1}`}
          </p>

          <div className="ap2-entry">
            <div className="f-field ap2-e-v">
              <label>{c.variant}</label>
              <div className="f-control">
                <select name="variant" value={entry.variant} onChange={handleEntry}>
                  <option value="">{c.variantPh}</option>
                  {variants.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="f-icon" />
              </div>
            </div>

            <div className="f-field">
              <label>{c.qty}</label>
              <div className="f-control">
                <input
                  type="number"
                  min="1"
                  step="1"
                  name="quantity"
                  value={entry.quantity}
                  onChange={handleEntry}
                />
              </div>
            </div>

            <div className="f-field">
              <label>{c.unitPrice}</label>
              <div className="f-control">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="unitPrice"
                  value={entry.unitPrice}
                  onChange={handleEntry}
                />
              </div>
            </div>

            <div className="f-field">
              <label>{c.gst}</label>
              <div className="f-control">
                <select
                  name="gstRate"
                  value={noGst ? "0.00" : entry.gstRate}
                  onChange={handleEntry}
                  disabled={noGst}
                >
                  {GST_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {Number(g)}%
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="f-icon" />
              </div>
            </div>

            <div className="f-field">
              <label>{c.batch}</label>
              <div className="f-control">
                <input name="batchCode" value={entry.batchCode} onChange={handleEntry} />
              </div>
            </div>

            <div className="f-field">
              <label>{c.expiry}</label>
              <div className="f-control">
                <input
                  type="date"
                  name="expiry"
                  value={entry.expiry}
                  onChange={handleEntry}
                />
              </div>
            </div>
          </div>

          <div className="ap2-quick-foot">
            <span className="ap2-chip">
              {c.lineTotal}: <b>{formatINR(entryAmt.total)}</b>
            </span>
            <button type="button" className="pm-primary" onClick={commitEntry}>
              <Plus size={15} />
              {entryIdx === null ? c.addItem : c.updateItem}
            </button>
          </div>
        </div>

        <div className="pm-tbl-wrap">
          <table className="pm-tbl ap2-tbl">
            <thead>
              <tr>
                {c.tableCols.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={c.tableCols.length} className="pm-empty">
                    {c.emptyLines}
                  </td>
                </tr>
              ) : (
                lines.map((l, idx) => (
                  <tr key={`${l.id}-${idx}`}>
                    <td>{idx + 1}</td>
                    <td className="pm-bold">{variantLabel(l.variant, l.variantLabel)}</td>
                    <td className="pm-num">{l.quantity}</td>
                    <td className="pm-num">{formatINR(l.unitPrice)}</td>
                    <td className="pm-num">{noGst ? 0 : Number(l.gstRate)}%</td>
                    <td>{l.batchCode || "-"}</td>
                    <td>{l.expiry || "-"}</td>
                    <td className="pm-num pm-bold">
                      {formatINR(lineAmounts(l, form.priceMode, form.taxTreatment).total)}
                    </td>
                    <td>
                      <div className="pm-actions">
                        <button type="button" aria-label="Edit" onClick={() => editLine(idx)}>
                          <Pencil size={15} />
                        </button>
                        <button type="button" aria-label="Remove" onClick={() => removeLine(idx)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="pm-muted ap2-count">
          Showing {lines.length} line item{lines.length === 1 ? "" : "s"} (Total
          Quantity: {totals.units} units)
        </p>
      </div>

      <div className="ap2-footer">
        <button
          type="button"
          className="pm-soft"
          onClick={() => navigate(ROUTES.PURCHASES)}
        >
          {c.cancel}
        </button>
        <button
          type="button"
          className="pm-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? c.saving : isEdit ? c.saveEdit : c.save}
        </button>
      </div>
    </div>
  );
};

export default AddPurchase;