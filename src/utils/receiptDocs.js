import { jsPDF } from "jspdf";
import { BILLING_CONTENT } from "../content/billingContent";
import { fmtDate } from "../models/billingModel";

const shop = BILLING_CONTENT.shop;

const num = (v) => Number(v) || 0;
const money = (v) =>
  num(v).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const totalsOf = (sale) => {
  const lines = sale.lines || [];
  return {
    subtotal: lines.reduce((a, l) => a + num(l.unitPrice) * num(l.quantity), 0),
    itemDisc: lines.reduce((a, l) => a + num(l.discount), 0),
    billDisc: num(sale.billDiscount),
  };
};

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/* ---------- HTML bill (View) ---------- */
export const buildReceiptHtml = (sale) => {
  const t = totalsOf(sale);
  const rows = (sale.lines || [])
    .map(
      (l) => `<tr>
        <td>${esc(l.name || l.sku)}${l.name && l.sku ? `<small>${esc(l.sku)}</small>` : ""}</td>
        <td>${esc(l.quantity)}</td>
        <td>${money(l.unitPrice)}</td>
        <td>${money(l.total)}</td></tr>`
    )
    .join("");

  const pays = (sale.payments || [])
    .map(
      (p) => `<div class="r"><span>${esc(p.method.toUpperCase())}${
        p.reference ? ` (${esc(p.reference)})` : ""
      }</span><b>${money(p.amount)}</b></div>`
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8">
<title>${esc(sale.invoiceNumber)}</title>
<style>
  body{margin:0;background:#eee;font-family:"Courier New",monospace;font-size:13px;color:#000}
  .box{width:300px;margin:16px auto;background:#fff;padding:16px}
  h1{margin:0;text-align:center;font-size:22px}
  .a{text-align:center;margin:0}
  hr{border:none;border-top:1px dashed #000;margin:8px 0}
  .m div,.r{display:flex;justify-content:space-between;gap:8px;padding:1px 0}
  table{width:100%;border-collapse:collapse}
  th{text-align:left;border-bottom:1px solid #000;padding:2px 0;font-size:12px}
  th:nth-child(n+2),td:nth-child(n+2){text-align:right}
  td{padding:3px 0;vertical-align:top}
  small{display:block;font-size:10px}
  .t{font-size:16px;font-weight:700;border-top:1px solid #000;margin-top:3px;padding-top:3px}
  .c{text-align:center}
  button{display:block;margin:12px auto;padding:10px 24px;font-size:14px;cursor:pointer}
  @media print{body{background:#fff}.box{margin:0;width:72mm;padding:2mm 0}button{display:none}}
</style></head><body>
<div class="box">
  <h1>${esc(shop.name)}</h1>
  ${shop.address.map((a) => `<p class="a">${esc(a)}</p>`).join("")}
  <hr>
  <div class="m">
    <div><span>Bill No</span><b>${esc(sale.invoiceNumber || "-")}</b></div>
    <div><span>Date</span><b>${esc(fmtDate(sale.date))}</b></div>
    <div><span>Customer</span><b>${esc(sale.customerName || "Walk-in")}</b></div>
  </div>
  <hr>
  <table><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <hr>
  <div class="r"><span>Subtotal</span><b>${money(t.subtotal)}</b></div>
  ${t.itemDisc > 0 ? `<div class="r"><span>Item Discount</span><b>- ${money(t.itemDisc)}</b></div>` : ""}
  ${t.billDisc > 0 ? `<div class="r"><span>Bill Discount</span><b>- ${money(t.billDisc)}</b></div>` : ""}
  <div class="r t"><span>TOTAL</span><b>${money(sale.total)}</b></div>
  <p style="text-align:right;font-size:10px;margin:2px 0">Prices include GST.</p>
  ${pays ? `<hr>${pays}` : ""}
  <hr>
  <p class="c">${esc(BILLING_CONTENT.receipt.thanks)}</p>
</div>
<button onclick="window.print()">Print</button>
</body></html>`;
};

/* ---------- PDF bill (Download) ---------- */
const W = 80;
const M = 4;

// Draws the bill and returns the final y position
const draw = (doc, sale) => {
  const t = totalsOf(sale);
  let y = 8;
  const line = () => {
    doc.setLineDashPattern([0.8, 0.8], 0);
    doc.line(M, y, W - M, y);
    doc.setLineDashPattern([], 0);
    y += 4;
  };
  const pair = (l, r, bold) => {
    doc.setFont("courier", bold ? "bold" : "normal");
    doc.text(l, M, y);
    doc.text(r, W - M, y, { align: "right" });
    y += 4.5;
  };

  doc.setFont("courier", "bold");
  doc.setFontSize(15);
  doc.text(shop.name, W / 2, y, { align: "center" });
  y += 6;

  doc.setFontSize(9);
  doc.setFont("courier", "normal");
  shop.address.forEach((a) => {
    doc.text(a, W / 2, y, { align: "center" });
    y += 4;
  });
  y += 1;
  line();

  pair("Bill No", String(sale.invoiceNumber || "-"), true);
  pair("Date", fmtDate(sale.date), false);
  pair("Customer", String(sale.customerName || "Walk-in"), false);
  line();

  doc.setFont("courier", "bold");
  doc.text("Item", M, y);
  doc.text("Qty", 46, y, { align: "right" });
  doc.text("Rate", 61, y, { align: "right" });
  doc.text("Amount", W - M, y, { align: "right" });
  y += 4.5;

  doc.setFont("courier", "normal");
  (sale.lines || []).forEach((l) => {
    const name = doc.splitTextToSize(String(l.name || l.sku || ""), 33);
    doc.text(name, M, y);
    doc.text(String(l.quantity), 46, y, { align: "right" });
    doc.text(money(l.unitPrice), 61, y, { align: "right" });
    doc.text(money(l.total), W - M, y, { align: "right" });
    y += name.length * 4;
    if (l.name && l.sku) {
      doc.setFontSize(7);
      doc.text(String(l.sku), M, y);
      doc.setFontSize(9);
      y += 3.5;
    }
    y += 1;
  });
  line();

  pair("Subtotal", money(t.subtotal), false);
  if (t.itemDisc > 0) pair("Item Discount", `- ${money(t.itemDisc)}`, false);
  if (t.billDisc > 0) pair("Bill Discount", `- ${money(t.billDisc)}`, false);
  doc.setFontSize(11);
  pair("TOTAL", money(sale.total), true);
  doc.setFontSize(9);
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.text("Prices include GST.", W - M, y, { align: "right" });
  doc.setFontSize(9);
  y += 4;

  if ((sale.payments || []).length) {
    line();
    sale.payments.forEach((p) =>
      pair(
        `${p.method.toUpperCase()}${p.reference ? ` (${p.reference})` : ""}`,
        money(p.amount),
        false
      )
    );
  }

  line();
  doc.text(BILLING_CONTENT.receipt.thanks, W / 2, y, { align: "center" });
  y += 6;
  return y;
};

export const buildReceiptPdf = (sale) => {
  // First pass measures the height, second pass draws on a page of that height
  const probe = new jsPDF({ unit: "mm", format: [W, 600] });
  const height = draw(probe, sale);
  const doc = new jsPDF({ unit: "mm", format: [W, Math.max(height, 60)] });
  draw(doc, sale);
  return doc;
};