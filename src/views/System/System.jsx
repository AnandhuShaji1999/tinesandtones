import { useCallback, useEffect, useState } from "react";
import { Activity, Download, FileJson, RefreshCw } from "lucide-react";
import { SYSTEM_CONTENT } from "../../content/systemContent";
import { checkHealth, loadSchema } from "../../controllers/systemController";

const System = () => {
  const c = SYSTEM_CONTENT;
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);

  const [schema, setSchema] = useState(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [schemaError, setSchemaError] = useState("");

  const runHealth = useCallback(async () => {
    setChecking(true);
    setHealth(await checkHealth());
    setChecking(false);
  }, []);

  useEffect(() => {
    runHealth();
  }, [runHealth]);

  const handleLoadSchema = async () => {
    setSchemaError("");
    setLoadingSchema(true);
    try {
      setSchema(await loadSchema());
    } catch (err) {
      setSchemaError(err.message);
    } finally {
      setLoadingSchema(false);
    }
  };

  const handleDownload = () => {
    if (!schema) return;
    const ext = schema.format === "json" ? "json" : "yaml";
    const blob = new Blob([schema.raw], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `openapi-schema.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="st-page">
      <h2 className="st-title">{c.title}</h2>
      <p className="st-subtitle">{c.subtitle}</p>

      {/* ============ Health ============ */}
      <div className="st-card">
        <div className="ut-head">
          <h3 className="st-card-title ut-title">
            <Activity size={18} />
            {c.health.title}
          </h3>
          <button
            type="button"
            className="st-reset ut-btn"
            onClick={runHealth}
            disabled={checking}
          >
            <RefreshCw size={14} />
            {checking ? c.health.checking : c.health.check}
          </button>
        </div>

        {health && (
          <>
            <div className="ut-status">
              <span className={`sl-pill ${health.ok ? "st-in" : "st-out"}`}>
                <i />
                {health.ok ? c.health.ok : c.health.down}
              </span>
              <span className="st-muted">
                {c.health.lastChecked}: {health.checkedAt}
              </span>
            </div>
            <pre className="ut-pre">{JSON.stringify(health.raw, null, 2)}</pre>
          </>
        )}
      </div>

      {/* ============ Schema ============ */}
      <div className="st-card st-list">
        <div className="ut-head">
          <h3 className="st-card-title ut-title">
            <FileJson size={18} />
            {c.schema.title}
            {schema?.version && (
              <span className="ut-ver">v{schema.version}</span>
            )}
          </h3>
          <div className="ut-btns">
            {schema && (
              <button
                type="button"
                className="st-reset ut-btn"
                onClick={handleDownload}
              >
                <Download size={14} />
                {c.schema.download}
              </button>
            )}
            <button
              type="button"
              className="st-submit ut-btn"
              onClick={handleLoadSchema}
              disabled={loadingSchema}
            >
              {loadingSchema ? c.schema.loading : c.schema.load}
            </button>
          </div>
        </div>

        {schemaError && <p className="st-msg st-error">{schemaError}</p>}

        {!schema ? (
          !schemaError && <p className="st-msg cat-note">{c.schema.empty}</p>
        ) : schema.format === "json" ? (
          <div className="st-tbl-wrap">
            <table className="st-tbl ut-tbl">
              <thead>
                <tr>
                  {c.schema.columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schema.paths.map((p) => (
                  <tr key={p.path}>
                    <td className="st-bold">{p.path}</td>
                    <td>
                      <div className="ut-methods">
                        {p.methods.map((m) => (
                          <span key={m} className={`ut-method m-${m}`}>
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <p className="st-msg cat-note">{c.schema.yamlNote}</p>
            <pre className="ut-pre ut-pre-tall">{schema.raw}</pre>
          </>
        )}
      </div>
    </div>
  );
};

export default System;