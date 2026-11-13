const TARGET = "http://34.136.24.159";

export const config = { api: { bodyParser: false } };

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, "http://localhost");
    let path = url.searchParams.get("path") || "";
    url.searchParams.delete("path");

    // Backend endpoints all end with a slash
    if (!path.endsWith("/")) path += "/";

    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers["content-length"];
    delete headers["accept-encoding"];

    const hasBody = !["GET", "HEAD"].includes(req.method);
    const body = hasBody ? await readBody(req) : undefined;

    const upstream = await fetch(`${TARGET}/${path}${url.search}`, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });

    res.status(upstream.status);
    const skip = ["content-encoding", "content-length", "transfer-encoding", "connection"];
    upstream.headers.forEach((value, key) => {
      if (!skip.includes(key)) res.setHeader(key, value);
    });

    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    res.status(502).json({ detail: "Proxy error: " + err.message });
  }
}
