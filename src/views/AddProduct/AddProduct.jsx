import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, ListChecks, Banknote, ChevronDown } from "lucide-react";
import BarcodeSvg from "../../components/BarcodeSvg";
import { PRODUCT_CONTENT } from "../../content/productContent";
import { GST_RATES } from "../../models/productModel";
import { createProductWithVariant } from "../../controllers/productController";
import { listCategoryOptions } from "../../controllers/categoryController";
import { listSubcategoryOptions } from "../../controllers/subcategoryController";
import { listBrandOptions } from "../../controllers/brandController";
import { ROUTES } from "../../constants/routes";

const EMPTY = {
  code: "",
  name: "",
  category: "",
  subcategory: "",
  description: "",
  brand: "",
  gstRate: "",
  purchasePrice: "",
  retailPrice: "",
  expiryTracked: false,
};

const AddProduct = () => {
  const c = PRODUCT_CONTENT;
  const navigate = useNavigate();
  const codeRef = useRef(null);

  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  useEffect(() => {
    listCategoryOptions().then(setCategories);
    listBrandOptions().then(setBrands);
  }, []);

  useEffect(() => {
    let active = true;
    if (!form.category) {
      setSubcategories([]);
      return undefined;
    }
    listSubcategoryOptions(form.category).then((opts) => {
      if (active) setSubcategories(opts);
    });
    return () => {
      active = false;
    };
  }, [form.category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const v = type === "checkbox" ? checked : value;
    if (name === "code") setCreated(null);
    setForm((p) =>
      name === "category"
        ? { ...p, category: v, subcategory: "" }
        : { ...p, [name]: v }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCreated(null);
    setSaving(true);
    try {
      const product = await createProductWithVariant(form);
      setCreated(product);
      // Clear only the product code; every other field keeps its last value
      setForm((p) => ({ ...p, code: "" }));
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => codeRef.current?.focus(), 0);
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="ap-page" onSubmit={handleSubmit}>
      <h2 className="ap-title">{c.title}</h2>
      <p className="ap-subtitle">{c.subtitle}</p>

      {error && <p className="ap-error">{error}</p>}

      {created && (
        <div className="ap-created">
          <div className="ap-created-t">
            <b>{c.created.title}</b>
            <span>
              {created.name} · {created.code}
            </span>
            <small>{c.created.barcodeLabel}</small>
            <code>{created.barcode || "-"}</code>
          </div>
          {created.barcode && (
            <div className="ap-created-bar">
              <BarcodeSvg value={created.barcode} height={46} />
            </div>
          )}
          <button
            type="button"
            className="ap-created-btn"
            onClick={() => navigate(ROUTES.BARCODES)}
          >
            {c.created.print}
          </button>
        </div>
      )}

      <div className="ap-card">
        <h3 className="ap-section">
          <Info size={20} className="ap-section-icon" />
          {c.basic.title}
        </h3>

        <div className="ap-grid">
          <div className="ap-field">
            <label>{c.basic.code.label}</label>
            <input
              ref={codeRef}
              className="ap-input ap-mono"
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder={c.basic.code.placeholder}
              autoComplete="off"
              autoFocus
              required
            />
          </div>

          <div className="ap-field">
            <label>{c.basic.name.label}</label>
            <input
              className="ap-input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={c.basic.name.placeholder}
              required
            />
          </div>

          <div className="ap-field">
            <label>{c.basic.category.label}</label>
            <div className="ap-select">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">{c.basic.category.placeholder}</option>
                {categories.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="ap-select-icon" />
            </div>
          </div>

          <div className="ap-field">
            <label className="ap-label-strong">{c.basic.subcategory.label}</label>
            <div className="ap-select">
              <select
                name="subcategory"
                value={form.subcategory}
                onChange={handleChange}
                disabled={!form.category}
              >
                <option value="">
                  {form.category
                    ? c.basic.subcategory.placeholder
                    : c.basic.subcategory.selectCategoryFirst}
                </option>
                {subcategories.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="ap-select-icon" />
            </div>
          </div>

          <div className="ap-field">
            <label>{c.basic.description.label}</label>
            <textarea
              className="ap-input ap-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder={c.basic.description.placeholder}
            />
          </div>
        </div>

        <hr className="ap-divider" />

        <h3 className="ap-section">
          <ListChecks size={20} className="ap-section-icon" />
          {c.details.title}
        </h3>

        <div className="ap-details">
          <div className="ap-field">
            <label>{c.details.brand.label}</label>
            <div className="ap-select">
              <select name="brand" value={form.brand} onChange={handleChange}>
                <option value="">{c.details.brand.placeholder}</option>
                {brands.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="ap-select-icon" />
            </div>
          </div>

          <div className="ap-field">
            <label>{c.details.expiry.label}</label>
            <label className="ap-check ap-check-box">
              <input
                type="checkbox"
                name="expiryTracked"
                checked={form.expiryTracked}
                onChange={handleChange}
              />
              <span>{c.details.expiry.text}</span>
            </label>
          </div>
        </div>

        <hr className="ap-divider ap-divider-2" />

        <h3 className="ap-section">
          <Banknote size={22} className="ap-section-icon" />
          {c.pricing.title}
        </h3>

        <div className="ap-pricing ap-pricing-3">
          <div className="ap-field">
            <label>{c.pricing.purchase.label}</label>
            <div className="ap-money">
              <span>₹</span>
              <input
                className="ap-input ap-mono"
                type="number"
                min="0"
                step="0.01"
                name="purchasePrice"
                value={form.purchasePrice}
                onChange={handleChange}
                placeholder={c.pricing.purchase.placeholder}
                required
              />
            </div>
          </div>

          <div className="ap-field">
            <label>{c.pricing.retail.label}</label>
            <div className="ap-money">
              <span>₹</span>
              <input
                className="ap-input ap-mono"
                type="number"
                min="0"
                step="0.01"
                name="retailPrice"
                value={form.retailPrice}
                onChange={handleChange}
                placeholder={c.pricing.retail.placeholder}
                required
              />
            </div>
          </div>

          <div className="ap-field">
            <label>{c.pricing.gst.label}</label>
            <div className="ap-select">
              <select
                name="gstRate"
                value={form.gstRate}
                onChange={handleChange}
                required
              >
                <option value="">{c.pricing.gst.placeholder}</option>
                {GST_RATES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="ap-select-icon" />
            </div>
          </div>
        </div>
      </div>

      <div className="ap-footer">
        <button
          type="button"
          className="ap-cancel"
          onClick={() => navigate(ROUTES.PRODUCTS)}
        >
          {c.cancel}
        </button>
        <button type="submit" className="ap-save" disabled={saving}>
          {saving ? c.saving : c.save}
        </button>
      </div>
    </form>
  );
};

export default AddProduct;