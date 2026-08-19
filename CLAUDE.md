# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Memory Beat — a Simon-Says style memory game, built as static HTML/CSS/vanilla JS with no framework, bundler, or package manager. There is no build step: open `index.html` directly in a browser (or serve the folder with any static file server) to run it. The one exception is the Firebase config (see `js/firebase-init.js` below) — production (https://memory-beat.vercel.app) needs a real deploy on Vercel to serve `api/firebase-config.js`.

There are no tests, lint config, or npm scripts in this repo. Verify changes by opening the page in a browser and playing through the flow, not by looking for a test command.

## Pages and flow

Three plain HTML pages, each loading only the scripts it needs (via `<script>` tags, no bundling):

- `index.html` — the board/home screen (doubles as home; there is no separate landing page). Loads `js/storage.js`, `js/sound.js`, `js/profile.js`, `js/rules.js`, `js/board.js`, plus the Firebase scripts (see Architecture below).
- `settings.html` — sound toggle + difficulty picker. Loads `js/storage.js`, `js/settings.js`.
- `leaderboard.html` — real scores from Firestore. Loads `js/storage.js`, `js/leaderboard.js`, plus the Firebase scripts.

Navigation between pages is plain `<a href>` links — no client-side router.

## Architecture

Each JS file is an IIFE that either exposes a `window.MemoryBeatXxx` namespace or attaches listeners directly; there's no module system or import/export.

- `js/storage.js` — the only localStorage access point (`window.MemoryBeatStorage`). Keys: sound, difficulty, best score, best level, player (name+avatar). Both `board.js` and `settings.js` read/write through this so state stays consistent across pages. Best score and best level are two independent keys, set together in `endGame` — score is no longer a fixed multiple of level (see scoring below), so the level can't be derived from the score and must be persisted on its own.
- `js/board.js` — the Simon-Says game engine and board rendering for `index.html`. Defines `window.MemoryBeatUI` with the board's render API (`setLevel`, `setScore`, `setPlaying`, `setPadLit`, `showGameOver`, `hideGameOver`). Game loop: `startGame` → `nextRound` (push a random color, replay full sequence) → `playSequenceStep` (timed playback, per-difficulty timing from the `TIMING` table) → `onPadTap` (player repeats the sequence; a full correct repeat advances the round, a wrong tap calls `endGame`).
  - Scoring (`roundScore`): each completed round scores `BASE_PER_ROUND * level`, scaled by a per-difficulty multiplier (`DIFFICULTY_MULTIPLIER`), plus a speed bonus if the round was repeated faster than `FAST_MS_PER_TAP * level` (timed from when input is accepted, in `inputStartTime`). The player-facing explanation lives in the `#rules-modal` markup in `index.html` — keep it in sync if the formula changes.
  - The level label (`#level-label`) is shown/hidden by `renderBoard` (`hidden = !state.playing`): it appears only while a game is running and hides again on game over/reset. The "?" button (`#btn-rules`), by contrast, sits next to the trophy icon and is always visible — its markup has no `hidden` attribute and `board.js` never touches it.
- `js/sound.js` — Web Audio tone generation (`window.MemoryBeatSound`), one frequency per pad color plus an error tone. Every tone call checks `MemoryBeatStorage.getSound()` before playing.
- `js/profile.js` — avatar/name modal on the board screen. Forced open (no close button) on first visit when no player is saved; later reopens pre-filled with a close button.
- `js/rules.js` — wires the scoring-rules modal (open/close only). The "?" button itself is always visible and static markup — no script controls its visibility.
- `js/settings.js` — defines its own `window.MemoryBeatUI` (sound switch + difficulty segmented control), separate from `board.js`'s object of the same name — they never coexist since they're on different pages.
- `js/leaderboard.js` — defines its own `window.MemoryBeatUI` too, again page-scoped. Rows come from Firestore (`MemoryBeatFirestore.fetchScores()`, all players' saved best scores) and are sorted by score.
- `js/firebase-init.js` — initializes the Firebase compat SDK (CDN classic scripts, not the ES-module SDK, to match the no-bundler script-tag architecture) and exposes `window.MemoryBeatFirestore` (`db`, `scoresCollection`, `saveScore`, `fetchScores`). All Memory Beat score documents live in their own top-level Firestore collection, `memory-beat-scores`, keyed by a stable per-device player id (`MemoryBeatStorage.getPlayerId()`) so repeat saves update the same row — the shared Firebase project also hosts other, unrelated apps. Loaded (after the two Firebase CDN `<script>` tags) on `index.html` (saves on game over, from `board.js`'s `endGame`) and `leaderboard.html` (reads all scores). Reads its config from `window.MemoryBeatFirebaseConfig` rather than hardcoding it — throws immediately (breaking saves and the leaderboard) if neither of the two scripts below actually set it.
- `js/firebase-config.js` — gitignored, local-only static config file, for opening `index.html` directly with no server. New setups copy `js/firebase-config.example.js` (which *is* committed, with placeholder values) to `js/firebase-config.js` and fill in real values. Loaded before `js/firebase-init.js`, and before `api/firebase-config.js`, on both `index.html` and `leaderboard.html`.
- `api/firebase-config.js` — a Vercel serverless function (Node, `module.exports = (req, res) => …`) that returns the same `window.MemoryBeatFirebaseConfig = {...}` shape, but built from `process.env.FIREBASE_*` — Vercel Environment Variables set in the project dashboard, not committed anywhere. This is what production (https://memory-beat.vercel.app) actually uses: a git-based static deploy never has the gitignored `js/firebase-config.js`, so without this route (or without the env vars configured in Vercel) the site 404s on the config and `firebase-init.js` throws — this is exactly what broke saving/loading scores in production once `js/firebase-config.js` was gitignored. Loaded via an absolute `/api/firebase-config.js` `<script src>` *after* `js/firebase-config.js` on both pages, so it wins wherever it's actually served (only Vercel).

Note the `window.MemoryBeatUI` name is reused across `board.js`, `settings.js`, and `leaderboard.js` — each page only ever loads one of these three scripts, so there's no actual collision, but don't assume its shape is the same everywhere.

## Styling and layout notes

All styles live in one file, `css/styles.css`, shared across all three pages via the `.screen--*` sections.

- Pages are `dir="rtl"` (Hebrew UI). When aligning/positioning elements, remember `flex-start`/`flex-end` and physical left/right map according to RTL, not LTR intuition — prefer explicit `text-align: right/left` or logical properties (`margin-inline-start`) when precision matters.
- Hebrew strings in `index.html` are annotated as reconstructed from garbled/mojibake source files — if you find the original correct copy, prefer it over what's currently there.
- `.table__row` rows in the leaderboard are each an independent CSS grid (not rows of one shared grid), so column alignment across rows requires fixed-width columns rather than `auto` — an `auto` column's width is computed per-row from that row's own content and will drift out of alignment with the header row.
- The "glass" chip look (translucent white background + `backdrop-filter: blur(10px)`, used by `.profile-chip` and `.level-label`) is achieved with a specific property order: `-webkit-backdrop-filter` before the standard `backdrop-filter` — keep that order when adding similar glass elements.
- All text uses a single font, Rubik (loaded via Google Fonts `<link>` tags in each HTML page's `<head>`), set through three CSS variables in `:root` — `--font-heading`, `--font-body`, `--font-score` — that all resolve to `'Rubik', sans-serif`. Rubik was chosen because it renders both the Hebrew UI and Latin/numeric text (scores) well. Keep the Google Fonts `<link>` (with the `weight` list) in sync across all three HTML pages if it changes.
