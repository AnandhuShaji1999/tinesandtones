import { BILLING_CONTENT } from "../content/billingContent";
import { fmtDate, inr } from "../models/billingModel";

// Printable bill. Shown only while printing (see .rc-print in index.css)
const Receipt = ({ sale }) => {
  const c = BILLING_CONTENT;
  const lines = sale.lines || [];

  const subtotal = lines.reduce(
    (a, l) => a + (Number(l.unitPrice) || 0) * (Number(l.quantity) || 0),
    0
  );
  const itemDisc = lines.reduce((a, l) => a + (Number(l.discount) || 0), 0);
  const billDisc = Number(sale.billDiscount) || 0;

  return (
    <div className="rc-print">
      <div className="rc-box">
        <h1 className="rc-shop">{c.shop.name}</h1>
        {c.shop.address.map((a) => (
          <p className="rc-addr" style={{ margin: 0 }} key={a}>
            {a}
          </p>
        ))}
        <hr />

        <div className="rc-meta">
          <div>
            <span>Bill No</span>
            <b>{sale.invoiceNumber || "-"}</b>
          </div>
          <div>
            <span>Date</span>
            <b>{fmtDate(sale.date)}</b>
          </div>
          <div>
            <span>Customer</span>
            <b>{sale.customerName || "Walk-in"}</b>
          </div>
        </div>
        <hr />

        <table className="rc-tbl">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={l.id || i}>
                <td>
                  {l.name || l.sku}
                  {l.name && l.sku ? <small>{l.sku}</small> : null}
                </td>
                <td>{l.quantity}</td>
                <td>{inr(l.unitPrice)}</td>
                <td>{inr(l.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />

        <div className="rc-row">
          <span>Subtotal</span>
          <b>{inr(subtotal)}</b>
        </div>
        {itemDisc > 0 && (
          <div className="rc-row">
            <span>Item Discount</span>
            <b>- {inr(itemDisc)}</b>
          </div>
        )}
        {billDisc > 0 && (
          <div className="rc-row">
            <span>Bill Discount</span>
            <b>- {inr(billDisc)}</b>
          </div>
        )}
        <div className="rc-row rc-total">
          <span>TOTAL</span>
          <b>{inr(sale.total)}</b>
        </div>
        <p className="rc-small">Prices include GST.</p>

        {sale.payments?.length > 0 && (
          <>
            <hr />
            {sale.payments.map((p, i) => (
              <div className="rc-row" key={i}>
                <span>
                  {p.method.toUpperCase()}
                  {p.reference ? ` (${p.reference})` : ""}
                </span>
                <b>{inr(p.amount)}</b>
              </div>
            ))}
          </>
        )}

        <hr />
        <p className="rc-thanks">{c.receipt.thanks}</p>
      </div>
    </div>
  );
};

export default Receipt;