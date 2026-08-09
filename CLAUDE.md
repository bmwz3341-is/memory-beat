# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Memory Beat — a Simon-Says style memory game, built as static HTML/CSS/vanilla JS with no framework, bundler, or package manager. There is no build step: open `index.html` directly in a browser (or serve the folder with any static file server) to run it.

There are no tests, lint config, or npm scripts in this repo. Verify changes by opening the page in a browser and playing through the flow, not by looking for a test command.

## Pages and flow

Three plain HTML pages, each loading only the scripts it needs (via `<script>` tags, no bundling):

- `index.html` — the board/home screen (doubles as home; there is no separate landing page). Loads `js/storage.js`, `js/sound.js`, `js/profile.js`, `js/rules.js`, `js/board.js`.
- `settings.html` — sound toggle + difficulty picker. Loads `js/storage.js`, `js/settings.js`.
- `leaderboard.html` — placeholder scores merged with the real player's best. Loads `js/storage.js`, `js/leaderboard.js`.

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
- `js/leaderboard.js` — defines its own `window.MemoryBeatUI` too, again page-scoped. Merges hardcoded `placeholderData` (no backend/accounts exist, so each placeholder row hardcodes both a level and a score) with the real player's row (built from stored player + best score + best level) and sorts by score.

Note the `window.MemoryBeatUI` name is reused across `board.js`, `settings.js`, and `leaderboard.js` — each page only ever loads one of these three scripts, so there's no actual collision, but don't assume its shape is the same everywhere.

## Styling and layout notes

All styles live in one file, `css/styles.css`, shared across all three pages via the `.screen--*` sections.

- Pages are `dir="rtl"` (Hebrew UI). When aligning/positioning elements, remember `flex-start`/`flex-end` and physical left/right map according to RTL, not LTR intuition — prefer explicit `text-align: right/left` or logical properties (`margin-inline-start`) when precision matters.
- Hebrew strings in `index.html` are annotated as reconstructed from garbled/mojibake source files — if you find the original correct copy, prefer it over what's currently there.
- `.table__row` rows in the leaderboard are each an independent CSS grid (not rows of one shared grid), so column alignment across rows requires fixed-width columns rather than `auto` — an `auto` column's width is computed per-row from that row's own content and will drift out of alignment with the header row.
- The "glass" chip look (translucent white background + `backdrop-filter: blur(10px)`, used by `.profile-chip` and `.level-label`) is achieved with a specific property order: `-webkit-backdrop-filter` before the standard `backdrop-filter` — keep that order when adding similar glass elements.
- All text uses a single font, Rubik (loaded via Google Fonts `<link>` tags in each HTML page's `<head>`), set through three CSS variables in `:root` — `--font-heading`, `--font-body`, `--font-score` — that all resolve to `'Rubik', sans-serif`. Rubik was chosen because it renders both the Hebrew UI and Latin/numeric text (scores) well. Keep the Google Fonts `<link>` (with the `weight` list) in sync across all three HTML pages if it changes.
