export const SYSTEM_CONTENT = {
  title: "System Status",
  subtitle: "Check that the backend is running and view its API schema.",
  health: {
    title: "Server Health",
    check: "Check Again",
    checking: "Checking...",
    ok: "Online",
    down: "Offline",
    lastChecked: "Last checked",
  },
  schema: {
    title: "API Schema (OpenAPI)",
    load: "Load Schema",
    loading: "Loading...",
    download: "Download",
    columns: ["Endpoint", "Methods"],
    empty: "Click Load Schema to view the API endpoints.",
    yamlNote: "The schema is YAML, so it is shown as raw text.",
  },
};