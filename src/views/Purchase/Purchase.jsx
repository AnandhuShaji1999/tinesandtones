import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Calendar, ChevronDown, Trash2 } from "lucide-react";
import { PURCHASE_CONTENT } from "../../content/purchaseContent";
import { getPurchaseOptions } from "../../services/purchaseService";
import { ROUTES } from "../../constants/routes";

const EMPTY_HEADER = { branch: "", supplier: "", billNo: "", date: "" };
const EMPTY_ENTRY = { product: "", qty: "", price: "", gst: "" };

const money = (n) =>
  `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const Purchase = () => {
  const c = PURCHASE_CONTENT;
  const navigate = useNavigate();
  const [options, setOptions] = useState(null);
  const [header, setHeader] = useState(EMPTY_HEADER);
  const [entry, setEntry] = useState(EMPTY_ENTRY);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getPurchaseOptions().then(setOptions);
  }, []);

  const handleHeader = (e) => {
    const { name, value } = e.target;
    setHeader((p) => ({ ...p, [name]: value }));
  };

  const handleEntry = (e) => {
    const { name, value } = e.target;
    setEntry((p) => ({ ...p, [name]: value }));
  };

  const handleAddItem = () => {
    const qty = Number(entry.qty);
    const price = Number(entry.price);
    const gst = Number(entry.gst || 0);
    if (!entry.product.trim() || !qty || !price) return;

    setItems((p) => [
      ...p,
      {
        id: Date.now(),
        name: entry.product.trim(),
        qty,
        price,
        gst,
        total: qty * price * (1 + gst / 100),
      },
    ]);
    setEntry(EMPTY_ENTRY);
  };

  const handleRemove = (id) => setItems((p) => p.filter((i) => i.id !== id));

  const visible = items.filter((i) =>
    i.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="pu-page">
      <h2 className="pu-title">{c.title}</h2>
      <p className="pu-subtitle">{c.subtitle}</p>

      {/* Purchase Details */}
      <div className="pu-card pu-details">
        <div className="pu-card-head">
          <h3 className="pu-card-title">{c.details.title}</h3>
          <button type="button" className="pu-blue-btn pu-add-supplier">
            <Plus size={14} />
            {c.details.addSupplier}
          </button>
        </div>

        <div className="pu-grid-2">
          <div className="f-field">
            <label>{c.details.branch}</label>
            <div className="f-control">
              <input type="text" name="branch" value={header.branch} onChange={handleHeader} />
            </div>
          </div>

          <div className="f-field">
            <label>{c.details.supplier}</label>
            <div className="f-control">
              <select name="supplier" value={header.supplier} onChange={handleHeader}>
                {(options?.suppliers || [{ value: "", label: "" }]).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="f-icon" />
            </div>
          </div>

          <div className="f-field">
            <label>{c.details.billNo}</label>
            <div className="f-control">
              <input type="text" name="billNo" value={header.billNo} onChange={handleHeader} />
            </div>
          </div>

          <div className="f-field">
            <label>{c.details.date}</label>
            <div className="f-control">
              <input
                type="date"
                name="date"
                value={header.date}
                onChange={handleHeader}
                className={header.date ? "" : "is-empty"}
              />
              <Calendar size={16} className="f-icon" />
            </div>
          </div>
        </div>
      </div>

      {/* Product */}
      <div className="pu-card pu-product">
        <h3 className="pu-card-title">{c.product.title}</h3>

        <div className="pu-toolbar">
          <div className="pu-search">
            <Search size={16} className="pu-search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={c.product.searchPlaceholder}
            />
          </div>
          <button
            type="button"
            className="pu-blue-btn pu-add-product"
            onClick={() => navigate(ROUTES.ADD_PRODUCT)}
          >
            <Plus size={14} />
            {c.product.addProduct}
          </button>
        </div>

        <div className="pu-entry">
          <div className="f-field pu-e-product">
            <label>{c.product.name}</label>
            <div className="f-control">
              <input type="text" name="product" value={entry.product} onChange={handleEntry} />
            </div>
          </div>

          <div className="f-field">
            <label>{c.product.qty}</label>
            <div className="f-control">
              <input type="number" min="0" name="qty" value={entry.qty} onChange={handleEntry} />
            </div>
          </div>

          <div className="f-field">
            <label>{c.product.price}</label>
            <div className="f-control">
              <input type="number" min="0" name="price" value={entry.price} onChange={handleEntry} />
            </div>
          </div>

          <div className="f-field">
            <label>{c.product.gst}</label>
            <div className="f-control">
              <select name="gst" value={entry.gst} onChange={handleEntry}>
                {(options?.gst || [{ value: "", label: "" }]).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="f-icon" />
            </div>
          </div>

          <button
            type="button"
            className="pu-plus"
            onClick={handleAddItem}
            aria-label="Add product"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="pu-table-card">
          <p className="pu-showing">
            Showing {visible.length ? 1 : 0}–{visible.length} of {visible.length}{" "}
            entries
          </p>

          <div className="pu-tbl-wrap">
            <table className="pu-tbl">
              <thead>
                <tr>
                  {c.columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={c.columns.length} className="pu-empty">
                      {c.empty}
                    </td>
                  </tr>
                ) : (
                  visible.map((i) => (
                    <tr key={i.id}>
                      <td className="pu-bold">{i.name}</td>
                      <td className="pu-muted">{i.qty}</td>
                      <td className="pu-muted">{money(i.price)}</td>
                      <td className="pu-muted">{i.gst}%</td>
                      <td className="pu-bold">{money(i.total)}</td>
                      <td>
                        <button
                          type="button"
                          className="sl-more"
                          aria-label="Remove"
                          onClick={() => handleRemove(i.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchase;