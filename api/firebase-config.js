/**
 * Memory Beat — serves the Firebase client config as a JS file, sourced from
 * Vercel Environment Variables (Project Settings > Environment Variables),
 * never committed to git. Loaded via <script src="/api/firebase-config.js">
 * in index.html and leaderboard.html, before js/firebase-init.js, which
 * reads window.MemoryBeatFirebaseConfig.
 *
 * A plain static js/firebase-config.js (see js/firebase-config.example.js)
 * doesn't work here: it's gitignored, so a git-based deploy (this app is on
 * Vercel) never has it — that's what broke saving/loading scores in
 * production. An API route reading process.env is Vercel's real equivalent
 * of env-var injection for a static, no-bundler site.
 */

module.exports = (req, res) => {
  const config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };

  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.status(200).send(`window.MemoryBeatFirebaseConfig = ${JSON.stringify(config)};`);
};
