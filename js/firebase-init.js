/**
 * Memory Beat — Firebase/Firestore initialization. Loaded (after the Firebase
 * compat CDN scripts and js/firebase-config.js) on any page that needs the
 * leaderboard database: index.html (writes the score on game over) and
 * leaderboard.html (reads all scores). Exposes window.MemoryBeatFirestore so
 * those pages can get a Firestore handle without each re-initializing the
 * app.
 *
 * The actual config values live in js/firebase-config.js, which is
 * gitignored (not committed) since it holds a live project's API key — see
 * js/firebase-config.example.js for the template new setups copy from.
 *
 * The Firebase project ("my-trivia-app-16d1e") is shared with other apps, so
 * all Memory Beat score documents live under their own top-level collection,
 * "memory-beat-scores", to avoid colliding with other apps' data.
 */

window.MemoryBeatFirestore = (function () {
  const firebaseConfig = window.MemoryBeatFirebaseConfig;
  if (!firebaseConfig) {
    throw new Error(
      'Memory Beat: js/firebase-config.js is missing. Copy js/firebase-config.example.js to js/firebase-config.js and fill in your Firebase project config.'
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
