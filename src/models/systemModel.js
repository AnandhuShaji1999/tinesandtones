// Health: shape is not fixed, so accept common patterns
export const fromHealth = (data) => {
  const obj = data && typeof data === "object" ? data : { response: data };
  const raw = String(obj.status ?? obj.state ?? "ok").toLowerCase();
  const ok = ["ok", "healthy", "up", "pass", "success", "true"].includes(raw);
  return {
    ok,
    status: String(obj.status ?? obj.state ?? "ok"),
    raw: obj,
    checkedAt: new Date().toLocaleTimeString(),
  };
};

// Schema: JSON gives a parsed endpoint list, YAML is kept as raw text
export const fromSchema = (text) => {
  const raw = typeof text === "string" ? text : JSON.stringify(text, null, 2);
  try {
    const doc = typeof text === "string" ? JSON.parse(text) : text;
    const paths = Object.entries(doc.paths || {}).map(([path, ops]) => ({
      path,
      methods: Object.keys(ops).filter((m) =>
        ["get", "post", "put", "patch", "delete"].includes(m)
      ),
    }));
    return {
      format: "json",
      title: doc.info?.title || "API",
      version: doc.info?.version || "",
      paths,
      raw,
    };
  } catch {
    return { format: "yaml", title: "API", version: "", paths: [], raw };
  }
};