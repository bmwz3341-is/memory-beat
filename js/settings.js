/**
 * Memory Beat — settings screen: sound + difficulty, persisted via
 * MemoryBeatStorage (js/storage.js) so the board screen picks them up.
 */

(function () {
  'use strict';

  const state = {
    sound: window.MemoryBeatStorage.getSound(),
    difficulty: window.MemoryBeatStorage.getDifficulty(),
  };

  const el = {
    soundSwitch: document.getElementById('sound-switch'),
    difficultyGroup: document.getElementById('difficulty-group'),
  };

  function renderSettings() {
    el.soundSwitch.classList.toggle('is-on', state.sound);
    el.soundSwitch.setAttribute('aria-checked', String(state.sound));

    el.difficultyGroup.querySelectorAll('.segmented__btn').forEach((btn) => {
      btn.classList.toggle('is-selected', btn.dataset.difficulty === state.difficulty);
    });
  }

  window.MemoryBeatUI = {
    setSound(on) {
      state.sound = on;
      window.MemoryBeatStorage.setSound(on);
      renderSettings();
    },
    setDifficulty(level) {
      state.difficulty = level;
      window.MemoryBeatStorage.setDifficulty(level);
      renderSettings();
    },
  };

  el.soundSwitch.addEventListener('click', () => window.MemoryBeatUI.setSound(!state.sound));
  el.difficultyGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.segmented__btn');
    if (btn) window.MemoryBeatUI.setDifficulty(btn.dataset.difficulty);
  });

  renderSettings();
})();
