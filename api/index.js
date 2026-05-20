// Placeholder. Replaced at deploy time by scripts/bundle-api.mjs (invoked
// via `npm run vercel-build`). This file exists so Vercel detects the
// serverless function at clone time — the real handler is the bundled
// version that vercel-build writes here.
module.exports = (_req, res) => {
  res.statusCode = 500;
  res.setHeader("content-type", "text/plain");
  res.end("Build did not run. Check vercel-build logs.");
};
