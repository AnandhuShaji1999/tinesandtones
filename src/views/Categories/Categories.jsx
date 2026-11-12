import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Pencil, Plus, Search } from "lucide-react";
import {
  CATEGORY_CONTENT,
  SUBCATEGORY_CONTENT,
} from "../../content/categoryContent";
import {
  listCategories,
  listCategoryOptions,
  createCategory,
  updateCategory,
  deactivateCategory,
} from "../../controllers/categoryController";
import {
  listSubcategories,
  createSubcategory,
  updateSubcategory,
  deactivateSubcategory,
} from "../../controllers/subcategoryController";

const Categories = () => {
  const c = CATEGORY_CONTENT;
  const s = SUBCATEGORY_CONTENT;

  /* ---------------- Categories ---------------- */
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const [page, setPage] = useState(1);
  const [list, setList] = useState(null);
  const [listError, setListError] = useState("");

  const [catOptions, setCatOptions] = useState([]);

  const loadOptions = useCallback(async () => {
    setCatOptions(await listCategoryOptions());
  }, []);

  const load = useCallback(async () => {
    try {
      setListError("");
      setList(await listCategories({ search: applied, page }));
    } catch (err) {
      setListError(err.message);
      setList({ rows: [], total: 0, page: 1, pages: 1 });
    }
  }, [applied, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const resetForm = () => {
    setName("");
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
        await updateCategory(editingId, { name });
        setSuccess(c.form.updatedMsg);
      } else {
        await createCategory({ name });
        setSuccess(c.form.createdMsg);
      }
      resetForm();
      load();
      loadOptions();
      loadSubs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSuccess("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm(c.list.confirm)) return;
    try {
      await deactivateCategory(id);
      if (editingId === id) resetForm();
      load();
      loadOptions();
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
    setPage(1);
  };

  /* ---------------- Subcategories ---------------- */
  const [subCategory, setSubCategory] = useState("");
  const [subName, setSubName] = useState("");
  const [subEditingId, setSubEditingId] = useState(null);
  const [subSaving, setSubSaving] = useState(false);
  const [subError, setSubError] = useState("");
  const [subSuccess, setSubSuccess] = useState("");

  const [subSearch, setSubSearch] = useState("");
  const [subApplied, setSubApplied] = useState("");
  const [subFilter, setSubFilter] = useState("");
  const [subPage, setSubPage] = useState(1);
  const [subList, setSubList] = useState(null);
  const [subListError, setSubListError] = useState("");

  const loadSubs = useCallback(async () => {
    try {
      setSubListError("");
      setSubList(
        await listSubcategories({
          category: subFilter,
          search: subApplied,
          page: subPage,
        })
      );
    } catch (err) {
      setSubListError(err.message);
      setSubList({ rows: [], total: 0, page: 1, pages: 1 });
    }
  }, [subFilter, subApplied, subPage]);

  useEffect(() => {
    loadSubs();
  }, [loadSubs]);

  const categoryLabel = (sub) =>
    sub.categoryName ||
    catOptions.find((o) => o.value === sub.categoryId)?.label ||
    "-";

  const resetSubForm = () => {
    setSubCategory("");
    setSubName("");
    setSubEditingId(null);
    setSubError("");
  };

  const handleSubSubmit = async (e) => {
    e.preventDefault();
    setSubError("");
    setSubSuccess("");
    setSubSaving(true);
    try {
      if (subEditingId) {
        await updateSubcategory(subEditingId, { name: subName });
        setSubSuccess(s.form.updatedMsg);
      } else {
        await createSubcategory({ category: subCategory, name: subName });
        setSubSuccess(s.form.createdMsg);
      }
      resetSubForm();
      loadSubs();
    } catch (err) {
      setSubError(err.message);
    } finally {
      setSubSaving(false);
    }
  };

  const handleSubEdit = (sub) => {
    setSubEditingId(sub.id);
    setSubCategory(sub.categoryId);
    setSubName(sub.name);
    setSubSuccess("");
    setSubError("");
    document
      .getElementById("subcategory-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubDeactivate = async (id) => {
    if (!window.confirm(s.list.confirm)) return;
    try {
      await deactivateSubcategory(id);
      if (subEditingId === id) resetSubForm();
      loadSubs();
    } catch (err) {
      setSubListError(err.message);
    }
  };

  const handleSubSearch = (e) => {
    e.preventDefault();
    setSubPage(1);
    setSubApplied(subSearch.trim());
  };

  const handleSubReset = () => {
    setSubSearch("");
    setSubApplied("");
    setSubFilter("");
    setSubPage(1);
  };

  return (
    <div className="st-page">
      <h2 className="st-title">{c.title}</h2>
      <p className="st-subtitle">{c.subtitle}</p>

      {/* ============ Category form ============ */}
      <form className="st-card" onSubmit={handleSubmit}>
        <h3 className="st-card-title">
          {editingId ? <Pencil size={18} /> : <Plus size={18} />}
          {editingId ? c.form.editTitle : c.form.createTitle}
        </h3>

        <div className="cat-form-row">
          <div className="f-field">
            <label>{c.form.name.label}</label>
            <div className="f-control">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={c.form.name.placeholder}
                required
              />
            </div>
          </div>

          <div className="cat-form-btns">
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
        </div>

        {error && <p className="st-msg st-error">{error}</p>}
        {success && <p className="st-msg st-success">{success}</p>}
      </form>

      {/* ============ Category list ============ */}
      <div className="st-card st-list">
        <h3 className="st-card-title">{c.list.title}</h3>

        <form className="cat-toolbar" onSubmit={handleSearch}>
          <div className="cat-search">
            <Search size={16} className="cat-search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={c.list.searchPlaceholder}
            />
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
              <table className="st-tbl cat-tbl">
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
                    list.rows.map((cat) => (
                      <tr key={cat.id}>
                        <td className="st-bold">{cat.name}</td>
                        <td>
                          <span
                            className={`sl-pill ${
                              cat.isActive ? "st-in" : "st-out"
                            }`}
                          >
                            <i />
                            {cat.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="cat-actions">
                            <button
                              type="button"
                              className="cat-edit"
                              onClick={() => handleEdit(cat)}
                            >
                              {c.list.edit}
                            </button>
                            {cat.isActive && (
                              <button
                                type="button"
                                className="st-deact"
                                onClick={() => handleDeactivate(cat.id)}
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

      {/* ============ Subcategory form ============ */}
      <form
        id="subcategory-form"
        className="st-card st-list"
        onSubmit={handleSubSubmit}
      >
        <h3 className="st-card-title">
          {subEditingId ? <Pencil size={18} /> : <Plus size={18} />}
          {subEditingId ? s.form.editTitle : s.form.createTitle}
        </h3>

        <div className="sub-form-row">
          <div className="f-field">
            <label>{s.form.category.label}</label>
            <div className="f-control">
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                disabled={Boolean(subEditingId)}
                required
              >
                <option value="">{s.form.category.placeholder}</option>
                {catOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="f-icon" />
            </div>
          </div>

          <div className="f-field">
            <label>{s.form.name.label}</label>
            <div className="f-control">
              <input
                type="text"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder={s.form.name.placeholder}
                required
              />
            </div>
          </div>

          <div className="cat-form-btns">
            {subEditingId && (
              <button
                type="button"
                className="st-reset"
                onClick={resetSubForm}
              >
                {s.form.cancel}
              </button>
            )}
            <button type="submit" className="st-submit" disabled={subSaving}>
              {subSaving
                ? s.form.saving
                : subEditingId
                ? s.form.update
                : s.form.create}
            </button>
          </div>
        </div>

        {subEditingId && <p className="st-msg cat-note">{s.form.editNote}</p>}
        {subError && <p className="st-msg st-error">{subError}</p>}
        {subSuccess && <p className="st-msg st-success">{subSuccess}</p>}
      </form>

      {/* ============ Subcategory list ============ */}
      <div className="st-card st-list">
        <h3 className="st-card-title">{s.list.title}</h3>

        <form className="cat-toolbar" onSubmit={handleSubSearch}>
          <div className="cat-search">
            <Search size={16} className="cat-search-icon" />
            <input
              type="text"
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
              placeholder={s.list.searchPlaceholder}
            />
          </div>

          <div className="cat-filter">
            <select
              value={subFilter}
              onChange={(e) => {
                setSubFilter(e.target.value);
                setSubPage(1);
              }}
            >
              <option value="">{s.list.allCategories}</option>
              {catOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="cat-filter-icon" />
          </div>

          <button type="button" className="st-reset" onClick={handleSubReset}>
            {s.list.reset}
          </button>
          <button type="submit" className="st-submit cat-search-btn">
            {s.list.search}
          </button>
        </form>

        {subListError && <p className="st-msg st-error">{subListError}</p>}

        {!subList ? (
          <p className="dash-loading">Loading...</p>
        ) : (
          <>
            <p className="st-showing">
              Showing {subList.rows.length ? 1 : 0}–{subList.rows.length} of{" "}
              {subList.total} entries
            </p>

            <div className="st-tbl-wrap">
              <table className="st-tbl cat-tbl">
                <thead>
                  <tr>
                    {s.list.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subList.rows.length === 0 ? (
                    <tr>
                      <td colSpan={s.list.columns.length} className="st-empty">
                        {s.list.empty}
                      </td>
                    </tr>
                  ) : (
                    subList.rows.map((sub) => (
                      <tr key={sub.id}>
                        <td className="st-bold">{sub.name}</td>
                        <td className="st-muted">{categoryLabel(sub)}</td>
                        <td>
                          <span
                            className={`sl-pill ${
                              sub.isActive ? "st-in" : "st-out"
                            }`}
                          >
                            <i />
                            {sub.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="cat-actions">
                            <button
                              type="button"
                              className="cat-edit"
                              onClick={() => handleSubEdit(sub)}
                            >
                              {s.list.edit}
                            </button>
                            {sub.isActive && (
                              <button
                                type="button"
                                className="st-deact"
                                onClick={() => handleSubDeactivate(sub.id)}
                              >
                                {s.list.deactivate}
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

            {subList.pages > 1 && (
              <div className="cat-pager">
                <button
                  type="button"
                  disabled={subPage <= 1}
                  onClick={() => setSubPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {subPage} of {subList.pages}
                </span>
                <button
                  type="button"
                  disabled={subPage >= subList.pages}
                  onClick={() => setSubPage((p) => p + 1)}
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

export default Categories;