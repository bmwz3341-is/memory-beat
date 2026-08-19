/**
 * Memory Beat — Firebase/Firestore initialization. Loaded (after the Firebase
 * compat CDN scripts, js/firebase-config.js, and /api/firebase-config.js) on
 * any page that needs the leaderboard database: index.html (writes the score
 * on game over) and leaderboard.html (reads all scores). Exposes
 * window.MemoryBeatFirestore so those pages can get a Firestore handle
 * without each re-initializing the app.
 *
 * The actual config values come from window.MemoryBeatFirebaseConfig, set by
 * whichever of these two scripts actually loads:
 *  - js/firebase-config.js — gitignored, local-only file for opening
 *    index.html directly with no server. See js/firebase-config.example.js
 *    for the template.
 *  - /api/firebase-config.js — a Vercel serverless function (api/firebase-
 *    config.js) that reads the config from Vercel Environment Variables.
 *    This is what production (https://memory-beat.vercel.app) actually
 *    uses, since a git-based deploy never has the gitignored static file.
 * It's loaded second so it wins in production; locally without `vercel dev`
 * it 404s harmlessly and the static file's values are kept.
 */

window.MemoryBeatFirestore = (function () {
  const firebaseConfig = window.MemoryBeatFirebaseConfig;
  if (!firebaseConfig) {
    throw new Error(
      'Memory Beat: no Firebase config found. For local dev, copy js/firebase-config.example.js to js/firebase-config.js and fill it in. For the Vercel deploy, set the FIREBASE_* environment variables in the Vercel project settings.'
    );
  }

  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore(app);
  const scoresCollection = db.collection('memory-beat-scores');

  // Upserts the player's high score, keyed by their per-device player id
  // (see js/storage.js getPlayerId) so a later, better run overwrites the
  // same row instead of adding a new one.
  function saveScore({ playerId, name, avatar, score, level, duration, difficulty }) {
    return scoresCollection.doc(playerId).set({
      name,
      avatar,
      score,
      level,
      duration,
      difficulty,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  // Fetches every player's saved score for the leaderboard table.
  function fetchScores() {
    return scoresCollection.get().then((snapshot) =>
      snapshot.docs.map((doc) => doc.data())
    );
  }

  return { db, scoresCollection, saveScore, fetchScores };
})();
