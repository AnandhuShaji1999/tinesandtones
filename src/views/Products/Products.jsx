import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import { PRODUCT_LIST_CONTENT } from "../../content/productListContent";
import {
  GST_RATES,
  PRODUCT_PAGE_SIZE,
  formatINR,
} from "../../models/productModel";
import {
  listProducts,
  getProduct,
  updateProduct,
  deactivateProduct,
} from "../../controllers/productController";
import { listCategoryOptions } from "../../controllers/categoryController";
import { listSubcategoryOptions } from "../../controllers/subcategoryController";
import { listBrandOptions } from "../../controllers/brandController";
import { ROUTES } from "../../constants/routes";

const EMPTY_FILTERS = { search: "", category: "", subcategory: "", brand: "" };

// 1 ... 4 5 6 ... 12
const pageList = (page, pages) => {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page - 1, page, page + 1]);
  const nums = [...set]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push("...");
    out.push(n);
  });
  return out;
};

const Products = () => {
  const c = PRODUCT_LIST_CONTENT;
  const navigate = useNavigate();

  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [list, setList] = useState(null);
  const [listError, setListError] = useState("");

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    listCategoryOptions().then(setCategories);
    listBrandOptions().then(setBrands);
  }, []);

  useEffect(() => {
    let active = true;
    listSubcategoryOptions(draft.category).then((o) => {
      if (active) setSubcategories(o);
    });
    return () => {
      active = false;
    };
  }, [draft.category]);

  const load = useCallback(async () => {
    try {
      setListError("");
      setList(await listProducts({ ...filters, page }));
    } catch (err) {
      setListError(err.message);
      setList({ rows: [], total: 0, page: 1, pages: 1 });
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  const label = (options, id, fallback) =>
    fallback || options.find((o) => o.value === id)?.label || "-";

  const goToPage = (n) => {
    setPage(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDraft = (e) => {
    const { name, value } = e.target;
    setDraft((p) =>
      name === "category"
        ? { ...p, category: value, subcategory: "" }
        : { ...p, [name]: value }
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setFilters({ ...draft, search: draft.search.trim() });
  };

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const startEdit = async (row) => {
    setError("");
    setSuccess("");
    try {
      const p = await getProduct(row.id);
      setEditing(p.id);
      setForm({
        name: p.name,
        description: p.description,
        hsn: p.hsn,
        gstRate: p.gstRate,
        hasCost: p.hasCost,
        purchasePrice: p.purchaseCost,
        retailPrice: p.retailPrice,
        expiryTracked: p.expiryTracked,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setListError(err.message);
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(null);
    setError("");
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await updateProduct(editing, form);
      setSuccess(c.edit.success);
      cancelEdit();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm(c.confirm)) return;
    try {
      await deactivateProduct(id);
      if (editing === id) cancelEdit();
      // If the last row of the last page was removed, step back one page
      if (list && list.rows.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (err) {
      setListError(err.message);
    }
  };

  const from = list && list.rows.length ? (page - 1) * PRODUCT_PAGE_SIZE + 1 : 0;
  const to = from ? from + list.rows.length - 1 : 0;

  return (
    <div className="st-page">
      <div className="sl-head">
        <div>
          <h2 className="st-title">{c.title}</h2>
          <p className="st-subtitle pr-sub">{c.subtitle}</p>
        </div>
        <button
          type="button"
          className="sl-add"
          onClick={() => navigate(ROUTES.ADD_PRODUCT)}
        >
          <Plus size={15} />
          {c.add}
        </button>
      </div>

      {success && <p className="st-msg st-success pr-top">{success}</p>}

      {editing && form && (
        <form className="st-card pr-edit" onSubmit={handleUpdate}>
          <h3 className="st-card-title">
            <Pencil size={18} />
            {c.edit.title}
          </h3>

          <div className="st-grid">
            <div className="f-field">
              <label>{c.edit.name}</label>
              <div className="f-control">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>

            <div className="f-field">
              <label>{c.edit.hsn}</label>
              <div className="f-control">
                <input
                  type="text"
                  name="hsn"
                  value={form.hsn}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            {form.hasCost && (
              <div className="f-field">
                <label>{c.edit.purchase}</label>
                <div className="f-control">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="purchasePrice"
                    value={form.purchasePrice}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
            )}

            <div className="f-field">
              <label>{c.edit.retail}</label>
              <div className="f-control">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="retailPrice"
                  value={form.retailPrice}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>

            <div className="f-field">
              <label>{c.edit.gst}</label>
              <div className="f-control">
                <select
                  name="gstRate"
                  value={form.gstRate}
                  onChange={handleFormChange}
                  required
                >
                  {GST_RATES.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="f-icon" />
              </div>
            </div>

            <div className="f-field">
              <label>{c.edit.description}</label>
              <div className="f-control">
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="f-field">
              <label className="pr-check">
                <input
                  type="checkbox"
                  name="expiryTracked"
                  checked={form.expiryTracked}
                  onChange={handleFormChange}
                />
                <span>{c.edit.expiry}</span>
              </label>
            </div>
          </div>

          <p className="st-msg cat-note">{c.edit.note}</p>
          {error && <p className="st-msg st-error">{error}</p>}

          <div className="st-actions">
            <button type="button" className="st-reset" onClick={cancelEdit}>
              {c.edit.cancel}
            </button>
            <button type="submit" className="st-submit" disabled={saving}>
              {saving ? c.edit.saving : c.edit.save}
            </button>
          </div>
        </form>
      )}

      <div className="st-card st-list pr-list">
        <form className="cat-toolbar pr-toolbar" onSubmit={handleSearch}>
          <div className="cat-search">
            <Search size={16} className="cat-search-icon" />
            <input
              type="text"
              name="search"
              value={draft.search}
              onChange={handleDraft}
              placeholder={c.filters.search}
            />
          </div>

          <div className="cat-filter">
            <select name="category" value={draft.category} onChange={handleDraft}>
              <option value="">{c.filters.category}</option>
              {categories.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="cat-filter-icon" />
          </div>

          <div className="cat-filter">
            <select
              name="subcategory"
              value={draft.subcategory}
              onChange={handleDraft}
              disabled={!draft.category}
            >
              <option value="">{c.filters.subcategory}</option>
              {subcategories.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="cat-filter-icon" />
          </div>

          <div className="cat-filter">
            <select name="brand" value={draft.brand} onChange={handleDraft}>
              <option value="">{c.filters.brand}</option>
              {brands.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="cat-filter-icon" />
          </div>

          <button type="button" className="st-reset" onClick={handleReset}>
            {c.filters.reset}
          </button>
          <button type="submit" className="st-submit cat-search-btn">
            {c.filters.searchBtn}
          </button>
        </form>

        {listError && <p className="st-msg st-error">{listError}</p>}

        {!list ? (
          <p className="dash-loading">Loading...</p>
        ) : (
          <>
            <div className="st-tbl-wrap">
              <table className="st-tbl pr-tbl">
                <thead>
                  <tr>
                    {c.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.rows.length === 0 ? (
                    <tr>
                      <td colSpan={c.columns.length} className="st-empty">
                        {c.empty}
                      </td>
                    </tr>
                  ) : (
                    list.rows.map((p) => (
                      <tr key={p.id}>
                        <td className="st-muted">{p.code}</td>
                        <td className="st-bold">{p.name}</td>
                        <td className="st-muted">
                          {label(categories, p.categoryId, p.categoryName)}
                        </td>
                        <td className="st-muted">{p.subcategoryName || "-"}</td>
                        <td className="st-muted">
                          {p.brandId ? label(brands, p.brandId, p.brandName) : "-"}
                        </td>
                        <td className="st-muted">
                          {p.variants.length
                            ? p.variants.map((v) => v.sku).join(", ")
                            : "-"}
                        </td>
                        <td className="st-muted">
                          {p.gstRate ? `${Number(p.gstRate)}%` : "-"}
                        </td>
                        <td className="st-muted">
                          {p.hasCost ? formatINR(p.purchaseCost) : "-"}
                        </td>
                        <td className="st-bold">{formatINR(p.retailPrice)}</td>
                        <td className="st-muted">
                          {p.expiryTracked ? "Yes" : "No"}
                        </td>
                        <td>
                          <span
                            className={`sl-pill ${p.isActive ? "st-in" : "st-out"}`}
                          >
                            <i />
                            {p.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="cat-actions">
                            <button
                              type="button"
                              className="cat-edit"
                              onClick={() => startEdit(p)}
                            >
                              Edit
                            </button>
                            {p.isActive && (
                              <button
                                type="button"
                                className="st-deact"
                                onClick={() => handleDeactivate(p.id)}
                              >
                                Deactivate
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

            <div className="pg-bar">
              <p className="pg-info">
                Showing <b>{from}</b> to <b>{to}</b> of <b>{list.total}</b>{" "}
                entries
              </p>

              <div className="pg-nav">
                <button
                  type="button"
                  className="pg-btn"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={15} />
                </button>

                {pageList(page, list.pages).map((n, i) =>
                  n === "..." ? (
                    <span key={`dots-${i}`} className="pg-dots">
                      ...
                    </span>
                  ) : (
                    <button
                      type="button"
                      key={n}
                      className={`pg-btn ${n === page ? "on" : ""}`}
                      onClick={() => goToPage(n)}
                      aria-current={n === page ? "page" : undefined}
                    >
                      {n}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="pg-btn"
                  disabled={page >= list.pages}
                  onClick={() => goToPage(page + 1)}
                  aria-label="Next page"
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

export default Products;