/**
 * Memory Beat — shared localStorage access, used by board.js and settings.js
 * so both pages agree on the same keys/defaults for sound, difficulty and
 * the best score.
 */

window.MemoryBeatStorage = (function () {
  const KEYS = {
    sound: 'memoryBeat.sound',
    difficulty: 'memoryBeat.difficulty',
    best: 'memoryBeat.best',
    player: 'memoryBeat.player',
  };

  function getSound() {
    const v = localStorage.getItem(KEYS.sound);
    return v === null ? true : v === 'true';
  }
  function setSound(on) {
    localStorage.setItem(KEYS.sound, String(on));
  }

  function getDifficulty() {
    const v = localStorage.getItem(KEYS.difficulty);
    return v === 'easy' || v === 'hard' ? v : 'normal';
  }
  function setDifficulty(level) {
    localStorage.setItem(KEYS.difficulty, level);
  }

  function getBest() {
    const v = parseInt(localStorage.getItem(KEYS.best), 10);
    return Number.isFinite(v) ? v : 0;
  }
  function setBest(score) {
    localStorage.setItem(KEYS.best, String(score));
  }

  function getPlayer() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEYS.player));
      return parsed && parsed.name && parsed.avatar ? parsed : null;
    } catch {
      return null;
    }
  }
  function setPlayer(player) {
    localStorage.setItem(KEYS.player, JSON.stringify(player));
  }

  return {
    getSound, setSound,
    getDifficulty, setDifficulty,
    getBest, setBest,
    getPlayer, setPlayer,
  };
})();
