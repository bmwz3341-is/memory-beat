/**
 * Memory Beat — leaderboard screen. Rows come from Firestore (all players'
 * saved best scores, js/firebase-init.js fetchScores) — no more placeholder
 * or locally-merged data, since every player's best is now saved to
 * Firestore from js/board.js on game over.
 */

(function () {
  'use strict';

  const difficultyLabels = { easy: 'קל', normal: 'רגיל', hard: 'קשה' };
  const difficultyRank = { easy: 0, normal: 1, hard: 2 };

  const el = {
    table: document.getElementById('leaderboard-table'),
    filterDuration: document.getElementById('btn-filter-duration'),
    filterDifficulty: document.getElementById('btn-filter-difficulty'),
  };

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDuration(durationMs) {
    if (!Number.isFinite(durationMs) || durationMs <= 0) return '—';
    const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function renderRows(rows) {
    el.table.querySelectorAll('.table__row:not(.table__row--head)').forEach((row) => row.remove());

    const html = rows
      .map((row, i) => {
        const stripe = i % 2 === 0 ? 'table__row--odd' : 'table__row--even';
        const displayName = row.avatar ? `${row.avatar} ${row.name}` : row.name;
        return `
          <div class="table__row ${stripe}">
            <div class="table__cell">${escapeHtml(displayName)}</div>
              <div class="table__cell">${difficultyLabels[row.difficulty] || difficultyLabels.normal}</div>
            <div class="table__cell">${formatDuration(row.duration)}</div>
            <div class="table__cell">${row.level}</div>
            <div class="table__cell table__cell--score">${row.score}</div>
          </div>`;
      })
      .join('');
    el.table.querySelector('.table__row--head').insertAdjacentHTML('afterend', html);
  }

  window.MemoryBeatUI = {
    setRows: renderRows,
  };

  let rows = [];
  let durationSortDirection = 0;
  let difficultySortDirection = 0;

  function renderSortedRows() {
    const sortedRows = rows.slice();
    if (difficultySortDirection !== 0) {
      sortedRows.sort((a, b) => (difficultyRank[a.difficulty] - difficultyRank[b.difficulty]) * difficultySortDirection);
    } else if (durationSortDirection === 0) {
      sortedRows.sort((a, b) => b.score - a.score);
    } else {
      sortedRows.sort((a, b) => (a.duration - b.duration) * durationSortDirection);
    }
    renderRows(sortedRows);
    el.filterDuration.setAttribute('aria-pressed', String(durationSortDirection !== 0));
    el.filterDifficulty.setAttribute('aria-pressed', String(difficultySortDirection !== 0));
    el.filterDuration.setAttribute('aria-label', durationSortDirection === 1
      ? 'זמן המשחק, ממויין מהקצר לארוך'
      : durationSortDirection === -1
        ? 'זמן המשחק, ממויין מהארוך לקצר'
        : 'סינון לפי זמן המשחק');
    el.filterDifficulty.setAttribute('aria-label', difficultySortDirection === 1
      ? 'רמת הקושי, ממויינת מקל לקשה'
      : difficultySortDirection === -1
        ? 'רמת הקושי, ממויינת מקשה לקל'
        : 'סינון לפי רמת הקושי');
  }

  el.filterDuration.addEventListener('click', () => {
    difficultySortDirection = 0;
    durationSortDirection = durationSortDirection === 1 ? -1 : 1;
    renderSortedRows();
  });

  el.filterDifficulty.addEventListener('click', () => {
    durationSortDirection = 0;
    difficultySortDirection = difficultySortDirection === 1 ? -1 : 1;
    renderSortedRows();
  });

  function setStatusMessage(text) {
    el.table.querySelectorAll('.table__row:not(.table__row--head)').forEach((row) => row.remove());
    const existing = el.table.querySelector('.table__status');
    if (existing) existing.remove();
    if (!text) return;
    el.table.insertAdjacentHTML('beforeend', `<p class="table__status">${escapeHtml(text)}</p>`);
  }

  setStatusMessage('טוען נתונים…');

  window.MemoryBeatFirestore.fetchScores()
    .then((scores) => {
      rows = scores;
      setStatusMessage(null);
      renderSortedRows();
    })
    .catch((err) => {
      console.error('Memory Beat: failed to load leaderboard scores from Firestore', err);
      setStatusMessage('אירעה שגיאה בטעינת טבלת התוצאות');
    });
})();
