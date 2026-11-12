import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Pencil, Plus, Search } from "lucide-react";
import { VARIANT_CONTENT } from "../../content/variantContent";
import {
  listVariants,
  createVariant,
  updateVariant,
  deactivateVariant,
} from "../../controllers/variantController";
import { listProductOptions } from "../../controllers/productController";

const EMPTY = {
  product: "",
  sku: "",
  barcode: "",
  shade: "",
  size: "",
  color: "",
};

const Variants = () => {
  const c = VARIANT_CONTENT;
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [page, setPage] = useState(1);
  const [list, setList] = useState(null);
  const [listError, setListError] = useState("");

  useEffect(() => {
    listProductOptions().then(setProducts);
  }, []);

  const load = useCallback(async () => {
    try {
      setListError("");
      setList(
        await listVariants({ product: productFilter, search: applied, page })
      );
    } catch (err) {
      setListError(err.message);
      setList({ rows: [], total: 0, page: 1, pages: 1 });
    }
  }, [productFilter, applied, page]);

  useEffect(() => {
    load();
  }, [load]);

  const productLabel = (v) =>
    v.productName ||
    products.find((o) => o.value === v.productId)?.label ||
    "-";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      if (editingId) {
        await updateVariant(editingId, form);
        setSuccess(c.form.updatedMsg);
      } else {
        await createVariant(form);
        setSuccess(c.form.createdMsg);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (v) => {
    setEditingId(v.id);
    setForm({
      product: v.productId,
      sku: v.sku,
      barcode: v.barcode,
      shade: v.shade,
      size: v.size,
      color: v.color,
    });
    setSuccess("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm(c.list.confirm)) return;
    try {
      await deactivateVariant(id);
      if (editingId === id) resetForm();
      load();
    } catch (err) {
      setListError(err.message);
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
    setProductFilter("");
    setPage(1);
  };

  return (
    <div className="st-page">
      <h2 className="st-title">{c.title}</h2>
      <p className="st-subtitle">{c.subtitle}</p>

      <form className="st-card" onSubmit={handleSubmit}>
        <h3 className="st-card-title">
          {editingId ? <Pencil size={18} /> : <Plus size={18} />}
          {editingId ? c.form.editTitle : c.form.createTitle}
        </h3>

        <div className="st-grid">
          <div className="f-field">
            <label>{c.form.product.label}</label>
            <div className="f-control">
              <select
                name="product"
                value={form.product}
                onChange={handleChange}
                disabled={Boolean(editingId)}
                required
              >
                <option value="">{c.form.product.placeholder}</option>
                {products.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="f-icon" />
            </div>
          </div>

          <div className="f-field">
            <label>{c.form.sku.label}</label>
            <div className="f-control">
              <input
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder={c.form.sku.placeholder}
                disabled={Boolean(editingId)}
                required
              />
            </div>
          </div>

          <div className="f-field">
            <label>{c.form.barcode.label}</label>
            <div className="f-control">
              <input
                type="text"
                name="barcode"
                value={form.barcode}
                onChange={handleChange}
                placeholder={c.form.barcode.placeholder}
              />
            </div>
          </div>

          <div className="f-field">
            <label>{c.form.shade.label}</label>
            <div className="f-control">
              <input
                type="text"
                name="shade"
                value={form.shade}
                onChange={handleChange}
                placeholder={c.form.shade.placeholder}
              />
            </div>
          </div>

          <div className="f-field">
            <label>{c.form.size.label}</label>
            <div className="f-control">
              <input
                type="text"
                name="size"
                value={form.size}
                onChange={handleChange}
                placeholder={c.form.size.placeholder}
              />
            </div>
          </div>

          <div className="f-field">
            <label>{c.form.color.label}</label>
            <div className="f-control">
              <input
                type="text"
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder={c.form.color.placeholder}
              />
            </div>
          </div>
        </div>

        {editingId && <p className="st-msg cat-note">{c.form.editNote}</p>}
        {error && <p className="st-msg st-error">{error}</p>}
        {success && <p className="st-msg st-success">{success}</p>}

        <div className="st-actions">
          {editingId && (
            <button type="button" className="st-reset" onClick={resetForm}>
              {c.form.cancel}
            </button>
          )}
          <button type="submit" className="st-submit" disabled={saving}>
            {saving
              ? c.form.saving
              : editingId
              ? c.form.update
              : c.form.create}
          </button>
        </div>
      </form>

      <div className="st-card st-list">
        <h3 className="st-card-title">{c.list.title}</h3>

        <form className="cat-toolbar pr-toolbar" onSubmit={handleSearch}>
          <div className="cat-search">
            <Search size={16} className="cat-search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={c.list.searchPlaceholder}
            />
          </div>

          <div className="cat-filter">
            <select
              value={productFilter}
              onChange={(e) => {
                setProductFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{c.list.allProducts}</option>
              {products.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="cat-filter-icon" />
          </div>

          <button type="button" className="st-reset" onClick={handleReset}>
            {c.list.reset}
          </button>
          <button type="submit" className="st-submit cat-search-btn">
            {c.list.search}
          </button>
        </form>

        {listError && <p className="st-msg st-error">{listError}</p>}

        {!list ? (
          <p className="dash-loading">Loading...</p>
        ) : (
          <>
            <p className="st-showing">
              Showing {list.rows.length ? 1 : 0}–{list.rows.length} of{" "}
              {list.total} entries
            </p>

            <div className="st-tbl-wrap">
              <table className="st-tbl va-tbl">
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
                    list.rows.map((v) => (
                      <tr key={v.id}>
                        <td className="st-bold">{v.sku}</td>
                        <td className="st-muted">{productLabel(v)}</td>
                        <td className="st-muted">{v.barcode || "-"}</td>
                        <td className="st-muted">{v.shade || "-"}</td>
                        <td className="st-muted">{v.size || "-"}</td>
                        <td className="st-muted">{v.color || "-"}</td>
                        <td>
                          <span
                            className={`sl-pill ${v.isActive ? "st-in" : "st-out"}`}
                          >
                            <i />
                            {v.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="cat-actions">
                            <button
                              type="button"
                              className="cat-edit"
                              onClick={() => handleEdit(v)}
                            >
                              {c.list.edit}
                            </button>
                            {v.isActive && (
                              <button
                                type="button"
                                className="st-deact"
                                onClick={() => handleDeactivate(v.id)}
                              >
                                {c.list.deactivate}
                              </button>
                            )}
                          </div>
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
    </div>
  );
};

export default Variants;