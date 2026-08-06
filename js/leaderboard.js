/**
 * Memory Beat — leaderboard screen. Placeholder rows stand in for other
 * players (no backend/accounts exist); the real player's current best,
 * from js/storage.js, is merged in and the whole list is sorted by score.
 */

(function () {
  'use strict';

  const placeholderData = [
    { name: 'דניאל', score: 42 },
    { name: 'נועה', score: 37 },
    { name: 'מאיה', score: 31 },
    { name: 'יובל', score: 28 },
    { name: 'עומר', score: 22 },
  ];

  const el = {
    table: document.getElementById('leaderboard-table'),
  };

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderRows(rows) {
    el.table.querySelectorAll('.table__row:not(.table__row--head)').forEach((row) => row.remove());

    const html = rows
      .map((row, i) => {
        const stripe = i % 2 === 0 ? 'table__row--odd' : 'table__row--even';
        return `
          <div class="table__row ${stripe}">
            <div class="table__cell">${escapeHtml(row.name)}</div>
            <div class="table__cell table__cell--score">${row.score}</div>
          </div>`;
      })
      .join('');
    el.table.querySelector('.table__row--head').insertAdjacentHTML('afterend', html);
  }

  window.MemoryBeatUI = {
    setRows: renderRows,
  };

  const rows = placeholderData.slice();
  const player = window.MemoryBeatStorage.getPlayer();
  const best = window.MemoryBeatStorage.getBest();
  if (player && best > 0) {
    rows.push({ name: `${player.avatar} ${player.name}`, score: best });
  }
  rows.sort((a, b) => b.score - a.score);

  renderRows(rows);
})();
