const num = (v) => Number(v) || 0;

export const fromDashboard = (d = {}) => ({
  netSales: d.net_sales ?? "0.00",
  grossSales: d.gross_sales ?? "0.00",
  exchangeReturns: d.exchange_returns ?? "0.00",
  discounts: d.discounts ?? "0.00",
  salesCount: num(d.sales_count),
  itemsSold: num(d.items_sold),
  outOfStock: num(d.out_of_stock),
  lowStock: num(d.low_stock),
  stockLossUnits: num(d.stock_loss_units),
  stores: (d.store_performance || []).map((s) => ({
    branch: String(s.branch ?? ""),
    name: s.name || `Branch ${s.branch}`,
    netSales: num(s.net_sales),
  })),
  bills: (d.recent_bills || []).map((b) => ({
    id: b.id,
    invoice: b.invoice_number || "",
    branch: String(b.branch ?? ""),
    total: b.total ?? "",
    date: b.created_at || "",
  })),
});

// Empty values are not sent
export const toDashboardParams = ({ branch, from, to }) => {
  const p = {};
  if (branch) p.branch = branch;
  if (from) p.date_from = from;
  if (to) p.date_to = to;
  return p;
};